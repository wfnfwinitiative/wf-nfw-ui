import { useState, useEffect } from 'react';
import { useVoiceRecording } from './useVoiceRecording';
import { processAudio } from '../services/api/voiceService';

// Minimum blob size (bytes) — blobs smaller than this contain no real audio
const MIN_BLOB_SIZE = 1000;
// Minimum recording duration (seconds) to prevent accidental-tap LLM calls
const MIN_DURATION_SECS = 1;

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
    elapsedSeconds,
    autoStopped,
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

    // Note: if auto-stopped at 60s, the blob already contains exactly 60s — process it normally.
    // Just surface a soft notice so the user knows the audio was trimmed.
    if (autoStopped) {
      setApiError('Recording trimmed to 60 seconds — processing what was captured.');
    }

    // Guard: blob too small — silence, accidental tap, or mic issue
    if (audioBlob.size < MIN_BLOB_SIZE) {
      setApiError('Recording appears empty — please try again and speak clearly.');
      return;
    }

    // Guard: duration too short — accidental tap, nothing useful to transcribe
    if (elapsedSeconds < MIN_DURATION_SECS) {
      setApiError('Recording too short — speak for at least 1 second.');
      return;
    }

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
    elapsedSeconds,
    autoStopped,
    toggleRecording,
  };
}
