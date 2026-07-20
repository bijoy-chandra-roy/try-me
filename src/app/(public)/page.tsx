import { CatalogHome } from '@/features/products/components/CatalogHome';
import { getCachedProducts } from '@/server/features/products/product.queries';
import { getCachedSystemStatus } from '@/server/features/system/system-status.queries';

export default async function HomePage() {
  const [products, systemStatus] = await Promise.all([
    getCachedProducts(),
    getCachedSystemStatus(),
  ]);

  return (
    <CatalogHome
      initialProducts={products}
      initialMaintenanceMode={systemStatus.maintenanceMode}
      initialGuestTryOnLimit={systemStatus.guestTryOnLimit}
    />
  );
}
