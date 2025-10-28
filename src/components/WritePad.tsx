import React, { ChangeEvent } from 'react';

interface WritePadProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  maxLength?: number;
  rows?: number;
}

export const WritePad: React.FC<WritePadProps> = ({
  value,
  onChange,
  placeholder = 'Type your answer here...',
  disabled = false,
  label,
  maxLength,
  rows = 3,
}) => {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor="writepad" className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        id="writepad"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        className="input-field resize-none"
        aria-label={label || 'Text input area'}
      />
      {maxLength && (
        <div className="text-xs text-gray-500 mt-1 text-right">
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
};
