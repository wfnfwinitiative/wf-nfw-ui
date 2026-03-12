import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { List, Volume2, Mic } from 'lucide-react';
import { FoodItemsGrid } from './FoodItemsGrid';
import { VoiceRecordView } from './VoiceRecordView';
import { ImageUploadSection } from './ImageUploadSection';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';

/**
 * Orchestrator: wires together voice input, food items, and image uploads.
 * Individual responsibilities live in useVoiceInput, useImageUpload,
 * VoiceRecordView, and ImageUploadSection.
 */
export const VoiceInputPanel = forwardRef(function VoiceInputPanel(
  { disabled = false, driverName = 'Driver', opportunityId = '', uploadType = 'pickup' },
  ref
) {
  const { isVoiceEnabled } = useFeatureFlags();
  const [view, setView] = useState(isVoiceEnabled ? 'voice' : 'list');
  const imagesSectionRef = useRef(null);

  const {
    foodItems,
    setFoodItems,
    isRecording,
    processing,
    apiError,
    recordingError,
    lastTranscript,
    elapsedSeconds,
    toggleRecording,
  } = useVoiceInput();

  const { images, addImages, removeImage, uploadAll, getFolderUrl, isSubmitting } = useImageUpload({
    uploadType,
    driverName,
    opportunityId,
  });

  useImperativeHandle(ref, () => ({
    getFoodItems: () => foodItems,
    getFolderUrl,
    uploadAll,
    getImages: () => images,
  }));

  const handleAddImages = (files) => {
    addImages(files);
    setTimeout(() => {
      imagesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Tab header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-white sticky top-0 z-10">
        <h2 className="text-base sm:text-xl font-bold text-gray-900">Food Collection</h2>
        <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
          {isVoiceEnabled && (
            <button
              onClick={() => setView('voice')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                view === 'voice' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
              Voice
            </button>
          )}
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              view === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-3 h-3 sm:w-4 sm:h-4" />
            Items ({foodItems.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {view === 'voice' ? (
          <VoiceRecordView
            isRecording={isRecording}
            processing={processing}
            apiError={apiError}
            recordingError={recordingError}
            lastTranscript={lastTranscript}
            foodItemCount={foodItems.length}
            elapsedSeconds={elapsedSeconds}
            disabled={disabled}
            onToggleRecording={toggleRecording}
            onViewItems={() => setView('list')}
          />
        ) : (
          <div className="space-y-4">
            <FoodItemsGrid items={foodItems} onItemsChange={setFoodItems} />
            <ImageUploadSection
              images={images}
              onAdd={handleAddImages}
              onRemove={removeImage}
              sectionRef={imagesSectionRef}
              locked={isSubmitting}
            />
          </div>
        )}
      </div>

      {/* Footer */}
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
    </div>
  );
});

export default VoiceInputPanel;
