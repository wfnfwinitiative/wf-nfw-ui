import { llmApi } from './apiClient';

/**
 * Process audio file through the LLM service
 * @param {Blob} audioBlob - The audio blob to process
 * @returns {Promise<{transcript: string, metadata: object}>}
 */
export async function processAudio(audioBlob) {
  console.log('[VoiceService] ===== Audio Processing Started =====');
  console.log('[VoiceService] AudioBlob info:', {
    size: audioBlob.size,
    type: audioBlob.type,
    isBlobObject: audioBlob instanceof Blob,
  });
  
  if (!audioBlob || audioBlob.size === 0) {
    throw new Error('Invalid audio blob: empty or missing');
  }
  
  const formData = new FormData();
  
  // Convert blob to file with proper extension
  const audioFile = new File([audioBlob], `recording_${Date.now()}.webm`, {
    type: audioBlob.type || 'audio/webm',
  });
  
  console.log('[VoiceService] AudioFile created:', {
    name: audioFile.name,
    size: audioFile.size,
    type: audioFile.type,
    isFileObject: audioFile instanceof File,
  });
  
  formData.append('file', audioFile);
  
  // Verify FormData has file
  console.log('[VoiceService] FormData contents:');
  for (const [key, value] of formData.entries()) {
    console.log(`  - ${key}:`, {
      name: value.name,
      size: value.size,
      type: value.type,
      isFile: value instanceof File,
    });
  }

  try {
    console.log('[VoiceService] Sending FormData to /process-audio with mode=api');
    const response = await llmApi.postFormData('/process-audio', formData, {
      params: {
        mode: 'api', // Always use API mode for LLM service vercel dont support local model.
      },
    });
    
    console.log('[VoiceService] ✓ Success! Response received:');
    console.log('[VoiceService] Response data:', response);
    console.log('[VoiceService] ===== Audio Processing Completed =====');
    return response;
  } catch (error) {
    console.error('[VoiceService] ✗ Error during processing:', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      detail: error?.response?.data?.detail,
    });
    console.error('[VoiceService] ===== Audio Processing Failed =====');
    throw error;
  }
}

export default {
  processAudio,
};
