import React, { useState } from 'react';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card.tsx';
import { Lock, Mail, Building, AlertCircle } from 'lucide-react';
import { authAPI } from '../../api';
import { toast } from 'sonner';

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
  onSwitchToRegister: () => void;
  loading?: boolean;
  error?: string | null;
}

export function LoginForm({ onLoginSuccess, onSwitchToRegister, loading = false, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setLoginError(null);
    
    try {
      // Validate inputs
      if (!email || !password) {
        toast.error('Please enter both email and password');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Make the actual API call
      const response = await authAPI.login({ email, password });
      
      // Success - call the callback with user data
      onLoginSuccess(response.user);
      toast.success(`Welcome back, ${response.user.first_name}!`);
      
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setLoginError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitting = loading || isLoading;
  const displayError = error || loginError;

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-indigo-600 rounded-full">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">HRMS CRM</h1>
          <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access the CRM system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {displayError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">{displayError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isSubmitting}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isSubmitting}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !email || !password}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToRegister}
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                  disabled={isSubmitting}
                >
                  Create one here
                </button>
              </p>
            </div>

            {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Getting Started</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Backend Required:</strong> Ensure your backend API is running on port 5000</p>
                <p><strong>Database:</strong> Initialize with demo data using the setup scripts</p>
                <p className="text-xs text-blue-600 mt-2">
                  This connects to your real backend API with JWT authentication
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600">
                <p>Subscription-based access control</p>
                <p className="text-xs text-gray-500 mt-1">
                  Access to modules depends on your plan: Starter, Pro, or Enterprise
                </p>
              </div>
            </div> */}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="font-medium text-green-600">Starter</div>
              <div className="text-gray-500">₹2,500/month</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="font-medium text-blue-600">Pro</div>
              <div className="text-gray-500">₹6,500/month</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="font-medium text-purple-600">Enterprise</div>
              <div className="text-gray-500">₹16,500/month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}