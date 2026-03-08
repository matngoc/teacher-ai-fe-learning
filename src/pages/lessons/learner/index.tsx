import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Tooltip } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { VoiceChatContainer } from './components/VoiceChatContainer';
import { lessonService } from '~/api/services/lessonService';
import { lessonHistoryService } from '~/api/services/lessonHistoryService';
import { learnerActions } from '~/stores/learnerSlice';
import type { AppDispatch, RootState } from '~/stores/store.ts';

const LearnerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const connectionStatus = useSelector((state: RootState) => state.learner.connectionStatus);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [lessonName, setLessonName] = useState('');
  const [showCaption, setShowCaption] = useState(true);

  // Track current lesson history id so we can update it on disconnect
  const historyIdRef = useRef<number | null>(null);
  // Track previous connection status to detect transitions
  const prevConnectionStatusRef = useRef<string>('disconnected');

  useEffect(() => {
    if (id) {
      // Fetch lesson info using findOne API
      lessonService.findOne(parseInt(id)).then((lesson) => {
        if (lesson?.name) {
          setLessonName(lesson.name);
        }
      }).catch(() => {
        setLessonName('Bài học');
      });
    }
  }, [id, dispatch]);

  // Watch connectionStatus transitions to create/update lesson history
  useEffect(() => {
    const prev = prevConnectionStatusRef.current;
    const curr = connectionStatus;

    // When connected (transitioned from connecting): create lesson history
    if (prev === 'connecting' && (curr === 'connected' || curr === 'listening')) {
      if (id && currentUser?.id) {
        const now = new Date().toISOString();
        lessonHistoryService
          .create({
            lessonId: parseInt(id),
            userId: currentUser.id,
            startedAt: now,
            progressPercent: 50,
            status: 'in_progress',
          })
          .then((history) => {
            historyIdRef.current = history.id;
          })
          .catch((err) => {
            console.error('Failed to create lesson history', err);
          });
      }
    }

    // When disconnected (after having been connected): update lesson history
    if (curr === 'disconnected' && prev !== 'disconnected' && prev !== 'connecting') {
      if (historyIdRef.current) {
        const now = new Date().toISOString();
        lessonHistoryService
          .update(historyIdRef.current, {
            finishedAt: now,
            progressPercent: 100,
            status: 'completed',
          })
          .catch((err) => {
            console.error('Failed to update lesson history', err);
          })
          .finally(() => {
            historyIdRef.current = null;
          });
      }
    }

    prevConnectionStatusRef.current = curr;
  }, [connectionStatus, id, currentUser]);

  const handleBack = () => {
    // Clear transcript and image before navigating back
    dispatch(learnerActions.setTranscript(''))
    dispatch(learnerActions.setCurrentImage(null))
    navigate('/user/lessons');
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
