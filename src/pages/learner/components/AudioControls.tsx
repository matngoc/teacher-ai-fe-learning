import React from 'react';
import { Button, Space } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '~/stores';
import SpaceKeyIcon from '~/assets/space-key-icon.svg';

interface AudioControlsProps {
  onConnect: () => void;
  onDisconnect: () => void;
  onMicPress: () => void;
  onMicRelease: () => void;
  disabled?: boolean;
  hideConnectionControls?: boolean;
  hasError?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  onConnect,
  onDisconnect,
  onMicPress,
  onMicRelease,
  disabled = false,
  hideConnectionControls = false,
  hasError = false,
}) => {
  const { connectionStatus, isRecording, isHoldMode, config } = useSelector((state: RootState) => state.learner);
  const isConnected = connectionStatus === 'connected' || connectionStatus === 'listening';
  const isConnecting = connectionStatus === 'connecting';

  // Retry handler: disconnect then reconnect
  const handleRetry = () => {
    onDisconnect();
    setTimeout(() => {
      onConnect();
    }, 500);
  };

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
      {!hideConnectionControls && (
        <Space className="mb-5">
          {!isConnected && !isConnecting && (
            <>
              <Button
                type="primary"
                size="large"
                onClick={onConnect}
                disabled={disabled}
                className="px-8 py-2 h-auto rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                🔌 Connect & Auto-Start
              </Button>
              
              {hasError && (
                <Button
                  type="default"
                  size="large"
                  onClick={handleRetry}
                  disabled={disabled}
                  className="px-8 py-2 h-auto rounded-full shadow-lg hover:shadow-xl transition-all border-orange-500 text-orange-600 hover:border-orange-600 hover:text-orange-700"
                >
                  🔄 Retry Connection
                </Button>
              )}
            </>
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
      )}

      {/* Status Display */}
      {!hideConnectionControls && (
        <div className={`rounded-xl p-4 mb-5 font-semibold text-center ${status.className}`}>
          {status.text}
        </div>
      )}

      {/* Audio Control Button (only for voice modes) */}
      {config.mode !== 'text' && (
        <div className="flex flex-col items-center">
          {/* Circular Button */}
          <button
            className={`border-4 cursor-pointer transition-all shadow-xl hover:shadow-2xl flex items-center justify-center
              ${isHoldMode
                ? 'bg-gradient-to-br from-orange-500 to-red-600 border-orange-700 scale-95 animate-pulse' 
                : isRecording 
                  ? 'bg-gradient-to-br from-yellow-400 to-pink-500 border-pink-700 scale-95' 
                  : 'bg-gradient-to-br from-purple-400 to-pink-600 border-purple-700 hover:scale-105'
              }
              ${!isConnected || disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            style={{ 
              width: '160px', 
              height: '160px',
              borderRadius: '50%',
              borderColor: isHoldMode ? '#c2410c' : isRecording ? '#be185d' : '#6b21a8'
            }}
            onClick={!isConnected && !disabled ? (hasError ? handleRetry : onConnect) : undefined}
            onMouseDown={!disabled && isConnected ? onMicPress : undefined}
            onMouseUp={!disabled && isConnected ? onMicRelease : undefined}
            onTouchStart={!disabled && isConnected ? onMicPress : undefined}
            onTouchEnd={!disabled && isConnected ? onMicRelease : undefined}
            disabled={disabled && !hasError}
          >
            {/* Icon based on state */}
            <div className="text-white text-7xl">
              {!isConnected 
                ? (hasError ? '🔄' : '🔌')
                : (isHoldMode || isRecording) ? '👂' : '🗣️'}
            </div>
          </button>
          
          {/* Status Text */}
          <div className="text-center mt-6 max-w-xs">
            <div className="text-gray-800 font-semibold text-lg mb-2">
              {!isConnected
                ? (hasError ? 'Connection failed' : 'Not connected')
                : isHoldMode
                  ? 'Hana listening...'
                  : isRecording
                    ? 'Hana listening...'
                    : 'Hana speaking...'
              }
            </div>
            <div className="text-gray-600 text-sm flex items-center justify-center gap-1">
              {!isConnected
                ? (hasError ? 'Click to retry' : 'Connect to start')
                : isHoldMode
                  ? <>Release <img src={SpaceKeyIcon} alt="space" className="inline w-4 h-4" /> to stop</>
                  : isRecording
                    ? 'Auto stop on pause'
                    : <>Press or hold <img src={SpaceKeyIcon} alt="space" className="inline w-4 h-4" /> to interrupt</>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
