import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Accessibility, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';
import { Alert } from '../components/ui/Alert.js';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Invalid email or password.');
    }
  };

  return (
    <PageContainer title="Sign In">
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-600 text-white items-center justify-center shadow-md">
              <Accessibility className="w-7 h-7" aria-hidden="true" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Welcome back
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sign in to access your dashboard, saved history, and preferences.
            </p>
          </div>

          <Card elevated>
            {error && (
              <Alert type="error" className="mb-5">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                id="login-email"
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
              />

              <div className="space-y-1.5">
                <div className="relative">
                  <Input
                    id="login-password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    leftIcon={<Lock className="w-4 h-4" />}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password as plain text'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
                  Sign In
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700/80 text-center text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 underline focus:ring-2 focus:ring-brand-500 rounded"
              >
                Create one now
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
