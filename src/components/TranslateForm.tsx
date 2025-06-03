
import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { LanguageSelector } from './LanguageSelector';
import { TranslateResult } from './TranslateResult';
import { TextInput } from './TextInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
];

export const TranslateForm = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('tr');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const { toast } = useToast();

  const handleOCR = async (imageFile: File) => {
    setIsLoading(true);
    try {
      // Ollama API çağrısı - OCR için
      const formData = new FormData();
      formData.append('image', imageFile);
      
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
      const sourceLangName = LANGUAGES.find(l => l.code === sourceLang)?.name || 'auto-detect';
      const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || 'Turkish';

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2-vision',
          prompt: `Translate the following text from ${sourceLangName} to ${targetLangName}. Only return the translation, nothing else:\n\n${sourceText}`,
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
        resolve(base64.split(',')[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Metin Çeviri
          </TabsTrigger>
          <TabsTrigger value="ocr" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            OCR Çeviri
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-6">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-blue-200">
            <div className="grid md:grid-cols-2 gap-6">
              <LanguageSelector
                languages={[{ code: 'auto', name: 'Otomatik Algıla', flag: '🌐' }, ...LANGUAGES]}
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
              language={LANGUAGES.find(l => l.code === targetLang)?.name || 'Türkçe'}
            />
          )}
        </TabsContent>

        <TabsContent value="ocr" className="space-y-6">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-blue-200">
            <div className="grid md:grid-cols-2 gap-6">
              <LanguageSelector
                languages={[{ code: 'auto', name: 'Otomatik Algıla', flag: '🌐' }, ...LANGUAGES]}
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
              language={LANGUAGES.find(l => l.code === targetLang)?.name || 'Türkçe'}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
