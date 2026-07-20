'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/shared/components/GlassCard';
import { GlassButton } from '@/shared/components/GlassButton';
import { AuthOrDivider, GoogleSignInButton } from '@/shared/components/GoogleSignInButton';
import { apiClient } from '@/shared/lib/api-client';
import type { User } from '@/shared/types';

export default function RegisterPage() {
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
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-12">
      <GlassCard className="w-full p-8">
        <h1 className="font-serif text-3xl font-semibold text-olive-700 dark:text-sand-100">
          Create account
        </h1>
        <p className="mt-2 text-sm text-sand-600 dark:text-sand-300">
          Register as a customer to save try-on history
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Name
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
              minLength={8}
              className="input-glass input-glass-lg w-full"
            />
            <p className="mt-1 text-xs text-muted-subtle">At least 8 characters</p>
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          )}

          <GlassButton type="submit" disabled={loading || googleLoading} className="w-full">
            {loading ? 'Creating account...' : 'Register'}
          </GlassButton>
        </form>

        <div className="mt-5 space-y-5">
          <AuthOrDivider />
          <GoogleSignInButton
            onClick={handleGoogleSignIn}
            disabled={loading}
            loading={googleLoading}
            label="Continue with Google"
          />
        </div>

        <p className="mt-6 text-center text-sm text-sand-600 dark:text-sand-300">
          Already have an account?{' '}
          <Link href="/login" className="text-link">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
