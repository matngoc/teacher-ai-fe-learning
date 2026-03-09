import React from 'react';
import type { Checkpoint } from '../types/checkpoint';

interface SimpleCheckpointEditorProps {
  initialCheckpoints?: Checkpoint[];
  onSave?: (checkpoints: Checkpoint[]) => void;
}

/**
 * Simplified Checkpoint Editor - Falls back to JSON editing if dependencies not installed
 * Install lucide-react and @dnd-kit packages for full featured editor
 */
export function SimpleCheckpointEditor({ initialCheckpoints = [], onSave }: SimpleCheckpointEditorProps) {
  const [jsonValue, setJsonValue] = React.useState(JSON.stringify(initialCheckpoints, null, 2));
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setJsonValue(JSON.stringify(initialCheckpoints, null, 2));
  }, [initialCheckpoints]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonValue(value);
    
    try {
      const parsed = JSON.parse(value);
      setError('');
      if (onSave) {
        onSave(parsed);
      }
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Install <code className="bg-blue-100 px-2 py-1 rounded">lucide-react</code> and <code className="bg-blue-100 px-2 py-1 rounded">@dnd-kit</code> packages for the full featured visual editor.
        </p>
        <p className="text-sm text-blue-800 mt-2">
          Run: <code className="bg-blue-100 px-2 py-1 rounded">npm install lucide-react @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities</code>
        </p>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Checkpoints (JSON)
        </label>
        <textarea
          value={jsonValue}
          onChange={handleChange}
          className="w-full h-96 p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder='[{"name": "Checkpoint 1", "type": "narrative", "question": "...", "media_list": []}]'
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Checkpoint Structure:</h3>
        <pre className="text-xs overflow-x-auto">
{`{
  "name": "Checkpoint Name",
  "type": "narrative" | "cta",
  "question": "Question text",
  "response_guide": "Response guide (for CTA only)",
  "media_list": [
    {
      "id": "unique_id",
      "type": "for_question" | "for_response",
      "image_url": "https://...",
      "audio_url": "https://...",
      "media_description": "..."
    }
  ],
  "image_listening": "https://..." (for CTA only)
}`}
        </pre>
      </div>
    </div>
  );
}
