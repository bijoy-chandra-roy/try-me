'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/hooks/useAuth';
import { useT } from '@/shared/hooks/useT';
import { apiClient } from '@/shared/lib/api-client';
import type { UserRole } from '@/shared/auth/roles';
import type { MessageKey } from '@/shared/i18n';

function roleLabel(
  t: (key: MessageKey, params?: Record<string, string | number>) => string,
  role: UserRole
) {
  return t(`roles.${role}` as MessageKey);
}

export function ProfileForm() {
  const { user, role, update } = useAuth();
  const t = useT();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await apiClient(`/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      setMessage(t('settings.profile.updated'));
      await update();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.profile.updateFailed'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassCard className="max-w-form p-6">
      <h2 className="font-serif text-xl font-semibold">{t('settings.profile.title')}</h2>
      <p className="mt-1 text-sm text-muted">{t('settings.profile.subtitle')}</p>
      <form onSubmit={saveProfile} className="mt-6 space-y-4">
        <div>
          <label htmlFor="settings-name" className="mb-1 block text-sm">
            {t('settings.profile.displayName')}
          </label>
          <input
            id="settings-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-glass w-full rounded-xl px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="settings-email" className="mb-1 block text-sm">
            {t('settings.profile.email')}
          </label>
          <input
            id="settings-email"
            value={user?.email ?? ''}
            readOnly
            className="input-glass w-full rounded-xl px-3 py-2 opacity-70"
          />
        </div>
        {role && (
          <div>
            <label className="mb-1 block text-sm">{t('settings.profile.role')}</label>
            <p className="text-sm text-muted">
              <span className="chip-category">{roleLabel(t, role)}</span>
            </p>
          </div>
        )}
        {message && <p className="text-sm text-success">{message}</p>}
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? t('common.saving') : t('settings.profile.save')}
        </Button>
      </form>
    </GlassCard>
  );
}
