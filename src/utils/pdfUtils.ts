
export const extractTextFromPdf = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // PDF'den metin çıkarma için basit bir yaklaşım
        // Gerçek uygulamada pdf-lib veya benzeri bir kütüphane kullanılabilir
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

// Basit PDF metin çıkarma fonksiyonu
const convertPdfToText = async (pdfData: Uint8Array): Promise<string> => {
  // Bu basit bir implementasyon. Gerçek projede pdf-parse veya benzeri kullanın
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
