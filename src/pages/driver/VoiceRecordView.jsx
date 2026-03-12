import { Mic, MicOff, Loader2 } from 'lucide-react';

const MAX_SECONDS = 60;

function formatDuration(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Pure UI component for the voice recording screen.
 * All logic lives in the useVoiceInput hook.
 */
export function VoiceRecordView({
  isRecording,
  processing,
  apiError,
  recordingError,
  lastTranscript,
  foodItemCount,
  elapsedSeconds = 0,
  disabled,
  onToggleRecording,
  onViewItems,
}) {
  const remaining = MAX_SECONDS - elapsedSeconds;
  const timerColor =
    elapsedSeconds >= 55 ? 'text-red-600 font-bold' :
    elapsedSeconds >= 50 ? 'text-orange-500 font-semibold' :
    'text-gray-500';

  return (
    <div className="flex flex-col items-center justify-center min-h-100 space-y-6">
      <p className="text-lg text-gray-600 text-center">
        {isRecording
          ? '🎙️ Listening... Speak now!'
          : processing
          ? '⏳ Processing your voice...'
          : '👇 Tap to speak'}
      </p>

      <button
        onClick={onToggleRecording}
        disabled={disabled || processing}
        className={`
          w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center
          transition-all duration-300 shadow-xl
          ${isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110'
            : processing
            ? 'bg-gray-400'
            : 'bg-primary-600 hover:bg-primary-700 hover:scale-105'}
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

      {/* Live timer shown only while recording */}
      {isRecording && (
        <div className="flex flex-col items-center gap-1">
          <span className={`text-2xl tabular-nums ${timerColor}`}>
            {formatDuration(elapsedSeconds)}
          </span>
          <span className="text-xs text-gray-400">
            {remaining <= 10 ? `⚠️ ${remaining}s left` : `Max ${MAX_SECONDS}s`}
          </span>
        </div>
      )}

      <p className="text-sm text-gray-500">
        {isRecording
          ? 'Tap again to stop'
          : processing
          ? 'Please wait...'
          : 'Say food items like "5 kg biryani, 10 rotis" or add manually'}
      </p>

      {isRecording && (
        <div className="flex items-center justify-center gap-1 h-8">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="w-2 bg-red-500 rounded-full animate-pulse"
              style={{ height: `${Math.random() * 24 + 8}px`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}

      {(recordingError || apiError) && (
        <div className="w-full max-w-md p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
          {recordingError || apiError}
        </div>
      )}

      {lastTranscript && !isRecording && !processing && (
        <div className="w-full max-w-md p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-600 mb-1">You said:</p>
          <p className="text-gray-900">{lastTranscript}</p>
        </div>
      )}

      {foodItemCount > 0 && (
        <button
          onClick={onViewItems}
          className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-200"
        >
          View {foodItemCount} item{foodItemCount > 1 ? 's' : ''} →
        </button>
      )}
    </div>
  );
}
