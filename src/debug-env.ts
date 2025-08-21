// Temporary environment debug file
console.log('=== Environment Debug ===');
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);
console.log('All import.meta.env keys:', Object.keys(import.meta.env));
console.log('All import.meta.env:', import.meta.env);

// Check specific variables
console.log('VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);

export {};
