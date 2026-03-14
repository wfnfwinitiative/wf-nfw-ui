// API Configuration
export const config = {
  // LLM Services API Base URL
  llmServiceUrl: import.meta.env.VITE_LLM_SERVICE_URL || 'http://localhost:8000',

  // Backend Services API Base URL
  serviceUrl: import.meta.env.VITE_BACKEND_SERVICE_URL || 'https://wf-nfw-services-7100bw3fv-wf-nfws-projects.vercel.app',
};

export default config;
