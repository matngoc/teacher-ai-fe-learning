import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '~/stores';

export const LogPanel: React.FC = () => {
  const { logs } = useSelector((state: RootState) => state.learner);
  const logEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400';
      case 'error':
        return 'text-red-400';
      case 'info':
        return 'text-blue-400';
      case 'debug':
        return 'text-gray-400';
      default:
        return 'text-gray-300';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-3">
        <span className="font-semibold text-gray-700">📋 Event Logs</span>
        <span className="text-xs text-gray-500">
          ({logs.length} {logs.length === 1 ? 'entry' : 'entries'})
        </span>
      </div>
      
      <div
        ref={logContainerRef}
        className="bg-gray-900 text-gray-300 rounded-xl p-4 h-52 overflow-y-auto font-mono text-xs leading-relaxed shadow-inner"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#4B5563 #1F2937',
        }}
      >
        {logs.length === 0 ? (
          <div className="text-gray-600 italic">No logs yet...</div>
        ) : (
          <>
            {logs.map((log: any, index: number) => (
              <div key={index} className="mb-1">
                <span className="text-gray-600">[{formatTime(log.timestamp)}]</span>
                {' '}
                <span className={getLogColor(log.type)}>{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </>
        )}
      </div>
    </div>
  );
};
