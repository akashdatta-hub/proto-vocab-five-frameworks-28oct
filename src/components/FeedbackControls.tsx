import React from 'react';
import type { Thumb, Difficulty } from '../data/feedback';

interface FeedbackControlsProps {
  thumb: Thumb;
  setThumb: (value: Thumb) => void;
  include: boolean | null;
  setInclude: (value: boolean | null) => void;
  difficulty: Difficulty;
  setDifficulty: (value: Difficulty) => void;
  comment: string;
  setComment: (value: string) => void;
}

export const FeedbackControls: React.FC<FeedbackControlsProps> = ({
  thumb,
  setThumb,
  include,
  setInclude,
  difficulty,
  setDifficulty,
  comment,
  setComment,
}) => {
  return (
    <div className="space-y-6">
      {/* Thumbs Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How was this question? (optional)
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setThumb(thumb === 'up' ? null : 'up')}
            aria-label="Thumbs up"
            aria-pressed={thumb === 'up'}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors text-2xl ${
              thumb === 'up'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
          >
            👍
          </button>
          <button
            onClick={() => setThumb(thumb === 'down' ? null : 'down')}
            aria-label="Thumbs down"
            aria-pressed={thumb === 'down'}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors text-2xl ${
              thumb === 'down'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
            }`}
          >
            👎
          </button>
        </div>
      </div>

      {/* Include Checkbox */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={include === true}
            onChange={(e) => setInclude(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Include this type of question? (optional)
          </span>
        </label>
      </div>

      {/* Difficulty Radio Group */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          How difficult would this be for class 5 students? (optional)
        </legend>
        <div className="space-y-2">
          {(['easy', 'medium', 'difficult'] as const).map((level) => (
            <label
              key={level}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="difficulty"
                value={level}
                checked={difficulty === level}
                onChange={() => setDifficulty(level)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">{level}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Comment Textarea */}
      <div>
        <label
          htmlFor="feedback-comment"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          In a few words, explain your rating (optional)
        </label>
        <textarea
          id="feedback-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>
    </div>
  );
};
