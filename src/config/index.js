// API Configuration
export const config = {
  // LLM Services API Base URL
  llmServiceUrl: import.meta.env.VITE_LLM_SERVICE_URL || 'https://wf-nfw-llm-services.vercel.app',

  // Backend Services API Base URL
  // In development, default to an empty string so Vite's dev server proxy handles 
  // requests to `/api` and avoids CORS. In production, fall back to the backend URL.
  serviceUrl:
    import.meta.env.VITE_BACKEND_SERVICE_URL ?? (import.meta.env.DEV ? '' : 'http://127.0.0.1:8000'),
};

export default config;
