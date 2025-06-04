
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';

interface DocumentUploadProps {
  onDocumentSelect: (file: File) => void;
  isLoading?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentSelect, isLoading }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onDocumentSelect(acceptedFiles[0]);
    }
  }, [onDocumentSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  return (
    <Card className="p-8 bg-white/70 backdrop-blur-sm border-green-200">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={isLoading} />
        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <div className="animate-spin">
              <FileText className="w-12 h-12 text-green-500" />
            </div>
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isLoading
                ? 'Döküman işleniyor...'
                : isDragActive
                ? 'Dosyayı buraya bırakın'
                : 'Döküman çevirisi için dosya yükleyin'}
            </p>
            <p className="text-sm text-gray-500">
              PDF, Word (.doc, .docx), Excel (.xls, .xlsx) veya TXT formatlarında dosya seçin
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
