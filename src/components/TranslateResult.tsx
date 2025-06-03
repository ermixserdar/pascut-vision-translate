
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranslateResultProps {
  text: string;
  language: string;
}

export const TranslateResult: React.FC<TranslateResultProps> = ({ text, language }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({
        title: "Kopyalandı",
        description: "Çeviri panoya kopyalandı",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kopyalama işlemi başarısız",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700">
            Çeviri Sonucu ({language})
          </Label>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-green-100"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                Kopyalandı
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Kopyala
              </>
            )}
          </Button>
        </div>
        <div className="p-4 bg-white rounded-lg border border-green-200 min-h-32">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </Card>
  );
};
