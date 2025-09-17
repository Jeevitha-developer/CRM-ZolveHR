import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Lock, Mail, Building, AlertCircle, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import { User as UserType } from '../App';

interface RegisterFormProps {
  onRegisterSuccess: (user: UserType) => void;
  onSwitchToLogin: () => void;
  loading?: boolean;
  error?: string | null;
}

export function RegisterForm({ onRegisterSuccess, onSwitchToLogin, loading = false, error }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'admin' | 'manager' | 'user'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setRegisterError(null);
    
    try {
      // Validate form data
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful registration
      const mockUser: UserType = {
        id: `user_${Date.now()}`,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role
      };

      // Success - call success handler
      onRegisterSuccess(mockUser);
      toast.success(`Account created successfully! Welcome, ${formData.first_name}!`);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setRegisterError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isSubmitting = loading || isLoading;
  const displayError = error || registerError;

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-indigo-600 rounded-full">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">HRMS CRM</h1>
          <p className="text-gray-600 mt-2">Create your account to get started</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Enter your information to create your HRMS CRM account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {displayError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">{displayError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <div className="relative">
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="pl-10"
                      required
                      disabled={isSubmitting}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <div className="relative">
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="pl-10"
                      required
                      disabled={isSubmitting}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    required
                    disabled={isSubmitting}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'admin' | 'manager' | 'user') => handleInputChange('role', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="pl-10">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10"
                    required
                    disabled={isSubmitting}
                    minLength={6}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10"
                    required
                    disabled={isSubmitting}
                    minLength={6}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.confirmPassword}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                  disabled={isSubmitting}
                >
                  Sign in here
                </button>
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Account Features</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>User:</strong> Basic access to assigned modules</p>
                <p><strong>Manager:</strong> Team management and reporting</p>
                <p><strong>Admin:</strong> Full system access and configuration</p>
                <p className="text-xs text-blue-600 mt-2">
                  Access levels depend on your subscription plan
                </p>
              </div>
            </div>
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