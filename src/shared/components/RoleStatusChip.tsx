'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useFloatingPosition } from '@/shared/hooks/useFloatingPosition';
import { useAuth } from '@/shared/hooks/useAuth';
import { useT } from '@/shared/hooks/useT';
import { USER_ROLES, type UserRole } from '@/shared/auth/roles';
import {
  assumeRole,
  dashboardPathAfterAssume,
} from '@/shared/lib/assume-role';
import { apiClient } from '@/shared/lib/api-client';
import { merchantsForAssumeRole } from '@/shared/lib/merchants-for-assume';
import type { Merchant } from '@/shared/types';
import type { MessageKey } from '@/shared/i18n';
import { ScrollArea } from '@/shared/components/ScrollArea';

function roleLabelKey(role: UserRole): MessageKey {
  return `roles.${role}` as MessageKey;
}

function isEffectiveRole(current: UserRole | undefined, candidate: UserRole, assuming: boolean) {
  if (!current) return false;
  if (candidate === 'super_admin') return !assuming && current === 'super_admin';
  return current === candidate;
}

/**
 * Navbar role chip. Super admins can open it to assume any role
 * (or restore Super Admin). Everyone else sees a static label.
 */
export function RoleStatusChip({
  className = '',
  permissionsHint,
}: {
  className?: string;
  permissionsHint?: string;
}) {
  const { role, realRole, update, isAssumingRole } = useAuth();
  const t = useT();
  const router = useRouter();
  const canSwitch = realRole === 'super_admin';

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'roles' | 'merchants'>('roles');
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const coords = useFloatingPosition({
    open,
    triggerRef,
    floatingRef: menuRef,
    preferredSide: 'bottom',
    align: 'end',
    gap: 4,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setStep('roles');
      setError('');
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setStep('roles');
        setError('');
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  async function ensureMerchants() {
    if (merchants.length > 0) return;
    setLoadingMerchants(true);
    setError('');
    try {
      const list = await apiClient<Merchant[]>('/merchants');
      setMerchants(merchantsForAssumeRole(list));
    } catch {
      setError(t('assumeRole.failed'));
    } finally {
      setLoadingMerchants(false);
    }
  }

  async function switchTo(next: UserRole, merchantId?: string | null) {
    if (busy) return;
    if (next === role && next !== 'merchant') {
      setOpen(false);
      return;
    }

    setBusy(true);
    setError('');
    try {
      const applied = await assumeRole(update, next, merchantId);
      setOpen(false);
      setStep('roles');
      router.push(dashboardPathAfterAssume(applied));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('assumeRole.failed'));
    } finally {
      setBusy(false);
    }
  }

  async function onSelectRole(next: UserRole) {
    if (next === 'merchant') {
      setStep('merchants');
      await ensureMerchants();
      return;
    }
    await switchTo(next);
  }

  if (!role) return null;

  const label = t(roleLabelKey(role));
  const title =
    permissionsHint ||
    (isAssumingRole
      ? t('assumeRole.actingAs', { role: label })
      : label);

  if (!canSwitch) {
    return (
      <span
        className={`chip-category cursor-default ${className}`}
        title={title}
      >
        {label}
      </span>
    );
  }

  return (
    <div className={`relative shrink-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={t('assumeRole.roleLabel')}
        aria-expanded={open}
        aria-haspopup="menu"
        title={title}
        disabled={busy}
        onClick={() => {
          setOpen((prev) => !prev);
          setStep('roles');
          setError('');
        }}
        className="chip-category inline-flex cursor-pointer items-center gap-1 transition-colors hover:bg-[var(--color-overlay-pressed)]"
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5 opacity-70" strokeWidth={2} aria-hidden />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className={`surface-popover fixed z-dropdown min-w-[200px] overflow-hidden py-1 transition-opacity duration-fast ${
              coords ? 'opacity-100' : 'opacity-0'
            }`}
            style={
              coords
                ? { top: coords.top, left: coords.left }
                : { top: 0, left: 0 }
            }
          >
            {step === 'roles' ? (
              <>
                <p className="px-3 py-1.5 text-xs text-muted-subtle">
                  {t('assumeRole.title')}
                </p>
                {USER_ROLES.map((r) => {
                  const current = isEffectiveRole(role, r, isAssumingRole);
                  return (
                    <button
                      key={r}
                      type="button"
                      role="menuitem"
                      disabled={busy}
                      onClick={() => void onSelectRole(r)}
                      className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                        current
                          ? 'bg-[var(--color-overlay-pressed)] font-medium text-primary'
                          : 'text-primary hover:bg-[var(--color-overlay-hover)]'
                      }`}
                    >
                      {t(roleLabelKey(r))}
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="block w-full px-3 py-1.5 text-left text-xs text-muted-subtle hover:text-primary"
                  onClick={() => {
                    setStep('roles');
                    setError('');
                  }}
                >
                  ← {t('assumeRole.roleLabel')}
                </button>
                <p className="px-3 py-1.5 text-xs text-muted-subtle">
                  {t('assumeRole.merchantLabel')}
                </p>
                {loadingMerchants ? (
                  <p className="px-3 py-2 text-sm text-muted-subtle">
                    {t('common.loading')}
                  </p>
                ) : merchants.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-subtle">
                    {t('assumeRole.merchantRequired')}
                  </p>
                ) : (
                  <ScrollArea edgeInset={0} viewportClassName="max-h-56">
                    {merchants.map((m) => (
                      <button
                        key={m._id}
                        type="button"
                        role="menuitem"
                        disabled={busy}
                        onClick={() => void switchTo('merchant', m._id)}
                        className="block w-full px-3 py-2 text-left text-sm text-primary hover:bg-[var(--color-overlay-hover)]"
                      >
                        {m.name}
                      </button>
                    ))}
                  </ScrollArea>
                )}
              </>
            )}
            {error && (
              <p className="border-t border-subtle px-3 py-2 text-xs text-error">{error}</p>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
