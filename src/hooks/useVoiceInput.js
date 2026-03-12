import { useState, useEffect } from 'react';
import { useVoiceRecording } from './useVoiceRecording';
import { processAudio } from '../services/api/voiceService';

/**
 * Manages voice recording, LLM audio processing, and food item state.
 */
export function useVoiceInput() {
  const [foodItems, setFoodItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [lastTranscript, setLastTranscript] = useState('');

  const {
    isRecording,
    audioBlob,
    error: recordingError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useVoiceRecording();

  useEffect(() => {
    if (audioBlob && !isRecording) {
      processRecording();
    }
  }, [audioBlob, isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      clearRecording();
      setApiError(null);
      setLastTranscript('');
      startRecording();
    }
  };

  const processRecording = async () => {
    if (!audioBlob) return;
    setProcessing(true);
    setApiError(null);
    try {
      const response = await processAudio(audioBlob);
      console.log('=== LLM API Response ===');
      console.log('Transcript:', response.transcript);
      console.log('Metadata:', JSON.stringify(response.metadata, null, 2));
      console.log('========================');
      setLastTranscript(response.transcript || '');
      if (response.metadata?.items?.length > 0) {
        const newItems = response.metadata.items.map((item, index) => ({
          id: Date.now() + index,
          foodName: item.foodName || 'Unknown Item',
          quantity: item.quantity || '',
          quality: item.quality || 'Good',
        }));
        setFoodItems(prev => [...prev, ...newItems]);
        return true; // signals caller to switch to list view
      }
    } catch (err) {
      console.error('Processing error:', err);
      const errorMessage =
        err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to process audio';
      setApiError(errorMessage);
    } finally {
      setProcessing(false);
    }
    return false;
  };

  return {
    foodItems,
    setFoodItems,
    isRecording,
    processing,
    apiError,
    recordingError,
    lastTranscript,
    toggleRecording,
  };
}
