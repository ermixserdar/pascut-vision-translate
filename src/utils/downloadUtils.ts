
export const downloadTextAsFile = (text: string, filename: string, format: 'txt' | 'pdf' = 'txt') => {
  if (format === 'txt') {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const generateFilename = (sourceLang: string, targetLang: string): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  return `translation_${sourceLang}_to_${targetLang}_${timestamp}`;
};
