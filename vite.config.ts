import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // Explicitly set base to root for standard Netlify/Vercel deployment
    base: '/',
    define: {
      // Safely polyfill process.env for the browser
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.NODE_ENV': JSON.stringify(mode),
    }
  };
});