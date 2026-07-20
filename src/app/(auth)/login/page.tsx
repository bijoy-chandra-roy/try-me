'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/shared/components/GlassCard';
import { GlassButton } from '@/shared/components/GlassButton';
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
      <h1 className="font-serif text-3xl font-semibold text-olive-700 dark:text-sand-100">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-sand-600 dark:text-sand-300">
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
            className="w-full rounded-xl border border-sand-300/60 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-olive-500 dark:border-olive-500/40 dark:bg-olive-800/30"
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
            className="w-full rounded-xl border border-sand-300/60 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-olive-500 dark:border-olive-500/40 dark:bg-olive-800/30"
          />
        </div>

        {error && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
        )}

        <GlassButton type="submit" disabled={loading || googleLoading} className="w-full">
          {loading ? 'Signing in...' : 'Sign in'}
        </GlassButton>
      </form>

      <div className="mt-5 space-y-5">
        <AuthOrDivider />
        <GoogleSignInButton
          onClick={handleGoogleSignIn}
          disabled={loading}
          loading={googleLoading}
        />
      </div>

      <p className="mt-6 text-center text-sm text-sand-600 dark:text-sand-300">
        No account?{' '}
        <Link href="/register" className="font-medium text-olive-600 hover:underline dark:text-sand-100">
          Register
        </Link>
      </p>
    </GlassCard>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-12">
      <Suspense fallback={<p className="text-sm text-sand-500">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
