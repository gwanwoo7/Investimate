// Temporary debug script to check environment variables
console.log('=== Environment Variable Debug ===');
console.log('VITE_RESEND_API_KEY:', import.meta.env.VITE_RESEND_API_KEY);
console.log('API Key exists:', !!import.meta.env.VITE_RESEND_API_KEY);
console.log('API Key length:', import.meta.env.VITE_RESEND_API_KEY?.length);
console.log('API Key type:', typeof import.meta.env.VITE_RESEND_API_KEY);
console.log('All VITE env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
console.log('====================================');
