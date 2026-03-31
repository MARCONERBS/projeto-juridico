const fs = require('fs');

async function analyze() {
  const filePath = 'c:\\Users\\Marcone\\Desktop\\Projeto_Juriridico\\doc03705420240228155013.pdf';
  console.log("Analyzing file:", filePath);
  
  if (!fs.existsSync(filePath)) {
    console.log("File not found!");
    return;
  }
  
  const buffer = fs.readFileSync(filePath);
  
  // Try using pdfjs-dist matching the backend
  try {
    const workerModule = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
    globalThis.pdfjsWorker = workerModule;
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      disableFontFace: true,
      verbosity: 0,
    });

    const doc = await loadingTask.promise;
    console.log("Pages:", doc.numPages);
    
    let totalTextLength = 0;
    
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      
      // Check for text
      const content = await page.getTextContent();
      const textItems = content.items.filter(item => "str" in item);
      const text = textItems.map(item => item.str).join(" ");
      
      // Check for operators to see if there are images
      const opList = await page.getOperatorList();
      let hasImages = false;
      for (let j = 0; j < opList.fnArray.length; j++) {
        const fn = opList.fnArray[j];
        if (fn === pdfjsLib.OPS.paintImageXObject || 
            fn === pdfjsLib.OPS.paintInlineImageXObject) {
          hasImages = true;
          break;
        }
      }
      
      console.log(`Page ${i}: Found ${textItems.length} text items (${text.length} chars). Has Images: ${hasImages}`);
      if (text.trim().length > 0) {
        console.log(`--- Page ${i} Sample Text ---`);
        console.log(text.substring(0, 150));
        console.log(`-----------------------------`);
      }
      totalTextLength += text.trim().length;
      page.cleanup();
    }
    
    await doc.destroy();
    
    console.log("\n--- Conclusion ---");
    if (totalTextLength === 0) {
      console.log("This PDF contains NO TEXT. It is likely a scanned image.");
      console.log("To extract text from this, you MUST use an OCR (Optical Character Recognition) service.");
    } else {
      console.log(`The PDF contains text (${totalTextLength} characters). If it wasn't extracting, it was a bug in the code.`);
    }

  } catch (e) {
    console.error("Error analyzing PDF:", e);
  }
}

analyze();
