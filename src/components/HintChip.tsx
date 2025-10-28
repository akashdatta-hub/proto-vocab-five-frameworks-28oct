import React, { useState } from 'react';

interface HintChipProps {
  teluguScript: string;
  transliteration: string;
  onToggle?: (isOpen: boolean) => void;
}

export const HintChip: React.FC<HintChipProps> = ({
  teluguScript,
  transliteration,
  onToggle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <div className="inline-block">
      <button
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label="Toggle Telugu hint"
        className="btn-secondary text-sm inline-flex items-center gap-2"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
        <span>{isOpen ? 'Hide' : 'Show'} Telugu hint</span>
      </button>
      {isOpen && (
        <div className="mt-2 card bg-blue-50 border-blue-200">
          <div className="text-2xl font-semibold text-center mb-1">{teluguScript}</div>
          <div className="text-sm text-gray-600 text-center italic">{transliteration}</div>
        </div>
      )}
    </div>
  );
};
