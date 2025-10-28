import React from 'react';
import { Card } from './Card';

interface Choice {
  id: string;
  label: string;
  content?: React.ReactNode;
}

interface ChoiceGridProps {
  choices: Choice[];
  selectedId: string | null;
  correctId?: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
  columns?: number;
}

export const ChoiceGrid: React.FC<ChoiceGridProps> = ({
  choices,
  selectedId,
  correctId = null,
  onSelect,
  disabled = false,
  columns = 2,
}) => {
  const gridClass = columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1';

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {choices.map((choice) => {
        const isSelected = selectedId === choice.id;
        let correct: boolean | null = null;

        if (correctId !== null && isSelected) {
          correct = choice.id === correctId;
        }

        return (
          <Card
            key={choice.id}
            selected={isSelected}
            correct={correct}
            onClick={disabled ? undefined : () => onSelect(choice.id)}
            className="text-center"
          >
            {choice.content || <p className="text-lg font-medium">{choice.label}</p>}
          </Card>
        );
      })}
    </div>
  );
};
