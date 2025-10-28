import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  correct?: boolean | null;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  selected = false,
  correct = null,
}) => {
  let statusClass = '';
  if (correct === true) {
    statusClass = 'choice-card-correct';
  } else if (correct === false) {
    statusClass = 'choice-card-incorrect';
  } else if (selected) {
    statusClass = 'choice-card-selected';
  }

  const baseClass = onClick ? 'choice-card' : 'card';

  return (
    <div
      onClick={onClick}
      className={`${baseClass} ${statusClass} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};
