
import React from 'react';
import { Languages } from 'lucide-react';

export const TranslateHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full">
          <Languages className="w-8 h-8 text-blue-700" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-yellow-600 to-red-600 bg-clip-text text-transparent">
          PASCUT Translate
        </h1>
      </div>
      <p className="text-lg text-gray-700 max-w-2xl mx-auto">
        Llama 3.2 Vision ve Ollama destekli OCR ve çeviri uygulaması. 
        Görüntülerden metin okuyun ve anında çevirin.
      </p>
    </div>
  );
};
