// Test pdf-parse
const fs = require('fs');

async function testPdf() {
  try {
    const pdfUrl = "c:\\Users\\Marcone\\Desktop\\Projeto_Juriridico\\test.txt"; 
    // Wait we need a dummy pdf to test pdf-parse, but the error likely happens when importing or initializing
    const pdfParse = require('pdf-parse');
    console.log("pdf-parse default export type:", typeof pdfParse);
    console.log("pdf-parse keys:", Object.keys(pdfParse));
    
    // Test dynamic import
    const m = await import('pdf-parse');
    console.log("esm default export type:", typeof m.default);
    console.log("esm keys:", Object.keys(m));
  } catch (e) {
    console.error("Test error:", e);
  }
}

testPdf();
