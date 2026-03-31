import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

// Auxiliar para verificar se o usuário é admin
async function isAdmin(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return false;

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) return false;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin";
}

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .select("*")
      .eq("id", SETTINGS_ID)
      .single();

    if (error && error.code !== "PGRST116") { // Ignore record not found error, use defaults
      console.error("Error fetching settings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: data || {} });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { gemini_api_key, n8n_webhook, n8n_webhook_vencimento, dias_vencimento } = await req.json();

    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .upsert({
        id: SETTINGS_ID,
        gemini_api_key,
        n8n_webhook,
        n8n_webhook_vencimento,
        dias_vencimento: parseInt(dias_vencimento) || 5,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error("Error updating settings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
