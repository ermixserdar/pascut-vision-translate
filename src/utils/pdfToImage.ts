
import { getDocument } from 'pdfjs-dist';

export const convertPdfToImage = async (file: File): Promise<string> => {
  try {
    console.log('Converting PDF to image...');
    
    // PDF.js worker'ını fonksiyon içinde ayarla
    if (typeof window !== 'undefined') {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    
    console.log('PDF loaded, pages:', pdf.numPages);
    
    // İlk sayfayı al
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 });
    
    // Canvas oluştur
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Canvas context not available');
    }
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // PDF sayfasını canvas'a render et
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    
    // Canvas'ı JPEG base64'e dönüştür
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    const base64Data = base64.split(',')[1];
    
    console.log('PDF converted to JPEG image');
    return base64Data;
    
  } catch (error) {
    console.error('PDF to image conversion error:', error);
    throw new Error('PDF görüntüye dönüştürülemedi');
  }
};
