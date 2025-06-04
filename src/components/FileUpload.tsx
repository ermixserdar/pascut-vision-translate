
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Upload, FileImage } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <Card className="p-8 bg-white/70 backdrop-blur-sm border-red-200">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={isLoading} />
        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <div className="animate-spin">
              <FileImage className="w-12 h-12 text-blue-500" />
            </div>
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isLoading
                ? 'Dosya işleniyor...'
                : isDragActive
                ? 'Dosyayı buraya bırakın'
                : 'OCR için dosya yükleyin'}
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, JPEG, GIF, BMP, WebP veya PDF formatlarında dosya seçin
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
