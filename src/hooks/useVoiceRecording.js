import { useState, useRef, useCallback } from 'react';

const MAX_RECORDING_SECONDS = 60;

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [autoStopped, setAutoStopped] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const autoStopTimeoutRef = useRef(null);

  const _clearTimers = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (autoStopTimeoutRef.current) { clearTimeout(autoStopTimeoutRef.current); autoStopTimeoutRef.current = null; }
  };

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAutoStopped(false);
      setElapsedSeconds(0);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/mp4',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setAudioBlob(blob);
        _clearTimers();
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);

      // Elapsed-seconds counter (updates UI every second)
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);

      // Hard auto-stop at MAX_RECORDING_SECONDS to avoid runaway LLM costs
      autoStopTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          setAutoStopped(true);
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, MAX_RECORDING_SECONDS * 1000);

    } catch (err) {
      setError('Microphone access denied. Please allow microphone access to use voice input.');
      console.error('Error starting recording:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      _clearTimers();
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    setError(null);
    setElapsedSeconds(0);
    setAutoStopped(false);
  }, []);

  return {
    isRecording,
    audioBlob,
    error,
    elapsedSeconds,
    autoStopped,
    startRecording,
    stopRecording,
    clearRecording,
  };
}

export default useVoiceRecording;
