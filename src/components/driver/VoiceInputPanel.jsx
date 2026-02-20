import { useState } from 'react';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import { Button, Textarea } from '../common';
import { Mic, MicOff, Languages, Volume2, Activity, Loader2, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export function VoiceInputPanel({ onDataParsed, disabled = false, onComplete }) {
  const [language, setLanguage] = useState('en');
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const {
    isRecording,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    clearRecording,
  } = useVoiceRecording();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
  ];

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      clearRecording();
      setTranscript('');
      startRecording();
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;

    setTranscribing(true);
    try {
      // Simulate transcription API call
      // In production, this would call: transcriptionApi.transcribe(audioBlob, language)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulated transcript based on language
      const mockTranscripts = {
        en: 'I have collected 45 kilograms of biryani and curries from Taj Krishna Banjara Hills. Will deliver to Akshaya Patra Gachibowli by 11 AM.',
        hi: 'Maine Taj Krishna Banjara Hills se 45 kilo biryani aur curry liya hai. Akshaya Patra Gachibowli mein 11 baje tak pahuncha dunga.',
        te: 'Nenu Taj Krishna Banjara Hills nundi 45 kilo biryani mariyu curries teesukunnanu. Akshaya Patra Gachibowli ki 11 gantalaku delivery chestanu.',
        ta: 'Naan Taj Krishna Banjara Hills idhirundhu 45 kilo biryani matrum curries eduthen. Akshaya Patra Gachibowli ku 11 maniku delivery seivaen.',
      };

      setTranscript(mockTranscripts[language] || mockTranscripts.en);
    } catch (err) {
      console.error('Transcription error:', err);
    } finally {
      setTranscribing(false);
    }
  };

  const handleProcessVoiceInput = async () => {
    if (!transcript) return;

    setProcessing(true);
    try {
      // Simulate parsing API call
      // In production, this would call: transcriptionApi.parseTranscript(transcript)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulated parsed data
      const parsedData = {
        foodName: 'Biryani and Curries',
        quantityCollected: '45 kg',
        pickupLocation: 'Taj Krishna, Banjara Hills, Hyderabad',
        hungerSpotName: 'Akshaya Patra - Gachibowli',
        estimatedDeliveryTime: new Date(
          Date.now() + 2 * 60 * 60 * 1000
        ).toISOString().slice(0, 16),
      };

      onDataParsed(parsedData);
      // Switch back to form view on mobile after successful processing
      onComplete?.();
    } catch (err) {
      console.error('Parsing error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1">
          Voice Input Assistance
        </h3>
        <p className="text-xs lg:text-sm text-gray-500">
          Speak in your preferred language to fill the form automatically.
        </p>
      </div>

      {/* Language Selection - Compact on mobile */}
      <div>
        <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
          <Languages className="w-4 h-4 inline mr-1" />
          Language
        </label>
        <div className="flex flex-wrap gap-1.5 lg:gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              disabled={disabled}
              className={`
                px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-full text-xs lg:text-sm font-medium transition-colors
                ${
                  language === lang.code
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Record Button - Responsive size */}
      <div className="text-center py-2">
        <button
          onClick={handleRecordToggle}
          disabled={disabled}
          className={`
            w-16 h-16 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mx-auto
            transition-all duration-300 shadow-lg
            ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-primary-600 hover:bg-primary-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isRecording ? (
            <MicOff className="w-7 h-7 lg:w-10 lg:h-10 text-white" />
          ) : (
            <Mic className="w-7 h-7 lg:w-10 lg:h-10 text-white" />
          )}
        </button>
        <p className="mt-2 text-xs lg:text-sm text-gray-600">
          {isRecording ? 'Tap to stop' : 'Tap to record'}
        </p>
      </div>

      {/* Waveform Animation */}
      {isRecording && (
        <div className="flex items-center justify-center gap-1 h-6 lg:h-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-1 bg-primary-500 rounded-full waveform-bar"
              style={{ height: '8px' }}
            />
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-2 lg:p-3 bg-red-50 border border-red-200 rounded-lg text-xs lg:text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Transcribe Button */}
      {audioBlob && !isRecording && (
        <Button
          onClick={handleTranscribe}
          variant="secondary"
          className="w-full"
          loading={transcribing}
          disabled={transcribing}
        >
          <Volume2 className="w-4 h-4 mr-2" />
          Transcribe Audio
        </Button>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1.5">
            Transcript
          </label>
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            className="text-sm"
            placeholder="Transcript will appear here..."
          />
        </div>
      )}

      {/* Process Voice Input Button */}
      {transcript && (
        <Button
          onClick={handleProcessVoiceInput}
          variant="primary"
          className="w-full"
          loading={processing}
          disabled={processing}
        >
          Apply to Form
        </Button>
      )}

      {/* Collapsible Help Text */}
      <div className="bg-blue-50 rounded-lg overflow-hidden">
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className="w-full p-3 flex items-center justify-between text-left"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-blue-900">
            <HelpCircle className="w-4 h-4" />
            How to use voice input
          </span>
          {showHelp ? (
            <ChevronUp className="w-4 h-4 text-blue-700" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-700" />
          )}
        </button>
        {showHelp && (
          <ol className="px-3 pb-3 text-xs lg:text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Select your preferred language</li>
            <li>Tap the microphone to start recording</li>
            <li>Speak clearly about the pickup details</li>
            <li>Tap again to stop recording</li>
            <li>Click "Transcribe Audio" to convert to text</li>
            <li>Click "Apply to Form" to fill the form</li>
          </ol>
        )}
      </div>
    </div>
  );
}

export default VoiceInputPanel;
