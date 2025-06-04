import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { DocumentUpload } from './DocumentUpload';
import { LanguageSelector } from './LanguageSelector';
import { TranslateResult } from './TranslateResult';
import { TextInput } from './TextInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, FileImage, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { extractTextFromDocument } from '@/utils/documentUtils';
import { convertPdfToImage } from '@/utils/pdfToImage';

const LANGUAGES = [
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
];

export const TranslateForm = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('tr');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOCR = async (file: File) => {
    setIsLoading(true);
    try {
      console.log('Starting OCR for file:', file.name, 'Type:', file.type);
      
      let base64Image: string;
      
      if (file.type === 'application/pdf') {
        console.log('Processing PDF, converting to image first...');
        base64Image = await convertPdfToImage(file);
      } else {
        console.log('Processing image file...');
        base64Image = await convertFileToBase64(file);
      }
      
      console.log('File converted to base64, length:', base64Image.length);

      // OCR işlemi
      console.log('Starting OCR with vision model...');
      const ocrResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2-vision',
          prompt: 'Extract all text from this image. Only return the extracted text, nothing else.',
          images: [base64Image],
          stream: false
        })
      });

      console.log('OCR response status:', ocrResponse.status);
      if (!ocrResponse.ok) {
        const errorText = await ocrResponse.text();
        console.error('OCR response error:', errorText);
        throw new Error('OCR işlemi başarısız');
      }

      const ocrData = await ocrResponse.json();
      const extractedText = ocrData.response;
      
      setSourceText(extractedText);
      toast({
        title: "OCR Başarılı",
        description: file.type === 'application/pdf' ? "PDF'den metin başarıyla çıkarıldı" : "Görüntüden metin başarıyla çıkarıldı",
      });
    } catch (error) {
      console.error('OCR error:', error);
      toast({
        title: "OCR Hatası",
        description: error instanceof Error ? error.message : "OCR işlemi başarısız",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocument = async (file: File) => {
    setIsLoading(true);
    try {
      const extractedText = await extractTextFromDocument(file);
      
      if (!extractedText.trim()) {
        throw new Error('Dosyadan metin çıkarılamadı');
      }
      
      setSourceText(extractedText);
      toast({
        title: "Döküman İşlendi",
        description: "Metin başarıyla dosyadan çıkarıldı",
      });
    } catch (error) {
      console.error('Document processing error:', error);
      toast({
        title: "Döküman Hatası",
        description: error instanceof Error ? error.message : "Dosya işlenemedi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen çevrilecek metni girin",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const sourceLangName = LANGUAGES.find(l => l.code === sourceLang)?.name || 'auto-detect language';
      const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || 'Turkish';

      const systemPrompt = "You are a professional translator with expertise in multiple languages. Your task is to provide accurate, formal, and professional translations while maintaining the original meaning and context. Always use formal language and professional terminology appropriate for business or academic settings.";

      const prompt = sourceLang === 'auto' 
        ? `${systemPrompt}\n\nTranslate the following text to ${targetLangName} using formal and professional language. Only return the translation, nothing else:\n\n${sourceText}`
        : `${systemPrompt}\n\nTranslate the following text from ${sourceLangName} to ${targetLangName} using formal and professional language. Only return the translation, nothing else:\n\n${sourceText}`;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2-vision',
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Çeviri işlemi başarısız');
      }

      const data = await response.json();
      setTranslatedText(data.response);
      
      toast({
        title: "Çeviri Başarılı",
        description: "Metin başarıyla çevrildi",
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Çeviri Hatası",
        description: "Ollama bağlantısını kontrol edin (localhost:11434)",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('Converting image file to base64:', file.type);
      
      // Sadece görüntü dosyaları için canvas kullanarak JPEG formatına dönüştür
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          
          // Görüntüyü uygun boyuta getir
          const maxSize = 1024;
          let { width, height } = img;
          
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Görüntüyü canvas'a çiz
          ctx.drawImage(img, 0, 0, width, height);
          
          // JPEG formatında base64'e dönüştür
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          const base64Data = base64.split(',')[1];
          console.log('Image converted to JPEG base64');
          resolve(base64Data);
        } catch (error) {
          console.error('Image conversion error:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('Image load error:', error);
        reject(new Error('Görüntü yüklenemedi'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const getDisplayName = (langCode: string) => {
    const langMap: { [key: string]: string } = {
      'tr': 'Türkçe',
      'en': 'English',
      'fr': 'Français',
      'de': 'Deutsch',
      'ro': 'Română',
      'auto': 'Otomatik Algıla'
    };
    return langMap[langCode] || langCode;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Metin Çeviri
          </TabsTrigger>
          <TabsTrigger value="ocr" className="flex items-center gap-2">
            <FileImage className="w-4 h-4" />
            OCR Çeviri
          </TabsTrigger>
          <TabsTrigger value="document" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Döküman Çeviri
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-6">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-blue-200">
            <div className="grid md:grid-cols-2 gap-6">
              <LanguageSelector
                languages={[{ code: 'auto', name: 'Auto-detect', flag: '🌐' }, ...LANGUAGES]}
                value={sourceLang}
                onChange={setSourceLang}
                label="Kaynak Dil"
              />
              <LanguageSelector
                languages={LANGUAGES}
                value={targetLang}
                onChange={setTargetLang}
                label="Hedef Dil"
              />
            </div>
          </Card>

          <Card className="p-6 bg-white/70 backdrop-blur-sm border-yellow-200">
            <TextInput
              value={sourceText}
              onChange={setSourceText}
              placeholder="Çevrilecek metni buraya yazın..."
              label="Kaynak Metin"
            />
          </Card>

          <div className="text-center">
            <Button
              onClick={handleTranslate}
              disabled={isLoading || !sourceText.trim()}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 hover:from-blue-600 hover:via-yellow-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isLoading ? 'Çevriliyor...' : 'Çevir'}
            </Button>
          </div>

          {translatedText && (
            <TranslateResult
              text={translatedText}
              language={getDisplayName(targetLang)}
              sourceLang={sourceLang}
              targetLang={targetLang}
            />
          )}
        </TabsContent>

        <TabsContent value="ocr" className="space-y-6">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-blue-200">
            <div className="grid md:grid-cols-2 gap-6">
              <LanguageSelector
                languages={[{ code: 'auto', name: 'Auto-detect', flag: '🌐' }, ...LANGUAGES]}
                value={sourceLang}
                onChange={setSourceLang}
                label="Kaynak Dil"
              />
              <LanguageSelector
                languages={LANGUAGES}
                value={targetLang}
                onChange={setTargetLang}
                label="Hedef Dil"
              />
            </div>
          </Card>

          <FileUpload
            onFileSelect={handleOCR}
            isLoading={isLoading}
          />

          {sourceText && (
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-yellow-200">
              <TextInput
                value={sourceText}
                onChange={setSourceText}
                placeholder="OCR ile çıkarılan metin..."
                label="Çıkarılan Metin"
              />
            </Card>
          )}

          {sourceText && (
            <div className="text-center">
              <Button
                onClick={handleTranslate}
                disabled={isLoading || !sourceText.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 hover:from-blue-600 hover:via-yellow-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {isLoading ? 'Çevriliyor...' : 'Çevir'}
              </Button>
            </div>
          )}

          {translatedText && (
            <TranslateResult
              text={translatedText}
              language={getDisplayName(targetLang)}
              sourceLang={sourceLang}
              targetLang={targetLang}
            />
          )}
        </TabsContent>

        <TabsContent value="document" className="space-y-6">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-blue-200">
            <div className="grid md:grid-cols-2 gap-6">
              <LanguageSelector
                languages={[{ code: 'auto', name: 'Auto-detect', flag: '🌐' }, ...LANGUAGES]}
                value={sourceLang}
                onChange={setSourceLang}
                label="Kaynak Dil"
              />
              <LanguageSelector
                languages={LANGUAGES}
                value={targetLang}
                onChange={setTargetLang}
                label="Hedef Dil"
              />
            </div>
          </Card>

          <DocumentUpload
            onDocumentSelect={handleDocument}
            isLoading={isLoading}
          />

          {sourceText && (
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-yellow-200">
              <TextInput
                value={sourceText}
                onChange={setSourceText}
                placeholder="Dökümannen çıkarılan metin..."
                label="Çıkarılan Metin"
              />
            </Card>
          )}

          {sourceText && (
            <div className="text-center">
              <Button
                onClick={handleTranslate}
                disabled={isLoading || !sourceText.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 hover:from-blue-600 hover:via-yellow-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {isLoading ? 'Çevriliyor...' : 'Çevir'}
              </Button>
            </div>
          )}

          {translatedText && (
            <TranslateResult
              text={translatedText}
              language={getDisplayName(targetLang)}
              sourceLang={sourceLang}
              targetLang={targetLang}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
