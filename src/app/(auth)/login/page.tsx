'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from '@/shared/components/Link';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { AuthOrDivider, GoogleSignInButton } from '@/shared/components/GoogleSignInButton';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setError('');
    setGoogleLoading(true);

    try {
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
      setError('Invalid email or password');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <GlassCard className="w-full p-8">
      <h1 className="font-serif text-3xl font-semibold text-primary">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-muted">
        Sign in to access your dashboard
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
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
            Password
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
          {loading ? 'Signing in...' : 'Sign in'}
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
        No account?{' '}
        <Link href="/register" className="text-link">
          Register
        </Link>
      </p>
    </GlassCard>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-narrow items-center px-6 py-12">
      <Suspense fallback={<p className="text-sm text-muted-subtle">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
