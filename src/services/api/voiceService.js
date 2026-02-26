import { llmApi } from './apiClient';

/**
 * Process audio file through the LLM service
 * @param {Blob} audioBlob - The audio blob to process
 * @returns {Promise<{transcript: string, metadata: object}>}
 */
export async function processAudio(audioBlob) {
  const formData = new FormData();
  
  // Convert blob to file with proper extension
  const audioFile = new File([audioBlob], `recording_${Date.now()}.webm`, {
    type: audioBlob.type || 'audio/webm',
  });
  
  formData.append('file', audioFile);

  return llmApi.postFormData('/process-audio', formData, {
    params: {
      mode: 'api', // Always use API mode for LLM service vercel dont support local model.
    },
  });
}

export default {
  processAudio,
};
