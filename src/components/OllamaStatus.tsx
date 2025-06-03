
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useOllamaConnection } from '@/hooks/useOllamaConnection';

export const OllamaStatus = () => {
  const { isConnected, isChecking, checkConnection } = useOllamaConnection();

  if (isChecking && isConnected === null) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertTitle>Bağlantı Kontrol Ediliyor</AlertTitle>
        <AlertDescription>
          Ollama bağlantısı kontrol ediliyor...
        </AlertDescription>
      </Alert>
    );
  }

  if (isConnected === true) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Ollama Bağlı</AlertTitle>
        <AlertDescription className="text-green-700">
          Ollama başarıyla bağlandı. OCR ve çeviri özellikleri kullanılabilir.
        </AlertDescription>
      </Alert>
    );
  }

  if (isConnected === false) {
    return (
      <Alert variant="destructive" className="bg-red-50 border-red-200">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Ollama Bağlantı Hatası</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>Ollama'ya bağlanılamıyor. Lütfen aşağıdaki adımları kontrol edin:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Ollama'nın yüklü olduğundan emin olun</li>
            <li>Terminal'de <code className="bg-red-100 px-1 rounded">ollama serve</code> komutunu çalıştırın</li>
            <li>Llama 3.2 Vision modelini indirin: <code className="bg-red-100 px-1 rounded">ollama pull llama3.2-vision</code></li>
            <li>Ollama'nın localhost:11434 portunda çalıştığını kontrol edin</li>
          </ul>
          <Button 
            onClick={checkConnection} 
            variant="outline" 
            size="sm" 
            className="mt-2"
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Tekrar Dene
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
