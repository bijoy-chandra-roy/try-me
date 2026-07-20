'use client';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`inline-flex items-center gap-2 text-sm text-olive-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40 dark:text-sand-100 ${className}`}
    >
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          checked
            ? 'border-olive-600 bg-olive-600 text-sand-50 dark:border-sand-200 dark:bg-sand-200 dark:text-olive-800'
            : 'border-sand-300/80 bg-white/80 text-transparent hover:border-olive-500 dark:border-olive-500/50 dark:bg-olive-800/70 dark:hover:border-sand-400'
        }`}
      >
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M2.5 6.2L4.8 8.5L9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label ? <span>{label}</span> : null}
    </button>
  );
}
