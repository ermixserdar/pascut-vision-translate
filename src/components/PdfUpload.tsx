
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';

interface PdfUploadProps {
  onPdfSelect: (file: File) => void;
  isLoading?: boolean;
}

export const PdfUpload: React.FC<PdfUploadProps> = ({ onPdfSelect, isLoading }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onPdfSelect(acceptedFiles[0]);
    }
  }, [onPdfSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <Card className="p-8 bg-white/70 backdrop-blur-sm border-purple-200">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={isLoading} />
        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <div className="animate-spin">
              <FileText className="w-12 h-12 text-purple-500" />
            </div>
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isLoading
                ? 'PDF işleniyor...'
                : isDragActive
                ? 'PDF dosyasını buraya bırakın'
                : 'PDF çevirisi için dosya yükleyin'}
            </p>
            <p className="text-sm text-gray-500">
              PDF formatında dosya seçin
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
