import React, { useEffect, useRef } from 'react';
import { Input, Button, Space } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import type { RootState } from '~/stores';
import type { ChatMessage } from '~/stores/learnerSlice';

interface ChatDisplayProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatDisplay: React.FC<ChatDisplayProps> = ({ onSendMessage, disabled = false }) => {
  const { messages } = useSelector((state: RootState) => state.learner);
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (message: ChatMessage) => {
    switch (message.type) {
      case 'user':
        return (
          <div key={message.id} className="flex justify-end mb-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-xl px-4 py-3 max-w-[80%] shadow-md">
              <p className="m-0 leading-relaxed">{message.content}</p>
            </div>
          </div>
        );

      case 'assistant':
        return (
          <div key={message.id} className="flex justify-start mb-3">
            <div className="bg-gray-100 text-gray-900 rounded-xl px-4 py-3 max-w-[80%] shadow-sm">
              <p className="m-0 leading-relaxed">{message.content}</p>
            </div>
          </div>
        );

      case 'system':
        return (
          <div key={message.id} className="flex justify-center mb-3">
            <div className="bg-yellow-50 text-yellow-800 rounded-lg px-3 py-2 text-sm italic text-center max-w-[70%]">
              {message.content}
            </div>
          </div>
        );

      case 'function':
        return (
          <div key={message.id} className="flex justify-start mb-3">
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg px-4 py-3 max-w-[85%] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚙️</span>
                <span className="font-semibold text-amber-800">Function Call</span>
                <code className="bg-amber-100 px-2 py-1 rounded text-xs text-amber-900">
                  {message.functionName}
                </code>
              </div>
              {message.functionArgs && (
                <div className="mt-2">
                  <div className="text-xs text-gray-600 font-semibold mb-1">ARGUMENTS:</div>
                  <pre className="bg-gray-100 rounded p-2 text-xs text-gray-800 overflow-x-auto m-0">
                    {JSON.stringify(message.functionArgs, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );

      case 'image':
        return (
          <div key={message.id} className="flex justify-start mb-3">
            <div className="flex gap-2 flex-wrap max-w-[90%]">
              {message.imageUrls?.map((url: string, index: number) => (
                <img
                  key={index}
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg shadow-md"
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl p-4 overflow-y-auto mb-3"
        style={{ height: '400px' }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet. Start a conversation!
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Container */}
      <Space.Compact className="w-full">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={disabled}
          size="large"
          className="flex-1"
        />
        <Button
          type="primary"
          size="large"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={disabled || !inputValue.trim()}
          className="px-6"
        >
          Send
        </Button>
      </Space.Compact>
    </div>
  );
};
