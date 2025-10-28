import React from 'react';

interface FeedbackButtonProps {
  onClick: () => void;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Open feedback panel"
      title="Give Feedback"
      className="fixed top-4 right-20 z-50 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <span aria-hidden="true">💬</span>
    </button>
  );
};
