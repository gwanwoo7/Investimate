// Environment Variable Debug Component
import { useEffect } from 'react';

export default function EnvDebug() {
  useEffect(() => {
    console.log('🔧 Environment Debug:');
    console.log('All VITE_ env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
    console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
    console.log('VITE_RAPID_API_KEY:', import.meta.env.VITE_RAPID_API_KEY);
  }, []);

  return null;
}
