import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '~/stores';

export const AudioVisualizer: React.FC = () => {
  const { currentImage, config } = useSelector((state: RootState) => state.learner);

  // Only show for voice modes
  if (config.mode === 'text') {
    return null;
  }

  return (
    <div className="text-center my-5">
      {currentImage ? (
        <div className="inline-block rounded-2xl overflow-hidden shadow-2xl bg-gray-50 border-4 border-gray-200 max-w-md mx-auto">
          <img
            src={currentImage.url}
            alt="AI Response Visualization"
            className="w-full h-auto block max-h-[300px] object-contain"
          />
          {(currentImage.mood || currentImage.servo) && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-4 py-2 text-xs font-semibold">
              {currentImage.mood && (
                <span className="inline-block mr-3">
                  😊 Mood: {currentImage.mood}
                </span>
              )}
              {currentImage.servo && (
                <span className="inline-block">
                  🤖 Servo: {currentImage.servo}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="inline-block rounded-2xl overflow-hidden bg-gray-50 border-4 border-gray-200 max-w-md mx-auto">
          <div 
            className="px-10 py-20 text-gray-400 text-base"
            style={{
              background: `linear-gradient(45deg, #f8f9fa 25%, transparent 25%), 
                           linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), 
                           linear-gradient(45deg, transparent 75%, #f8f9fa 75%), 
                           linear-gradient(-45deg, transparent 75%, #f8f9fa 75%)`,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          >
            🖼️ No image to display
          </div>
        </div>
      )}
    </div>
  );
};
