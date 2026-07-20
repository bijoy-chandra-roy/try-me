'use client';

const STATUS_CLASS: Record<string, string> = {
  active: 'status-chip-active',
  approved: 'status-chip-approved',
  inactive: 'status-chip-inactive',
  suspended: 'status-chip-suspended',
  rejected: 'status-chip-rejected',
  pending: 'status-chip-pending',
};

export function StatusChip({
  status,
  className = '',
}: {
  status: string;
  className?: string;
}) {
  const key = status.toLowerCase();
  const tone = STATUS_CLASS[key] ?? 'chip-category';

  return (
    <span className={`status-chip ${tone} ${className}`.trim()}>{status}</span>
  );
}
