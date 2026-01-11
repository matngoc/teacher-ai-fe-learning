import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Tooltip } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { VoiceChatContainer } from './components/VoiceChatContainer';
import { LearnerService } from '~/api/services/LearnerService';
import { LessonService } from '~/api/services/LessonService';
import { learnerActions } from '~/stores/learnerSlice';
import type { AppDispatch } from '~/stores';

const LearnerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const connectionStatus = useSelector((state: any) => state.learner.connectionStatus);
  const [lessonName, setLessonName] = useState('');
  const [showCaption, setShowCaption] = useState(true);

  useEffect(() => {
    if (id) {
      // Fetch lesson info
      LessonService.fetchBotList().then(response => {
        const lesson = response.result.find(bot => bot.id === parseInt(id));
        if (lesson) {
          setLessonName(lesson.name);
        }
      });

      // Fetch moods
      LearnerService.fetchMoodList().then(response => {
        dispatch(learnerActions.setMoods(response.data));
      });
    }
  }, [id, dispatch]);

  const handleBack = () => {
    // Clear transcript and image before navigating back
    dispatch(learnerActions.setTranscript(''));
    dispatch(learnerActions.setCurrentImage(null));
    navigate('/learn/choose');
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
              🎙️ AI Voice Learning Assistant
            </h1>
            
            <VoiceChatContainer autoConnect={false} showCaption={showCaption} />
          </div>
        </div>
      </div>
    );
  }

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'disconnected':
        return {
          color: '#ef4444',
          text: 'Disconnected',
        };
      case 'connecting':
        return {
          color: '#f59e0b',
          text: 'Connecting...',
        };
      case 'connected':
        return {
          color: '#10b981',
          text: 'Connected',
        };
      case 'listening':
        return {
          color: '#3b82f6',
          text: 'Listening...',
        };
      default:
        return {
          color: '#6b7280',
          text: 'Unknown',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md px-4 py-3 flex items-center justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          size="large"
          className="flex items-center"
        >
          Back
        </Button>
        
        <div className="flex-1 flex items-center justify-center mx-4">
          <Tooltip title={statusInfo.text} placement="bottom">
            <div
              className="w-3 h-3 rounded-full mr-3 cursor-pointer"
              style={{
                backgroundColor: statusInfo.color,
                boxShadow: `0 0 10px ${statusInfo.color}`,
                animation: connectionStatus === 'connecting' || connectionStatus === 'listening' ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
              }}
            />
          </Tooltip>
          <h1 
            className="truncate"
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#1f2937'
            }}
          >
            {lessonName || 'Loading...'}
          </h1>
        </div>
        
        <Button
          onClick={() => setShowCaption(!showCaption)}
          size="large"
          style={{
            backgroundColor: showCaption ? '#000' : '#fff',
            color: showCaption ? '#fff' : '#000',
            border: showCaption ? 'none' : '1px solid #d1d5db',
            fontWeight: 600
          }}
        >
          CC
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <VoiceChatContainer 
          autoConnect={true} 
          botId={parseInt(id)} 
          showCaption={showCaption}
          compactLayout={true}
        />
      </div>
    </div>
  );
};

export default LearnerPage;
