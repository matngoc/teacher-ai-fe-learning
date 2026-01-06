import React, { useEffect } from 'react';
import { Input, Select, Radio, Collapse, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '~/stores';
import type { RootState } from '~/stores';
import { learnerActions } from '~/stores/learnerSlice';
import type { AudioMode } from '~/stores/learnerSlice';
import { LearnerService } from '~/api/services/LearnerService';

const { Option } = Select;
const { Panel } = Collapse;

export const ConfigPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { config, todos, showAdvanced } = useSelector((state: RootState) => state.learner);

  useEffect(() => {
    // Set default user ID if empty
    if (!config.userId) {
      dispatch(learnerActions.updateConfig({ userId: 'string' }));
    }

    // Fetch todo list on mount
    const fetchTodos = async () => {
      try {
        const response = await LearnerService.fetchTodoList();
        dispatch(learnerActions.setTodos(response.data));
        
        // Set default todo if available
        const defaultTodo = response.data.find((todo: any) => todo.status_action);
        if (defaultTodo && !config.todoId) {
          dispatch(learnerActions.updateConfig({ todoId: defaultTodo.id }));
        } else if (response.data.length > 0 && !config.todoId) {
          dispatch(learnerActions.updateConfig({ todoId: response.data[0].id }));
        }
      } catch (error) {
        dispatch(learnerActions.addLog({
          message: `Failed to fetch todos: ${error}`,
          type: 'error',
        }));
      }
    };

    fetchTodos();
  }, [dispatch]);

  const handleModeChange = (mode: AudioMode) => {
    dispatch(learnerActions.setMode(mode));
    dispatch(learnerActions.addLog({
      message: `Switched to ${mode.toUpperCase()} mode`,
      type: 'info',
    }));
  };

  const handleAsrTypeChange = (asrType: string) => {
    dispatch(learnerActions.setAsrType(asrType));
    dispatch(learnerActions.addLog({
      message: `ASR type changed to: ${asrType}`,
      type: 'info',
    }));
  };

  return (
    <div className="bg-gray-50 rounded-xl p-5 mb-5">
      <Space direction="vertical" className="w-full" size="middle">
        {/* Todo Selection */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2 text-sm">
            📋 Select Todo
          </label>
          <Select
            value={config.todoId || undefined}
            onChange={(value) => dispatch(learnerActions.updateConfig({ todoId: value }))}
            placeholder="Select a todo"
            className="w-full"
            loading={todos.length === 0}
          >
            {todos.map((todo: any) => (
              <Option key={todo.id} value={todo.id}>
                {todo.name}
                {todo.status_action && <span className="ml-2 text-xs text-green-600">(Default)</span>}
              </Option>
            ))}
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Choose your learning activity
          </p>
        </div>

        {/* Todo ID (readonly) */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2 text-sm">
            🆔 Todo ID (auto-filled)
          </label>
          <Input
            value={config.todoId}
            readOnly
            className="font-mono bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Automatically filled from selected todo
          </p>
        </div>

        {/* Mode Selection */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2 text-sm">
            🎯 Interaction Mode
          </label>
          <Radio.Group
            value={config.mode}
            onChange={(e) => handleModeChange(e.target.value)}
            className="w-full"
          >
            <Space direction="vertical" className="w-full">
              <Radio value="direct" className="w-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium">🎤 Direct Audio</span>
                  <span className="text-xs text-gray-500">(Real-time streaming)</span>
                </div>
              </Radio>
              <Radio value="stt" className="w-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium">🗣️ Speech-to-Text</span>
                  <span className="text-xs text-gray-500">(Browser STT)</span>
                </div>
              </Radio>
              <Radio value="text" className="w-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium">💬 Text Chat</span>
                  <span className="text-xs text-gray-500">(Keyboard only)</span>
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {/* Advanced Settings */}
        <Collapse
          ghost
          activeKey={showAdvanced ? ['advanced'] : []}
          onChange={(keys) => {
            if (keys.includes('advanced') !== showAdvanced) {
              dispatch(learnerActions.toggleAdvanced());
            }
          }}
        >
          <Panel
            header={
              <span className="text-indigo-600 font-semibold text-sm">
                ⚙️ Advanced Settings
              </span>
            }
            key="advanced"
          >
            <Space direction="vertical" className="w-full" size="middle">
              {/* User ID Input - moved to Advanced */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2 text-sm">
                  👤 User ID
                </label>
                <Input
                  value={config.userId}
                  onChange={(e) => dispatch(learnerActions.updateConfig({ userId: e.target.value }))}
                  placeholder="Enter user ID"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required for conversation initialization
                </p>
              </div>

              {/* ASR Type (only for voice modes) */}
              {config.mode !== 'text' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-2 text-sm">
                    🎙️ ASR Engine
                  </label>
                  <Select
                    value={config.asrType}
                    onChange={handleAsrTypeChange}
                    className="w-full"
                  >
                    <Option value="grpc">gRPC ASR</Option>
                    <Option value="grpc_silero">gRPC + Silero VAD</Option>
                    <Option value="google_silero">Google + Silero VAD</Option>
                    <Option value="google">Google STT</Option>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatic Speech Recognition engine
                  </p>
                </div>
              )}
            </Space>

              {/* WebSocket URL */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2 text-sm">
                  🔗 WebSocket URL
                </label>
                <Input
                  value={config.wsUrl}
                  onChange={(e) => dispatch(learnerActions.updateConfig({ wsUrl: e.target.value }))}
                  placeholder="ws://..."
                  className="font-mono text-xs"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated based on mode
                </p>
              </div>
          </Panel>
        </Collapse>
      </Space>
    </div>
  );
};
