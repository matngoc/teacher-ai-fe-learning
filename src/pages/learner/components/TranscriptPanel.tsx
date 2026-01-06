import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '~/stores';

export const TranscriptPanel: React.FC = () => {
  const { transcript } = useSelector((state: RootState) => state.learner);

  return (
    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mt-5">
      <div className="font-semibold text-gray-700 mb-3 text-sm">
        📝 Transcript:
      </div>
      <div className="text-gray-900 text-base leading-relaxed min-h-[60px]">
        {transcript || (
          <span className="text-gray-400 italic">No transcript yet...</span>
        )}
      </div>
    </div>
  );
};
