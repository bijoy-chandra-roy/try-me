'use client';

import type { ProductCustomField } from '@/shared/types';
import { GlassButton } from '@/shared/components/GlassButton';
import { TagListField } from '@/shared/components/TagListField';

interface CustomFieldsEditorProps {
  label?: string;
  hint?: string;
  fields: ProductCustomField[];
  onChange: (fields: ProductCustomField[]) => void;
  disabled?: boolean;
}

export function CustomFieldsEditor({
  label = 'Custom fields',
  hint = 'Optional. Add labeled option groups (Color, Material, …) or unlabeled options like sizes.',
  fields,
  onChange,
  disabled,
}: CustomFieldsEditorProps) {
  function updateField(index: number, patch: Partial<ProductCustomField>) {
    onChange(
      fields.map((field, i) => (i === index ? { ...field, ...patch } : field))
    );
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  function addField() {
    onChange([...fields, { label: '', options: [] }]);
  }

  return (
    <div>
      {label && <label className="mb-1 block text-xs capitalize">{label}</label>}
      {hint && <p className="mb-1.5 text-xs text-muted-subtle">{hint}</p>}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={index}
            className="rounded-lg border border-sand-300/60 p-3 dark:border-olive-500/40"
          >
            <div className="mb-2 flex items-center gap-2">
              <input
                value={field.label}
                disabled={disabled}
                placeholder="Label (optional)"
                onChange={(e) => updateField(index, { label: e.target.value })}
                className="input-glass min-w-0 flex-1 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeField(index)}
                className="shrink-0 rounded-lg px-2 text-sm text-muted-subtle hover:text-red-600 disabled:opacity-40"
                aria-label={`Remove field ${field.label || index + 1}`}
              >
                ×
              </button>
            </div>
            <TagListField
              values={field.options}
              onChange={(options) => updateField(index, { options })}
              placeholder="Add option and press Enter"
              disabled={disabled}
            />
          </div>
        ))}
      </div>

      <GlassButton
        type="button"
        disabled={disabled}
        onClick={addField}
        className="mt-2"
      >
        Add field
      </GlassButton>
    </div>
  );
}
