import { CartLineSkeleton, Skeleton } from '@/shared/components/Skeleton';

export default function CartLoading() {
  return (
    <div className="mx-auto max-w-form px-6 py-10">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-8">
        <CartLineSkeleton rows={3} />
      </div>
    </div>
  );
}
