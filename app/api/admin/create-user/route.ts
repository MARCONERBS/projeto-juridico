import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // 1. Validar request
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    // 2. Extrair cabeçalho de autenticação para validar se quem está chamando é Admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Checar de fato a role no banco
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Somente administradores podem criar novos usuários" }, { status: 403 });
    }

    // 3. Criar usuário no Supabase Auth usando o Admin API (Bypasses email confirmation)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (!newUser.user) {
      return NextResponse.json({ error: "Falha desconhecida ao criar usuário" }, { status: 500 });
    }

    // 4. Inserir explicitly profile caso não exista trigger no banco
    const targetRole = role === "admin" ? "admin" : "user";
    const { error: profileError } = await supabaseAdmin.from("profiles").insert([
      { id: newUser.user.id, email, role: targetRole }
    ]);

    if (profileError) {
      console.error("Falha ao criar o profile, porém auth criado:", profileError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        role: targetRole,
      }
    });

  } catch (error: any) {
    console.error("Route Error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
