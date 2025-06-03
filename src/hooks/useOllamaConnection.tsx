
import { useState, useEffect } from 'react';

export const useOllamaConnection = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setIsConnected(true);
        console.log('Ollama connection successful');
      } else {
        setIsConnected(false);
        console.log('Ollama connection failed - server responded with error');
      }
    } catch (error) {
      setIsConnected(false);
      console.log('Ollama connection failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { isConnected, isChecking, checkConnection };
};
