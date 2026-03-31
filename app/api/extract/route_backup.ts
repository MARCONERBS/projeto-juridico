import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

// Forçamos uma atualização do módulo para corrigir o erro de import da v2.4.5
export async function POST(req: NextRequest) {

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Converta o arquivo para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Verifique o tipo de arquivo
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      const info = await parser.getInfo();
      
      return NextResponse.json({
        text: result.text,
        info: info.info,
        metadata: info.metadata,
        numpages: result.total,
        filename: file.name,
      });
    } else {

      // Se for um arquivo de texto simples
      const text = buffer.toString("utf-8");
      return NextResponse.json({
        text: text,
        filename: file.name,
      });
    }
  } catch (error: any) {
    console.error("Erro na extração:", error);
    return NextResponse.json(
      { error: "Falha ao extrair texto do documento", details: error.message },
      { status: 500 }
    );
  }
}
