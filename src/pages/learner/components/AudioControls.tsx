import React from 'react';
import { Button, Space } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '~/stores';

interface AudioControlsProps {
  onConnect: () => void;
  onDisconnect: () => void;
  onMicPress: () => void;
  onMicRelease: () => void;
  disabled?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  onConnect,
  onDisconnect,
  onMicPress,
  onMicRelease,
  disabled = false,
}) => {
  const { connectionStatus, isRecording, config } = useSelector((state: RootState) => state.learner);
  const isConnected = connectionStatus === 'connected' || connectionStatus === 'listening';
  const isConnecting = connectionStatus === 'connecting';

  const getStatusDisplay = () => {
    switch (connectionStatus) {
      case 'disconnected':
        return {
          text: '❌ Disconnected',
          className: 'bg-red-50 text-red-700',
        };
      case 'connecting':
        return {
          text: '⏳ Connecting...',
          className: 'bg-yellow-50 text-yellow-700 animate-pulse',
        };
      case 'connected':
        return {
          text: '✅ Connected',
          className: 'bg-green-50 text-green-700',
        };
      case 'listening':
        return {
          text: '👂 Listening...',
          className: 'bg-blue-50 text-blue-700 animate-pulse',
        };
      default:
        return {
          text: '❓ Unknown',
          className: 'bg-gray-50 text-gray-700',
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="text-center">
      {/* Connection Buttons */}
      <Space className="mb-5">
        {!isConnected && !isConnecting && (
          <Button
            type="primary"
            size="large"
            onClick={onConnect}
            disabled={disabled || !config.userId || !config.todoId}
            className="px-8 py-2 h-auto rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            🔌 Connect & Auto-Start
          </Button>
        )}
        
        {(isConnected || isConnecting) && (
          <Button
            danger
            size="large"
            onClick={onDisconnect}
            disabled={disabled}
            className="px-8 py-2 h-auto rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            ❌ Disconnect
          </Button>
        )}
      </Space>

      {/* Status Display */}
      <div className={`rounded-xl p-4 mb-5 font-semibold text-center ${status.className}`}>
        {status.text}
      </div>

      {/* Microphone Button (only for voice modes) */}
      {config.mode !== 'text' && (
        <>
          <button
            className={`rounded-full text-6xl border-none cursor-pointer transition-all shadow-lg hover:shadow-2xl
              ${isRecording 
                ? 'bg-gradient-to-br from-yellow-400 to-pink-500 scale-95' 
                : 'bg-gradient-to-br from-purple-400 to-pink-600 hover:scale-105'
              }
              ${!isConnected || disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            style={{ width: '120px', height: '120px' }}
            onMouseDown={!disabled && isConnected ? onMicPress : undefined}
            onMouseUp={!disabled && isConnected ? onMicRelease : undefined}
            onTouchStart={!disabled && isConnected ? onMicPress : undefined}
            onTouchEnd={!disabled && isConnected ? onMicRelease : undefined}
            disabled={!isConnected || disabled}
          >
            🎤
          </button>
          
          <div className="text-center text-gray-600 text-sm mt-4">
            {config.mode === 'direct' 
              ? 'Hold to speak (or press Space key)'
              : 'Click to toggle recording (or press Space key)'
            }
          </div>
        </>
      )}
    </div>
  );
};
