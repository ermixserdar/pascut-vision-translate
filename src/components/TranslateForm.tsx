import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { PdfUpload } from './PdfUpload';
import { LanguageSelector } from './LanguageSelector';
import { TranslateResult } from './TranslateResult';
import { TextInput } from './TextInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { extractTextFromPdf } from '@/utils/pdfUtils';

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
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const { toast } = useToast();

  const handlePDF = async (pdfFile: File) => {
    setIsLoading(true);
    try {
      // PDF'den metin çıkarma
      const extractedText = await extractTextFromPdf(pdfFile);
      
      if (!extractedText.trim()) {
        throw new Error('PDF\'den metin çıkarılamadı');
      }
      
      setSourceText(extractedText);
      toast({
        title: "PDF İşlendi",
        description: "Metin başarıyla PDF'den çıkarıldı",
      });
    } catch (error) {
      console.error('PDF processing error:', error);
      toast({
        title: "PDF Hatası",
        description: "PDF işlenemedi. Lütfen farklı bir dosya deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOCR = async (imageFile: File) => {
    setIsLoading(true);
    try {
      const ocrResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2-vision',
          prompt: 'Extract all text from this image. Only return the extracted text, nothing else.',
          images: [await convertImageToBase64(imageFile)],
          stream: false
        })
      });

      if (!ocrResponse.ok) {
        throw new Error('OCR işlemi başarısız');
      }

      const ocrData = await ocrResponse.json();
      const extractedText = ocrData.response;
      
      setSourceText(extractedText);
      toast({
        title: "OCR Başarılı",
        description: "Metin başarıyla görüntüden çıkarıldı",
      });
    } catch (error) {
      console.error('OCR error:', error);
      toast({
        title: "OCR Hatası",
        description: "Ollama bağlantısını kontrol edin (localhost:11434)",
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

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
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
        <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Metin Çeviri
          </TabsTrigger>
          <TabsTrigger value="ocr" className="flex items-center gap-2">
            <FileImage className="w-4 h-4" />
            OCR Çeviri
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            PDF Çeviri
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
            onFileSelect={(file) => {
              setUploadedImage(file);
              handleOCR(file);
            }}
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

        <TabsContent value="pdf" className="space-y-6">
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

          <PdfUpload
            onPdfSelect={handlePDF}
            isLoading={isLoading}
          />

          {sourceText && (
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-yellow-200">
              <TextInput
                value={sourceText}
                onChange={setSourceText}
                placeholder="PDF'den çıkarılan metin..."
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
