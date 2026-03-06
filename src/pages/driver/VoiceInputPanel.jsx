import { useState, useEffect, useRef } from 'react';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import { Mic, MicOff, Loader2, List, Volume2, Camera, X, Image } from 'lucide-react';
import { processAudio } from '../../services/api/voiceService';
import { FoodItemsGrid } from './FoodItemsGrid';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';

export function VoiceInputPanel({ disabled = false }) {
  const { isVoiceEnabled } = useFeatureFlags();
  const [view, setView] = useState(isVoiceEnabled ? 'voice' : 'list'); // 'voice' or 'list'
  const [foodItems, setFoodItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [lastTranscript, setLastTranscript] = useState('');
  const [images, setImages] = useState([]); // Common images for all items
  const [viewingImage, setViewingImage] = useState(null); // For fullscreen view
  const fileInputRef = useRef(null);
  const imagesSectionRef = useRef(null);
  const contentRef = useRef(null);

  const {
    isRecording,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    clearRecording,
  } = useVoiceRecording();

  // Auto-process audio when recording stops
  useEffect(() => {
    if (audioBlob && !isRecording) {
      handleProcessAudio();
    }
  }, [audioBlob, isRecording]);

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      clearRecording();
      setApiError(null);
      setLastTranscript('');
      startRecording();
    }
  };

  const handleProcessAudio = async () => {
    if (!audioBlob) return;

    setProcessing(true);
    setApiError(null);
    
    try {
      const response = await processAudio(audioBlob);
      
      // Log the response for debugging
      console.log('=== LLM API Response ===' );
      console.log('Transcript:', response.transcript);
      console.log('Metadata:', JSON.stringify(response.metadata, null, 2));
      console.log('========================');
      
      setLastTranscript(response.transcript || '');
      
      // Add extracted items to the grid
      if (response.metadata?.items?.length > 0) {
        const newItems = response.metadata.items.map((item, index) => ({
          id: Date.now() + index,
          foodName: item.foodName || 'Unknown Item',
          quantity: item.quantity || '',
          quality: item.quality || 'Good'
        }));
        setFoodItems(prev => [...prev, ...newItems]);
        
        // Switch to list view to show added items
        setView('list');
      }
    } catch (err) {
      console.error('Processing error:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to process audio';
      setApiError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setImages(prev => [...prev, ...newImages]);
    
    // Scroll to images section after a short delay
    setTimeout(() => {
      imagesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const handleRemoveImage = (id) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-white sticky top-0 z-10">
        <h2 className="text-base sm:text-xl font-bold text-gray-900">Food Collection</h2>
        <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
          {isVoiceEnabled && (
            <button
              onClick={() => setView('voice')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                view === 'voice'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
              Voice
            </button>
          )}
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              view === 'list'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-3 h-3 sm:w-4 sm:h-4" />
            Items ({foodItems.length})
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div ref={contentRef} className="flex-1 p-4">
        {view === 'voice' ? (
          // Voice Recording View
          <div className="flex flex-col items-center justify-center min-h-100 space-y-6">
            {/* Simple Instructions */}
            <p className="text-lg text-gray-600 text-center">
              {isRecording 
                ? '🎙️ Listening... Speak now!' 
                : processing 
                ? '⏳ Processing your voice...'
                : '👇 Tap to speak'}
            </p>

            {/* Big Mic Button - Smaller on mobile */}
            <button
              onClick={handleRecordToggle}
              disabled={disabled || processing}
              className={`
                w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center
                transition-all duration-300 shadow-xl
                ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110'
                    : processing
                    ? 'bg-gray-400'
                    : 'bg-primary-600 hover:bg-primary-700 hover:scale-105'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {processing ? (
                <Loader2 className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white" />
              ) : (
                <Mic className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white" />
              )}
            </button>

            {/* Status Text */}
            <p className="text-sm text-gray-500">
              {isRecording 
                ? 'Tap again to stop' 
                : processing 
                ? 'Please wait...'
                : 'Say food items like "5 kg biryani, 10 rotis Or Add manually'}
            </p>

            {/* Waveform Animation */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 h-8">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="w-2 bg-red-500 rounded-full animate-pulse"
                    style={{ 
                      height: `${Math.random() * 24 + 8}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Error Message */}
            {(error || apiError) && (
              <div className="w-full max-w-md p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
                {error || apiError}
              </div>
            )}

            {/* Last Transcript  need to remove in future*/}
            {lastTranscript && !isRecording && !processing && (
              <div className="w-full max-w-md p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-600 mb-1">You said:</p>
                <p className="text-gray-900">{lastTranscript}</p>
              </div>
            )}

            {/* Items Count Badge */}
            {foodItems.length > 0 && (
              <button
                onClick={() => setView('list')}
                className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-200"
              >
                View {foodItems.length} item{foodItems.length > 1 ? 's' : ''} →
              </button>
            )}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            <FoodItemsGrid 
              items={foodItems} 
              onItemsChange={setFoodItems} 
            />
            
            {/* Image Upload Section - Common for all items */}
            <div ref={imagesSectionRef} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  Photos ({images.length})
                </h3>
                <button
                  onClick={handleCameraCapture}
                  className="flex items-center gap-1 px-2 py-1 bg-primary-600 text-white rounded text-xs hover:bg-primary-700"
                >
                  <Camera className="w-3 h-3" />
                  Add
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {images.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1">
                  {images.map((img) => (
                    <div key={img.id} className="relative aspect-square group">
                      <img
                        src={img.preview}
                        alt={img.name}
                        onClick={() => setViewingImage(img)}
                        className="w-full h-full object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                      />
                      <button
                        onClick={() => handleRemoveImage(img.id)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-2">
                  No photos. Tap "Add" to capture.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer with total count */}
      {foodItems.length > 0 && (
        <div className="p-4 border-t bg-gray-50 sticky bottom-0 z-10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Total: <strong>{foodItems.length}</strong> item{foodItems.length > 1 ? 's' : ''}
            </span>
            {view === 'list' && isVoiceEnabled && (
              <button
                onClick={() => setView('voice')}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Mic className="w-4 h-4" />
                Add More
              </button>
            )}
          </div>
        </div>
      )}

      {/* Full Screen Image Viewer */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={viewingImage.preview}
            alt={viewingImage.name}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default VoiceInputPanel;
