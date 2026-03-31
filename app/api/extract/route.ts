import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai"; 

export const runtime = "nodejs";

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // 1. Recuperar configurações globais do banco (FALLBACK)
    const { data: globalSettings, error: settingsError } = await supabaseAdmin
      .from("system_settings")
      .select("gemini_api_key, n8n_webhook")
      .eq("id", SETTINGS_ID)
      .single();
      
    if (settingsError) {
      console.warn("Aviso: Falha ao buscar chaves no banco de dados:", settingsError.message);
    }

    const geminiKey = (formData.get("geminiApiKey") as string) || globalSettings?.gemini_api_key || process.env.GEMINI_API_KEY;
    const n8nWebhook = (formData.get("n8nWebhook") as string) || globalSettings?.n8n_webhook;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name;
    const fileType = file.type;
    
    // Texto pré-extraído pelo navegador (mais rápido e seguro no Vercel)
    let extractedText = (formData.get("extractedText") as string) || "";

    // Processamento Assíncrono para rodar por trás
    const backgroundTask = async () => {
      try {
        let pageCount = parseInt(formData.get("pageCount") as string) || null;
        
        // Se o texto não veio pronto, tentamos extrair no servidor (fallback)
        if (!extractedText) {
          if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
          // @ts-ignore
          const workerModule = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
          (globalThis as any).pdfjsWorker = workerModule;

          // @ts-ignore
          const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

          const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(buffer),
            useSystemFonts: true,
            disableFontFace: true,
            verbosity: 0,
          } as any);

          const doc = await loadingTask.promise;
          pageCount = doc.numPages;
          const textParts: string[] = [];

          for (let i = 1; i <= pageCount; i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
              .filter((item: any) => "str" in item)
              .map((item: any) => item.str)
              .join(" "); 
            textParts.push(pageText);
            page.cleanup();
          }

          await doc.destroy();
          extractedText = textParts.join("\n\n").trim();
          
          if (!extractedText || extractedText.length < 50) {
            if (geminiKey) {
              console.log("Iniciando extração com IA (Gemini 1.5)...");
              const genAI = new GoogleGenerativeAI(geminiKey);
              const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
              
              const result = await model.generateContent([
                "Extraia e transcreva integralmente todo o texto útil, parágrafos e tabelas deste documento PDF escaneado. Retorne apenas o texto extraído de forma limpa, sem comentários adicionais.",
                { inlineData: { data: buffer.toString('base64'), mimeType: 'application/pdf' } }
              ]);
              
              extractedText = result.response.text() || "";
            } else {
               console.log("PDF escaneado, mas nenhuma chave configurada.");
            }
          }
          }
        } else if (!extractedText) {
          extractedText = buffer.toString("utf-8");
        }

        const userEmail = formData.get("userEmail") as string;

        if (userId && userEmail) {
          await supabaseAdmin.from("profiles").upsert(
            { id: userId, email: userEmail, role: "user" },
            { onConflict: 'id', ignoreDuplicates: true }
          );
        }

        let dataEmissao = null;
        let dataVencimento = null;
        
        if (geminiKey && extractedText && extractedText.length > 10) {
          try {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(`Analise detalhadamente o texto do documento a seguir e encontre as exatas Data de Emissão e Data de Vencimento.\nResponda ESTRITAMENTE em formato JSON usando as chaves "data_emissao" e "data_vencimento".\nFormato exato de data: "DD/MM/YYYY".\nTexto:\n${extractedText.substring(0, 25000)}`);
            let rawJson = result.response.text();
            
            if (rawJson.includes("\`\`\`")) {
              rawJson = rawJson.replace(/(((^```(json)?\\s*))|(\\s*```$))/gm, "").trim();
              rawJson = rawJson.replace(/^```json/, '').replace(/```$/, '').trim();
            }

            const parsedData = JSON.parse(rawJson);
            dataEmissao = parsedData.data_emissao || null;
            dataVencimento = parsedData.data_vencimento || null;
          } catch (metaErr) {
             console.warn("Aviso: Falha ao extrair metadados com IA: ", metaErr);
          }
        }

        let publicFileUrl = null;
        try {
          await supabaseAdmin.storage.createBucket("documents", { public: true }).catch(() => {});
          const storageFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
          const { data: uploadData } = await supabaseAdmin.storage
            .from("documents")
            .upload(storageFileName, buffer, { contentType: fileType || "application/pdf" });

          if (uploadData?.path) {
            const { data: urlData } = supabaseAdmin.storage.from("documents").getPublicUrl(uploadData.path);
            publicFileUrl = urlData.publicUrl;
          }
        } catch (e) {}

        const insertPayload: any = {
          filename: fileName,
          status: "completed",
          data_json: { 
            text: extractedText, 
            numpages: pageCount, 
            user_email: userEmail, 
            file_url: publicFileUrl,
            data_emissao: dataEmissao,
            data_vencimento: dataVencimento
          },
        };
        
        if (userId) {
          insertPayload.user_id = userId;
        }

        const { data: dbRecord, error: dbError } = await supabaseAdmin
          .from("pdf_extractions")
          .insert([insertPayload])
          .select()
          .single();

        if (n8nWebhook && !dbError) {
          try {
            await fetch(n8nWebhook, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: dbRecord?.id,
                filename: fileName,
                numpages: pageCount,
                text: extractedText,
                status: "extracted",
                timestamp: new Date().toISOString(),
                user_id: userId
              })
            });
          } catch (e) {}
        }
      } catch (err) {
        console.error("Erro no processamento background:", err);
      }
    };

    // Inicia a extração por trás e garante que o Vercel espere o término
    import("@vercel/functions").then(({ waitUntil }) => {
      waitUntil(backgroundTask());
    }).catch(() => {
      // Fallback local se não estiver na Vercel
      backgroundTask().catch(console.error);
    });

    return NextResponse.json({
      success: true,
      message: "Upload recebido! Processando arquivo em segundo plano.",
      filename: fileName,
      isBackground: true
    });
  } catch (error: any) {
    console.error("Erro detalhado na extração:", error);
    return NextResponse.json(
      { error: "Falha ao extrair texto do documento", message: error.message },
      { status: 500 }
    );
  }
}
