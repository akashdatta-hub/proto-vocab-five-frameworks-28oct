import React, { useState } from 'react';
import { speakEnglish } from '../lib/tts';

interface AudioButtonProps {
  text: string;
  label?: string;
  onPlay?: () => void;
  rate?: number;
  className?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  label = 'Play audio',
  onPlay,
  rate = 1.0,
  className = '',
}) => {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const handlePlay = () => {
    if (!supported) return;

    setSpeaking(true);
    speakEnglish(text, {
      rate,
      onend: () => setSpeaking(false),
      onerror: () => setSpeaking(false),
    });

    if (onPlay) {
      onPlay();
    }
  };

  if (!supported) {
    return (
      <div className="text-sm text-gray-500 italic" role="status">
        Audio not supported. Text: "{text}"
      </div>
    );
  }

  return (
    <button
      onClick={handlePlay}
      disabled={speaking}
      aria-label={label}
      className={`btn-primary inline-flex items-center gap-2 disabled:opacity-50 ${className}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        {speaking ? (
          <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
        ) : (
          <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14" />
        )}
      </svg>
      <span>{speaking ? 'Playing...' : 'Play'}</span>
    </button>
  );
};
