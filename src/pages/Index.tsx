
import React from 'react';
import { TranslateHeader } from '@/components/TranslateHeader';
import { TranslateForm } from '@/components/TranslateForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <TranslateHeader />
        <TranslateForm />
      </div>
    </div>
  );
};

export default Index;
