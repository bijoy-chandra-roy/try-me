import { OrderDetailSkeleton } from '@/shared/components/Skeleton';

export default function OrderDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <OrderDetailSkeleton />
    </div>
  );
}
