import { useState, useEffect } from "react";

interface TextHighlighterProps {
  text: string;
  selectedIndices: number[];
  onChange: (indices: number[]) => void;
}

export function TextHighlighter({ text, selectedIndices, onChange }: TextHighlighterProps) {
  const [localIndices, setLocalIndices] = useState<number[]>(selectedIndices);

  useEffect(() => {
    setLocalIndices(selectedIndices);
  }, [selectedIndices]);

  const toggleIndex = (index: number) => {
    const newIndices = localIndices.includes(index)
      ? localIndices.filter(i => i !== index)
      : [...localIndices, index].sort((a, b) => a - b);
    
    setLocalIndices(newIndices);
    onChange(newIndices);
  };

  const clearAll = () => {
    setLocalIndices([]);
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Highlight Characters</label>
        {localIndices.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Clear all ({localIndices.length})
          </button>
        )}
      </div>
      <div className="p-3 border rounded-lg bg-white min-h-[60px]">
        {text ? (
          <div className="flex flex-wrap gap-1 font-mono text-base leading-relaxed">
            {text.split('').map((char, index) => (
              <button
                key={index}
                type="button"
                onClick={() => toggleIndex(index)}
                className={`
                  px-1 py-0.5 rounded cursor-pointer transition-all border
                  ${localIndices.includes(index) 
                    ? 'bg-yellow-300 text-gray-900 border-yellow-400 font-semibold' 
                    : 'bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }
                  ${char === ' ' ? 'min-w-[12px] bg-gray-50' : ''}
                `}
                title={`Index: ${index}`}
              >
                {char === ' ' ? '\u00A0' : char}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Enter text above to start highlighting</p>
        )}
      </div>
      {localIndices.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-600">
            Selected indices: [{localIndices.join(', ')}]
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-gray-600 mr-2">Highlights:</span>
            {localIndices.map((idx) => (
              <div
                key={idx}
                className="px-2 py-1 flex items-center justify-center bg-yellow-300 border border-yellow-400 rounded font-mono font-semibold text-sm"
              >
                {text[idx]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
