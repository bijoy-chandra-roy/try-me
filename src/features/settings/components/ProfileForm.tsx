'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/hooks/useAuth';
import { apiClient } from '@/shared/lib/api-client';
import { ROLE_LABELS } from '@/shared/auth/roles';

export function ProfileForm() {
  const { user, role, update } = useAuth();
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
      setMessage('Profile updated');
      await update();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassCard className="max-w-form p-6">
      <h2 className="font-serif text-xl font-semibold">Profile</h2>
      <p className="mt-1 text-sm text-muted">
        How you appear across TryMe. Email and role are managed by your account.
      </p>
      <form onSubmit={saveProfile} className="mt-6 space-y-4">
        <div>
          <label htmlFor="settings-name" className="mb-1 block text-sm">
            Display name
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
            Email
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
            <label className="mb-1 block text-sm">Role</label>
            <p className="text-sm text-muted">
              <span className="chip-category">{ROLE_LABELS[role]}</span>
            </p>
          </div>
        )}
        {message && <p className="text-sm text-success">{message}</p>}
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </Button>
      </form>
    </GlassCard>
  );
}
