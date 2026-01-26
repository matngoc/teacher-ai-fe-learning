import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '~/stores';
import type { BoardTextSegment } from '../types/board';

interface BoardProps {
  className?: string;
}

export const Board: React.FC<BoardProps> = ({ className = '' }) => {
  const currentBoard = useSelector((state: RootState) => state.learner.currentBoard);

  if (!currentBoard || !currentBoard.isVisible) {
    return null;
  }

  const { layout, segments } = currentBoard;

  // Calculate font size for auto_center layout based on total text length
  const getAutoCenterFontSize = (totalLength: number): string => {
    if (totalLength < 20) return 'text-6xl'; // Very large
    if (totalLength < 50) return 'text-5xl'; // Large
    if (totalLength < 100) return 'text-4xl'; // Medium-large
    if (totalLength < 200) return 'text-3xl'; // Medium
    if (totalLength < 300) return 'text-2xl'; // Small-medium
    return 'text-xl'; // Small
  };

  // Helper function to render text with character-level highlighting
  const renderTextWithHighlight = (segment: BoardTextSegment, fontSize: string = '') => {
    const { text, color, highlight_indexes, highlight_color } = segment;
    
    if (!highlight_indexes || highlight_indexes.length === 0) {
      // No highlighting
      return <span style={{ color }}>{text}</span>;
    }
    
    // Render each character with optional highlight
    return (
      <>
        {text.split('').map((char, charIndex) => {
          const isHighlighted = highlight_indexes.includes(charIndex);
          return (
            <span
              key={charIndex}
              style={{
                color: color,
                backgroundColor: isHighlighted ? highlight_color : 'transparent',
                padding: isHighlighted ? '2px 1px' : '0',
                borderRadius: isHighlighted ? '3px' : '0',
              }}
            >
              {char}
            </span>
          );
        })}
      </>
    );
  };

  if (layout === 'auto_center') {
    // Auto-center layout: single centered text with dynamic font size
    const totalText = segments.map(s => s.text).join(' ');
    const totalLength = totalText.length;
    const fontSize = getAutoCenterFontSize(totalLength);

    return (
      <div className={`bg-white rounded-lg shadow-lg p-8 flex items-center justify-center min-h-[400px] ${className}`}>
        <div className={`${fontSize} font-bold text-center leading-relaxed`}>
          {segments.map((segment, index) => (
            <span
              key={segment.id}
              className="inline-block mr-2"
            >
              {renderTextWithHighlight(segment, fontSize)}
              {index < segments.length - 1 && ' '}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Normal layout: fixed font size, text flows from top-left
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 min-h-[400px] ${className}`}>
      <div className="flex flex-wrap gap-2 items-start">
        {segments.map((segment: BoardTextSegment) => (
          <div
            key={segment.id}
            className="text-2xl font-semibold"
          >
            {renderTextWithHighlight(segment)}
          </div>
        ))}
      </div>
    </div>
  );
};
