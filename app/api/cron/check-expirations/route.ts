import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(req: NextRequest) {
  try {
    // 1. Obter configurações
    const { data: settings } = await supabaseAdmin
      .from("system_settings")
      .select("n8n_webhook_vencimento, dias_vencimento")
      .eq("id", SETTINGS_ID)
      .single();

    if (!settings?.n8n_webhook_vencimento) {
      return NextResponse.json({ message: "Webhook de vencimento não configurado." }, { status: 400 });
    }

    const maxDays = settings.dias_vencimento || 5;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Buscar documentos elegíveis (que têm vencimento, e ainda não foram notificados)
    const { data: documents, error } = await supabaseAdmin
      .from("pdf_extractions")
      .select("id, filename, user_id, data_json")
      .not("data_json->data_vencimento", "is", null);

    if (error) {
      console.error("Erro ao buscar documentos:", error);
      return NextResponse.json({ error: "Erro ao buscar documentos" }, { status: 500 });
    }

    const notified: string[] = [];
    const failed: string[] = [];

    // 3. Processar cada documento
    for (const doc of documents || []) {
      const dataVencimentoStr = doc.data_json?.data_vencimento;
      const alreadyNotified = doc.data_json?.notification_sent_at;
      
      if (!dataVencimentoStr || alreadyNotified) continue;

      // Parse DD/MM/YYYY
      const parts = dataVencimentoStr.split("/");
      if (parts.length !== 3) continue;

      const vDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      if (isNaN(vDate.getTime())) continue;

      vDate.setHours(0, 0, 0, 0);

      // Calcular diferença em dias
      const diffTime = vDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Se passou da data ou está a menos de X dias do vencimento
      if (diffDays <= maxDays) {
        // Disparar Webhook
        try {
          const res = await fetch(settings.n8n_webhook_vencimento, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: doc.id,
              filename: doc.filename,
              vencimento: dataVencimentoStr,
              dias_restantes: diffDays,
              vencido: diffDays < 0,
              user_id: doc.user_id,
              metadata: doc.data_json
            })
          });

          if (res.ok) {
            // Atualizar o JSON com a flag de envio
            const updatedJson = { ...doc.data_json, notification_sent_at: new Date().toISOString() };
            await supabaseAdmin
              .from("pdf_extractions")
              .update({ data_json: updatedJson })
              .eq("id", doc.id);

            notified.push(doc.filename);
          } else {
            failed.push(doc.filename);
          }
        } catch (err) {
          console.error(`Erro ao notificar doc ${doc.id}:`, err);
          failed.push(doc.filename);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Varredura de vencimentos concluída.",
      notificados: notified.length,
      falhas: failed.length,
      detalhes: notified
    });

  } catch (error: any) {
    console.error("Critical Cron Error:", error);
    return NextResponse.json({ error: "Erro interno no processamento de vencimentos." }, { status: 500 });
  }
}
