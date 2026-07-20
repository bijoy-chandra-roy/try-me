import { CartLineSkeleton, Skeleton } from '@/shared/components/Skeleton';

export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-8 space-y-6">
        <div className="glass-card space-y-3 p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="glass-card space-y-3 p-6">
          <Skeleton className="h-6 w-28" />
          <CartLineSkeleton rows={2} />
        </div>
      </div>
    </div>
  );
}
