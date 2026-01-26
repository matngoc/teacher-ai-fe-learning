import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '~/stores';
import { Board } from './Board';

interface AudioVisualizerProps {
  showCaption?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ showCaption = true }) => {
  const { currentImage, currentBoard, config, moods, transcript, connectionStatus } = useSelector((state: RootState) => state.learner);

  // Only show for voice modes
  if (config.mode === 'text') {
    return null;
  }

  // Show loading when connecting
  if (connectionStatus === 'connecting') {
    return (
      <div className="text-center my-5">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-300 max-w-full mx-auto flex items-center justify-center"
          style={{ minHeight: '250px' }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-purple-700 font-semibold text-lg">Connecting...</div>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get mood gif URL with default fallback to "happy"
  const getMoodGifUrl = (mood?: string) => {
    if (moods.length === 0) return null;
    
    // Try to find the requested mood
    if (mood) {
      const moodItem = moods.find((m: any) => m?.mood_name?.toLowerCase() === mood.toLowerCase());
      if (moodItem?.url) return moodItem.url;
    }
    
    // Fallback to "happy" as default
    const happyMood = moods.find((m: any) => m?.mood_name?.toLowerCase() === 'happy');
    return happyMood?.url || null;
  };

  const hasImage = currentImage?.url && currentImage.url.trim() !== '';
  const moodGifUrl = getMoodGifUrl(currentImage?.mood);
  
  // Show board if it exists and is visible
  const showBoard = currentBoard && currentBoard.isVisible;

  return (
    <div className="text-center my-5">
      {showBoard ? (
        // Board mode - show whiteboard with caption below
        <div className="relative">
          <Board />
          
          {/* Caption below board */}
          {showCaption && transcript && (
            <div className="mt-3 flex justify-center">
              <div 
                className="rounded-lg px-4 py-2 backdrop-blur-sm inline-block"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  color: 'white'
                }}
              >
                <div className="text-base leading-relaxed">
                  {transcript}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : hasImage ? (
        // Has image - main area full width with avatar at top-right corner
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-red-100 border-4 border-red-200 max-w-full mx-auto">
          {/* Image Area (Red) - Full width */}
          <img
            src={currentImage.url}
            alt="Content"
            className="w-full h-auto object-contain"
            style={{ maxHeight: '400px', minHeight: '250px' }}
          />
          
          {/* Bottom container for caption and avatar */}
          <div className="absolute bottom-3 left-3 right-3">
            {/* Avatar fixed at bottom-right */}
            <div className="absolute bottom-0 right-0 w-24 h-24 rounded-2xl overflow-hidden shadow-xl bg-green-100 border-4 border-green-300 flex items-center justify-center">
              {moodGifUrl ? (
                <img
                  src={moodGifUrl}
                  alt={`Mood: ${currentImage.mood || 'happy'}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-4xl">😊</div>
              )}
            </div>
            
            {/* Caption centered with padding to avoid avatar */}
            {showCaption && transcript && (
              <div className="flex justify-center pr-28">
                <div 
                  className="rounded-lg px-3 py-2 backdrop-blur-sm inline-block"
                  style={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    color: 'white'
                  }}
                >
                  <div className="text-base leading-relaxed">
                    {transcript}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // No image - show only mood gif in main area (Red), full width
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-red-100 border-4 border-red-200 max-w-full mx-auto">
          {moodGifUrl ? (
            <img
              src={moodGifUrl}
              alt={`Mood: ${currentImage?.mood || 'happy'}`}
              className="w-full h-auto object-contain"
              style={{ maxHeight: '400px', minHeight: '250px' }}
            />
          ) : (
            <div 
              className="px-10 py-20 text-gray-400 text-base"
              style={{
                minHeight: '250px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              😊
            </div>
          )}
          
          {/* Caption Overlay at bottom - centered */}
          {showCaption && transcript && (
            <div className="absolute bottom-3 left-3 right-3 flex justify-center">
              <div 
                className="rounded-lg px-3 py-2 backdrop-blur-sm inline-block"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  color: 'white'
                }}
              >
                <div className="text-base leading-relaxed">
                  {transcript}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
