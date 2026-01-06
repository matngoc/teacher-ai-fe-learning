import React from 'react';
import { VoiceChatContainer } from './components/VoiceChatContainer';

const LearnerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            🎙️ AI Voice Learning Assistant
          </h1>
          
          <VoiceChatContainer />
        </div>
      </div>
    </div>
  );
};

export default LearnerPage;
