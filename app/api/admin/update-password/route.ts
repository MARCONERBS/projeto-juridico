import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // 1. Validar request
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ error: "ID de usuário e nova senha são obrigatórios" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 });
    }

    // 2. Extrair cabeçalho de autenticação para validar se quem está chamando é Admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: adminUser }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !adminUser) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Checar de fato a role no banco
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", adminUser.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Somente administradores podem alterar senhas" }, { status: 403 });
    }

    // 3. Atualizar usuário no Supabase Auth usando o Admin API
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Senha atualizada com sucesso"
    });

  } catch (error: any) {
    console.error("Route Error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
