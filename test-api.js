const fs = require('fs');

async function testText() {
  console.log("=== TESTE 1: Arquivo de Texto ===");
  const fileBuf = fs.readFileSync("c:\\Users\\Marcone\\Desktop\\Projeto_Juriridico\\test.txt");
  const blob = new Blob([fileBuf], { type: "text/plain" });
  const formData = new FormData();
  formData.append("file", blob, "test.txt");

  try {
    const res = await fetch("http://localhost:3000/api/extract", { method: "POST", body: formData });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Text:", data.text?.substring(0, 100));
    console.log("Filename:", data.filename);
    console.log("Saved to DB?:", data.saved);
    if (data.dbError) console.log("DB Error:", data.dbError);
    if (data.error) console.log("Error:", data.message);
  } catch (e) { console.error("Fetch error:", e); }
}

async function testPdf() {
  console.log("\n=== TESTE 2: Arquivo PDF (se existir) ===");
  // Procurar por qualquer PDF na pasta
  const files = fs.readdirSync("c:\\Users\\Marcone\\Desktop\\Projeto_Juriridico");
  const pdfFile = files.find(f => f.endsWith('.pdf'));
  
  if (!pdfFile) {
    console.log("Nenhum PDF encontrado na raiz do projeto. Teste de PDF ignorado.");
    return;
  }
  
  const fileBuf = fs.readFileSync("c:\\Users\\Marcone\\Desktop\\Projeto_Juriridico\\" + pdfFile);
  const blob = new Blob([fileBuf], { type: "application/pdf" });
  const formData = new FormData();
  formData.append("file", blob, pdfFile);

  try {
    const res = await fetch("http://localhost:3000/api/extract", { method: "POST", body: formData });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Pages:", data.numpages);
    console.log("Text preview:", data.text?.substring(0, 200));
    if (data.error) console.log("Error:", data.message);
  } catch (e) { console.error("Fetch error:", e); }
}

(async () => {
  await testText();
  await testPdf();
  console.log("\nTestes finalizados.");
})();
