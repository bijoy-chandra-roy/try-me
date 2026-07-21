'use client';

import { Suspense, useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from '@/shared/components/Link';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { AuthOrDivider, GoogleSignInButton } from '@/shared/components/GoogleSignInButton';
import { onLoginSuccessMarkPrefsPending } from '@/shared/hooks/usePreferences';
import { useT } from '@/shared/hooks/useT';

function LoginForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
      router.refresh();
    }
  }, [status, callbackUrl, router]);

  async function handleGoogleSignIn() {
    setError('');
    setGoogleLoading(true);

    try {
      onLoginSuccessMarkPrefsPending();
      await signIn('google', { callbackUrl });
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t('auth.login.invalid'));
      return;
    }

    onLoginSuccessMarkPrefsPending();
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <GlassCard className="w-full p-8">
      <h1 className="font-serif text-3xl font-semibold text-primary">
        {t('auth.login.title')}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {t('auth.login.subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
            className="input-glass input-glass-lg w-full"
          />
        </div>

        {error && (
          <p className="text-sm font-medium text-error">{error}</p>
        )}

        <Button type="submit" disabled={loading || googleLoading} className="w-full">
          {loading ? t('auth.login.submitting') : t('auth.login.submit')}
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
        {t('auth.login.noAccount')}{' '}
        <Link href="/register" className="text-link">
          {t('auth.login.registerLink')}
        </Link>
      </p>
    </GlassCard>
  );
}

export default function LoginPage() {
  const t = useT();
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-narrow items-center px-6 py-12">
      <Suspense fallback={<p className="text-sm text-muted-subtle">{t('common.loading')}</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
