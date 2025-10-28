import React, { useState, useEffect } from 'react';
import { getSoundEnabled, setSoundEnabled, initAudio } from '../lib/confetti';

export const SoundToggle: React.FC = () => {
  const [enabled, setEnabled] = useState(getSoundEnabled());

  useEffect(() => {
    initAudio();
  }, []);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    setSoundEnabled(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all"
      aria-label={enabled ? 'Mute sound effects' : 'Enable sound effects'}
      title={enabled ? 'Sound ON' : 'Sound OFF'}
    >
      {enabled ? (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-600"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-400"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </button>
  );
};
