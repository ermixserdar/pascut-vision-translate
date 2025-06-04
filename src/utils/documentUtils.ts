
export const extractTextFromDocument = async (file: File): Promise<string> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'text/plain') {
    return await extractTextFromTxt(file);
  } else if (fileType === 'application/pdf') {
    // PDF için metin çıkarma (PDF çeviri sekmesindeki yöntemi kullan)
    return await extractTextFromPdf(file);
  } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    return await extractTextFromWord(file);
  } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
    return await extractTextFromExcel(file);
  } else {
    throw new Error('Desteklenmeyen dosya formatı');
  }
};

const extractTextFromTxt = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      resolve(text);
    };
    reader.onerror = () => reject(new Error('TXT dosyası okunamadı'));
    reader.readAsText(file, 'utf-8');
  });
};

const extractTextFromPdf = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // PDF'den metin çıkarma için basit bir yaklaşım
        const text = await convertPdfToText(uint8Array);
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('PDF okuma hatası'));
    reader.readAsArrayBuffer(file);
  });
};

const convertPdfToText = async (pdfData: Uint8Array): Promise<string> => {
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(pdfData);
  
  // PDF'den basit metin çıkarma (stream objelerini arar)
  const textRegex = /\((.*?)\)/g;
  const matches = text.match(textRegex);
  
  if (matches) {
    return matches
      .map(match => match.slice(1, -1))
      .filter(text => text.length > 2)
      .join(' ');
  }
  
  throw new Error('PDF\'den metin çıkarılamadı');
};

const extractTextFromWord = async (file: File): Promise<string> => {
  // Word dosyası için basit metin çıkarma
  // Gerçek uygulamada mammoth.js gibi bir kütüphane kullanılabilir
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        const decoder = new TextDecoder('utf-8');
        let text = decoder.decode(uint8Array);
        
        // Basit metin temizleme
        text = text.replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ' ');
        text = text.replace(/\s+/g, ' ').trim();
        
        if (text.length < 10) {
          throw new Error('Word dosyasından yeterli metin çıkarılamadı');
        }
        
        resolve(text);
      } catch (error) {
        reject(new Error('Word dosyası işlenemedi'));
      }
    };
    reader.onerror = () => reject(new Error('Word dosyası okunamadı'));
    reader.readAsArrayBuffer(file);
  });
};

const extractTextFromExcel = async (file: File): Promise<string> => {
  // Excel dosyası için basit metin çıkarma
  // Gerçek uygulamada xlsx.js gibi bir kütüphane kullanılabilir
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        const decoder = new TextDecoder('utf-8');
        let text = decoder.decode(uint8Array);
        
        // Excel için basit metin çıkarma
        text = text.replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ' ');
        text = text.replace(/\s+/g, ' ').trim();
        
        if (text.length < 10) {
          throw new Error('Excel dosyasından yeterli metin çıkarılamadı');
        }
        
        resolve(text);
      } catch (error) {
        reject(new Error('Excel dosyası işlenemedi'));
      }
    };
    reader.onerror = () => reject(new Error('Excel dosyası okunamadı'));
    reader.readAsArrayBuffer(file);
  });
};
