'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from '@/shared/components/Link';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { AuthOrDivider, GoogleSignInButton } from '@/shared/components/GoogleSignInButton';
import { apiClient } from '@/shared/lib/api-client';
import { onLoginSuccessMarkPrefsPending } from '@/shared/hooks/usePreferences';
import { useT } from '@/shared/hooks/useT';
import type { User } from '@/shared/types';

export default function RegisterPage() {
  const t = useT();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setError('');
    setGoogleLoading(true);

    try {
      onLoginSuccessMarkPrefsPending();
      await signIn('google', { callbackUrl: '/dashboard' });
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient<User>('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      router.push('/login?registered=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.register.failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-narrow items-center px-6 py-12">
      <GlassCard className="w-full p-8">
        <h1 className="font-serif text-3xl font-semibold text-primary">
          {t('auth.register.title')}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {t('auth.register.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              {t('auth.name')}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-glass input-glass-lg w-full"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-glass input-glass-lg w-full"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="input-glass input-glass-lg w-full"
            />
            <p className="mt-1 text-xs text-muted-subtle">{t('auth.passwordHint')}</p>
          </div>

          {error && (
            <p className="text-sm font-medium text-error">{error}</p>
          )}

          <Button type="submit" disabled={loading || googleLoading} className="w-full">
            {loading ? t('auth.register.submitting') : t('auth.register.submit')}
          </Button>
        </form>

        <div className="mt-5 space-y-5">
          <AuthOrDivider />
          <GoogleSignInButton
            onClick={handleGoogleSignIn}
            disabled={loading}
            loading={googleLoading}
          />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          {t('auth.register.hasAccount')}{' '}
          <Link href="/login" className="text-link">
            {t('auth.register.signInLink')}
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
