import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '~/stores';

export const TranscriptPanel: React.FC = () => {
  const { transcript } = useSelector((state: RootState) => state.learner);

  return (
    <div 
      className="rounded-xl p-3 backdrop-blur-sm"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        color: 'white'
      }}
    >
      <div className="text-sm leading-relaxed min-h-[30px]">
        {transcript || (
          <span className="opacity-50 italic">No caption yet...</span>
        )}
      </div>
    </div>
  );
};
