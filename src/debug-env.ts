// Debug environment variables
console.log('🔍 Environment Debug:');
console.log('API Key:', import.meta.env.VITE_RAPID_API_KEY ? `${import.meta.env.VITE_RAPID_API_KEY.substring(0, 10)}...` : 'NOT FOUND');
console.log('All VITE env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

export const debugEnv = () => {
  return {
    hasApiKey: !!import.meta.env.VITE_RAPID_API_KEY,
    apiKeyPrefix: import.meta.env.VITE_RAPID_API_KEY?.substring(0, 10),
    allViteVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  };
};
