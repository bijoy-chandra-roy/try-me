'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/hooks/useAuth';
import { apiClient } from '@/shared/lib/api-client';

export function AccountSecurityForm() {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
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
      setMessage('Password updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-form space-y-6">
      <GlassCard className="p-6">
        <h2 className="font-serif text-xl font-semibold">Password</h2>
        <p className="mt-1 text-sm text-muted">
          Choose a strong password you do not use elsewhere. Minimum 8 characters.
        </p>
        <form onSubmit={changePassword} className="mt-6 space-y-4">
          <div>
            <label htmlFor="settings-password" className="mb-1 block text-sm">
              New password
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
              Confirm password
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
            {saving ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="font-serif text-xl font-semibold">Sign out</h2>
        <p className="mt-1 text-sm text-muted">
          End your session on this device. You can sign back in anytime.
        </p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign out
        </Button>
      </GlassCard>
    </div>
  );
}
