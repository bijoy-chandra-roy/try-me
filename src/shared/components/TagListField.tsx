'use client';

import { useState } from 'react';

interface TagListFieldProps {
  label?: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TagListField({
  label,
  hint,
  values,
  onChange,
  placeholder = 'Type and press Enter',
  disabled,
}: TagListFieldProps) {
  const [draft, setDraft] = useState('');

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    if (values.some((v) => v.toLowerCase() === tag.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...values, tag]);
    setDraft('');
  }

  function removeTag(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div>
      {label && <label className="mb-1 block text-xs capitalize">{label}</label>}
      {hint && <p className="mb-1.5 text-xs text-muted-subtle">{hint}</p>}

      {values.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {values.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className="chip-size inline-flex items-center gap-1"
            >
              {value}
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeTag(index)}
                className="ml-0.5 rounded text-current/70 hover:text-current disabled:opacity-40"
                aria-label={`Remove ${value}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        value={draft}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(draft);
          } else if (e.key === 'Backspace' && !draft && values.length > 0) {
            removeTag(values.length - 1);
          }
        }}
        onBlur={() => addTag(draft)}
        className="input-glass w-full rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}
