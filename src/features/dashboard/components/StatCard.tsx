import { GlassCard } from '@/shared/components/GlassCard';
import { OverflowText } from '@/shared/components/OverflowText';

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  const displayValue = typeof value === 'number' ? String(value) : value;

  return (
    <GlassCard className="p-5" elastic={false}>
      <p className="text-xs uppercase tracking-wider text-muted-subtle">{label}</p>
      <OverflowText
        as="p"
        className="mt-2 font-serif text-3xl font-semibold text-primary"
        title={displayValue}
      >
        {displayValue}
      </OverflowText>
      {hint && <p className="mt-1 text-xs text-muted-subtle">{hint}</p>}
    </GlassCard>
  );
}
