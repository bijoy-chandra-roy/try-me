'use client';

import { useState } from 'react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePreferences } from '@/shared/hooks/usePreferences';
import { useT } from '@/shared/hooks/useT';
import { apiClient } from '@/shared/lib/api-client';
import {
  confirmSignOut,
  signOutAndClearPreferences,
} from '@/shared/lib/auth-actions';
import { resetOnboardingTour } from '@/shared/lib/preferences';

export function AccountSecurityForm() {
  const { user } = useAuth();
  const { resetPreferences, saving: prefsSaving } = usePreferences();
  const t = useT();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    if (password.length < 8) {
      setError(t('settings.security.minLength'));
      return;
    }
    if (password !== confirm) {
      setError(t('settings.security.mismatch'));
      return;
    }
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await apiClient(`/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      setPassword('');
      setConfirm('');
      setMessage(t('settings.security.updated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.security.updateFailed'));
    } finally {
      setSaving(false);
    }
  }

  function handleSignOut() {
    if (!confirmSignOut(t('settings.account.signOutConfirm'))) return;
    void signOutAndClearPreferences('/');
  }

  function handleResetTour() {
    resetOnboardingTour();
    setMessage(t('settings.account.resetTourDone'));
  }

  async function handleResetAll() {
    if (!window.confirm(t('settings.account.resetAllConfirm'))) return;
    setMessage('');
    setError('');
    try {
      await resetPreferences();
      setMessage(t('settings.account.resetAllDone'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.account.resetFailed'));
    }
  }

  return (
    <div className="max-w-form space-y-6">
      <GlassCard className="p-6">
        <h2 className="font-serif text-xl font-semibold">
          {t('settings.security.passwordTitle')}
        </h2>
        <p className="mt-1 text-sm text-muted">{t('settings.security.passwordSubtitle')}</p>
        <form onSubmit={changePassword} className="mt-6 space-y-4">
          <div>
            <label htmlFor="settings-password" className="mb-1 block text-sm">
              {t('settings.security.newPassword')}
            </label>
            <input
              id="settings-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className="input-glass w-full rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="settings-password-confirm" className="mb-1 block text-sm">
              {t('settings.security.confirmPassword')}
            </label>
            <input
              id="settings-password-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className="input-glass w-full rounded-xl px-3 py-2"
            />
          </div>
          {message && <p className="text-sm text-success">{message}</p>}
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? t('settings.security.updating') : t('settings.security.updatePassword')}
          </Button>
        </form>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="font-serif text-xl font-semibold">
          {t('settings.account.demoTitle')}
        </h2>
        <p className="mt-1 text-sm text-muted">{t('settings.account.demoSubtitle')}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleResetTour}>
            {t('settings.account.resetTour')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => void handleResetAll()}
            disabled={prefsSaving}
          >
            {t('settings.account.resetAll')}
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="font-serif text-xl font-semibold">{t('settings.account.signOut')}</h2>
        <p className="mt-1 text-sm text-muted">{t('settings.account.signOutSubtitle')}</p>
        <Button variant="secondary" className="mt-4" onClick={handleSignOut}>
          {t('settings.account.signOut')}
        </Button>
      </GlassCard>
    </div>
  );
}
