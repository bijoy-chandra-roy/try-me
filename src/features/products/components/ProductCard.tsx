'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from '@/shared/components/Link';
import { Button } from '@/shared/components/Button';
import { GlassCard } from '@/shared/components/GlassCard';
import { Popover } from '@/shared/components/Popover';
import { Tooltip } from '@/shared/components/Tooltip';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { useAuth, usePermission } from '@/shared/hooks/useAuth';
import { useSystemStatus } from '@/shared/hooks/useSystemStatus';
import { addToCart } from '@/features/cart/api/cart.api';
import { setCartStore } from '@/features/cart/hooks/useCart';
import { ApiError } from '@/shared/lib/api-client';
import type { Product } from '@/shared/types';

interface ProductCardProps {
  product: Product;
  onTryOn: (product: Product) => void;
  /** Prefer eager load for above-the-fold cards (first ~6). */
  priority?: boolean;
}

export function ProductCard({ product, onTryOn, priority = false }: ProductCardProps) {
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
    ? 'Try-on unavailable during maintenance'
    : isUnavailable
      ? 'This item is currently unavailable'
      : 'Preview on your photo';

  const needsSize = (product.sizes?.length ?? 0) > 0;
  const cartDisabled = isUnavailable || adding || (needsSize && !selectedSize);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent('/')}`;
      return;
    }
    if (!canManageCart) {
      setCartMessage('You cannot add items to cart');
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
      setCartMessage('Added to cart');
    } catch (err) {
      setCartMessage(err instanceof ApiError ? err.message : 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  }

  return (
    <GlassCard
      hover
      className={`group flex flex-col ${isUnavailable ? 'row-dimmed' : ''}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {isUnavailable && (
          <span className="chip absolute left-3 top-3 bg-[var(--color-accent-fill)] text-[var(--color-on-accent)]">
            Out of stock
          </span>
        )}
        {!isUnavailable && product.stockQuantity <= 5 && (
          <span className="chip absolute left-3 top-3 status-chip-pending">
            Only {product.stockQuantity} left
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="chip-category mb-1">{product.category}</span>
            <h3 className="truncate font-serif text-lg font-semibold text-primary">
              {product.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted">
              {product.description}
            </p>
            {(product.reviewCount ?? 0) > 0 && (
              <p className="mt-1 text-xs text-muted">
                ★ {product.averageRating?.toFixed(1)} · {product.reviewCount} review
                {(product.reviewCount ?? 0) === 1 ? '' : 's'}
              </p>
            )}
          </div>
          <Popover
            label="More options"
            items={[
              {
                label: 'Copy product name',
                onClick: () => navigator.clipboard.writeText(product.name),
              },
              {
                label: 'Copy price',
                onClick: () => navigator.clipboard.writeText(`$${product.price.toFixed(2)}`),
              },
            ]}
          />
        </div>

        {(product.sizes ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(product.sizes ?? []).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`chip-size transition ${
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

        {(product.customFields ?? []).map((field, index) => {
          const options = field.options ?? [];
          if (options.length === 0) return null;
          return (
            <div key={`${field.label}-${index}`} className="space-y-1">
              {field.label ? (
                <p className="text-xs font-medium text-primary">
                  {field.label}
                </p>
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

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-lg font-semibold tabular-nums text-accent">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Tooltip content={tryOnTooltip}>
              <span className={tryOnDisabled ? 'opacity-40' : ''}>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => onTryOn(product)}
                  disabled={tryOnDisabled}
                  aria-label="Try on"
                >
                    <span className="inline-flex items-center justify-center gap-1.5">
                    <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    <span className="hidden sm:inline">Try On</span>
                  </span>
                </Button>
              </span>
            </Tooltip>
            {isAuthenticated ? (
              <Tooltip content={adding ? 'Adding…' : 'Add to cart'}>
                <Button
                  className="w-full"
                  size="sm"
                  variant="secondary"
                  onClick={handleAddToCart}
                  disabled={cartDisabled}
                  aria-label="Add to cart"
                >
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <ShoppingCart className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    <span className="hidden sm:inline">{adding ? 'Adding…' : 'Cart'}</span>
                  </span>
                </Button>
              </Tooltip>
            ) : (
              <Tooltip content="Sign in to add to cart">
                <Link href={`/login?callbackUrl=${encodeURIComponent('/')}`}>
                  <Button
                    className="w-full"
                    size="sm"
                    variant="secondary"
                    disabled={isUnavailable}
                    aria-label="Add to cart"
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <ShoppingCart className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      <span className="hidden sm:inline">Cart</span>
                    </span>
                  </Button>
                </Link>
              </Tooltip>
            )}
          </div>
          {cartMessage && (
            <p className="text-xs text-muted">{cartMessage}</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
