import { GlassCard } from '@/shared/components/GlassCard';

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <GlassCard className="p-5">
      <p className="text-xs uppercase tracking-wider text-muted-subtle">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold text-olive-700 dark:text-sand-100">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-subtle">{hint}</p>}
    </GlassCard>
  );
}
