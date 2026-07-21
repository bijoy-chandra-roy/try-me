'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from '@/shared/components/Link';
import { Button } from '@/shared/components/Button';
import { GlassCard } from '@/shared/components/GlassCard';
import { OverflowText } from '@/shared/components/OverflowText';
import { Popover } from '@/shared/components/Popover';
import { Tooltip } from '@/shared/components/Tooltip';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { useAuth, usePermission } from '@/shared/hooks/useAuth';
import { useSystemStatus } from '@/shared/hooks/useSystemStatus';
import { useT } from '@/shared/hooks/useT';
import { addToCart } from '@/features/cart/api/cart.api';
import { setCartStore } from '@/features/cart/hooks/useCart';
import { ApiError } from '@/shared/lib/api-client';
import type { CatalogLayout } from '@/features/products/lib/catalog-filters';
import type { Product } from '@/shared/types';

interface ProductCardProps {
  product: Product;
  onTryOn: (product: Product) => void;
  layout?: CatalogLayout;
  /** Prefer eager load for above-the-fold cards (first ~6). */
  priority?: boolean;
}

export function ProductCard({
  product,
  onTryOn,
  layout = 'grid',
  priority = false,
}: ProductCardProps) {
  const t = useT();
  const isList = layout === 'list';
  const isCompact = layout === 'compact';
  const isUnavailable = !product.inStock || product.stockQuantity <= 0;
  const { isAuthenticated } = useAuth();
  const hasTryOnPermission = usePermission('try_on');
  const canManageCart = usePermission('manage_cart');
  const canTryOn = !isAuthenticated || hasTryOnPermission;
  const { tryOnBlocked } = useSystemStatus();
  const tryOnDisabled = isUnavailable || tryOnBlocked || !canTryOn;

  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? '');
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    if (!product.imageUrl || typeof window === 'undefined') return;
    try {
      const img = new window.Image();
      img.fetchPriority = 'low';
      img.decoding = 'async';
      img.src = product.imageUrl;
    } catch {
      /* ignore */
    }
  }, [product.imageUrl]);

  const tryOnTooltip = tryOnBlocked
    ? t('product.tryOnMaintenance')
    : isUnavailable
      ? t('product.tryOnUnavailable')
      : t('product.tryOnPreview');

  const needsSize = (product.sizes?.length ?? 0) > 0;
  const cartDisabled = isUnavailable || adding || (needsSize && !selectedSize);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent('/')}`;
      return;
    }
    if (!canManageCart) {
      setCartMessage(t('product.noCartPermission'));
      return;
    }
    setAdding(true);
    setCartMessage('');
    try {
      const cart = await addToCart({
        productId: product._id,
        quantity: 1,
        size: needsSize ? selectedSize : undefined,
      });
      setCartStore(cart);
      setCartMessage(t('product.addedToCart'));
    } catch (err) {
      setCartMessage(err instanceof ApiError ? err.message : t('product.addFailed'));
    } finally {
      setAdding(false);
    }
  }

  const imageSizes = isList
    ? '(max-width: 640px) 112px, 144px'
    : isCompact
      ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
      : '(max-width: 640px) 50vw, (max-width: 1200px) 50vw, 33vw';

  const bodyPadding = isList
    ? 'gap-2 p-3 sm:gap-3 sm:p-4'
    : isCompact
      ? 'gap-2 p-2.5 sm:gap-2.5 sm:p-3'
      : 'gap-2.5 p-3 sm:gap-3 sm:p-5';

  const titleClass = isCompact
    ? 'font-serif text-sm font-semibold leading-snug text-primary sm:text-base'
    : 'font-serif text-base font-semibold leading-snug text-primary sm:text-lg';

  return (
    <GlassCard
      hover
      elastic={!isList}
      className={`group motion-card-hover flex ${isList ? 'flex-row' : 'flex-col'} ${
        isUnavailable ? 'row-dimmed' : ''
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden ${
          isList
            ? 'aspect-[3/4] w-28 sm:w-36'
            : 'aspect-[3/4] w-full'
        }`}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={imageSizes}
        />
        {isUnavailable && (
          <span className="chip absolute left-2 top-2 bg-[var(--color-accent-fill)] text-[var(--color-on-accent)] sm:left-3 sm:top-3">
            {t('product.outOfStock')}
          </span>
        )}
        {!isUnavailable && product.stockQuantity <= 5 && (
          <span className="chip absolute left-2 top-2 status-chip-pending sm:left-3 sm:top-3">
            {t('product.onlyNLeft', { n: product.stockQuantity })}
          </span>
        )}
      </div>

      <div className={`flex min-w-0 flex-1 flex-col ${bodyPadding}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="chip-category mb-1">{product.category}</span>
            <OverflowText as="h3" className={titleClass} title={product.name}>
              {product.name}
            </OverflowText>
            {!isCompact && (
              <p
                className={`mt-1 text-sm text-muted ${
                  isList ? 'line-clamp-2 sm:line-clamp-3' : 'line-clamp-2'
                }`}
              >
                {product.description}
              </p>
            )}
            {(product.reviewCount ?? 0) > 0 && (
              <p className="mt-1 text-xs text-muted">
                {t('product.reviews', {
                  rating: product.averageRating?.toFixed(1) ?? '0',
                  n: product.reviewCount ?? 0,
                })}
              </p>
            )}
          </div>
          {!isCompact && (
            <Popover
              label={t('product.moreOptions')}
              items={[
                {
                  label: t('product.copyName'),
                  onClick: () => navigator.clipboard.writeText(product.name),
                },
                {
                  label: t('product.copyPrice'),
                  onClick: () =>
                    navigator.clipboard.writeText(`$${product.price.toFixed(2)}`),
                },
              ]}
            />
          )}
        </div>

        {(product.sizes ?? []).length > 0 && (
          <div className={`flex flex-wrap gap-1 ${isCompact ? 'gap-1' : 'gap-1.5'}`}>
            {(product.sizes ?? []).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`chip-size transition ${
                  isCompact ? '!px-1.5 !py-0.5 text-[0.65rem]' : ''
                } ${
                  selectedSize === size
                    ? 'bg-[var(--color-accent-fill)] text-[var(--color-on-accent)]'
                    : ''
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {!isCompact &&
          (product.customFields ?? []).map((field, index) => {
            const options = field.options ?? [];
            if (options.length === 0) return null;
            return (
              <div key={`${field.label}-${index}`} className="space-y-1">
                {field.label ? (
                  <p className="text-xs font-medium text-primary">{field.label}</p>
                ) : null}
                <div className="flex flex-wrap gap-1.5">
                  {options.map((option) => (
                    <span key={option} className="chip-size">
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

        <div className={`mt-auto ${isList ? 'pt-1' : 'space-y-2'}`}>
          <div className="flex items-center justify-between gap-2">
            <span
              className={`font-semibold tabular-nums text-accent ${
                isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
              }`}
            >
              ${product.price.toFixed(2)}
            </span>
          </div>
          <div
            className={`grid gap-1.5 sm:gap-2 ${
              isList ? 'grid-cols-2 sm:max-w-xs' : 'grid-cols-2'
            }`}
          >
            <Tooltip content={tryOnTooltip}>
              <span className={tryOnDisabled ? 'opacity-40' : ''}>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => onTryOn(product)}
                  disabled={tryOnDisabled}
                  aria-label={t('product.tryOnAria')}
                >
                  <span className="inline-flex items-center justify-center gap-1 sm:gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} aria-hidden />
                    <span className={isCompact ? 'text-xs' : 'text-xs sm:text-sm'}>
                      {t('product.tryOn')}
                    </span>
                  </span>
                </Button>
              </span>
            </Tooltip>
            {isAuthenticated ? (
              <Tooltip content={adding ? t('product.adding') : t('product.addToCart')}>
                <Button
                  className="w-full"
                  size="sm"
                  variant="secondary"
                  onClick={handleAddToCart}
                  disabled={cartDisabled}
                  aria-label={t('product.addToCart')}
                >
                  <span className="inline-flex items-center justify-center gap-1 sm:gap-1.5">
                    <ShoppingCart
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <span className={isCompact ? 'text-xs' : 'text-xs sm:text-sm'}>
                      {adding ? '…' : t('product.cart')}
                    </span>
                  </span>
                </Button>
              </Tooltip>
            ) : (
              <Tooltip content={t('product.signInToAdd')}>
                <Link href={`/login?callbackUrl=${encodeURIComponent('/')}`}>
                  <Button
                    className="w-full"
                    size="sm"
                    variant="secondary"
                    disabled={isUnavailable}
                    aria-label={t('product.addToCart')}
                  >
                    <span className="inline-flex items-center justify-center gap-1 sm:gap-1.5">
                      <ShoppingCart
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      <span className={isCompact ? 'text-xs' : 'text-xs sm:text-sm'}>
                        {t('product.cart')}
                      </span>
                    </span>
                  </Button>
                </Link>
              </Tooltip>
            )}
          </div>
          {cartMessage && <p className="text-xs text-muted">{cartMessage}</p>}
        </div>
      </div>
    </GlassCard>
  );
}
