'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const { login, token, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (!authLoading && token) {
      router.push('/dashboard');
    }
  }, [token, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoadingSubmit(true);

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Successful login
      login(data.token, data.user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please check your credentials.';
      setError(msg);
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-slate-400 font-medium animate-pulse">Initializing POS system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Decorative premium gradients */}
      <div className="absolute -left-48 -top-48 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -right-48 -bottom-48 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="z-10 w-full max-w-md">
        {/* App Branding */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
            <span className="text-2xl font-bold text-slate-950">🍊</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Juice Bar POS
          </h1>
          <p className="mt-1 text-sm text-slate-400">Point of Sale & Inventory Engine</p>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-md bg-slate-900/60 border-slate-800/80 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-100">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">Sign in to your cashier or admin dashboard</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  ⚠️ {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@juicebar.com"
                  className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-emerald-500 focus-visible:ring-offset-slate-950"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loadingSubmit}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-emerald-500 focus-visible:ring-offset-slate-950"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loadingSubmit}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25 transition-all font-semibold"
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Credentials Helper Box */}
        <div className="mt-6 rounded-lg border border-slate-800/80 bg-slate-950/40 p-4 text-center text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">🔑 Demo Credentials</p>
          <p>Email: <code className="text-emerald-400 font-mono">admin@juicebar.com</code> | Password: <code className="text-emerald-400 font-mono">Admin@123</code></p>
        </div>
      </div>
    </div>
  );
}
