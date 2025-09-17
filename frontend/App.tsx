import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { SubscriptionManager } from './components/SubscriptionManager';
import { ClientManager } from './components/ClientManager';
import { PlanManager } from './components/PlanManager';
import { HRMSIntegration } from './components/HRMSIntegration';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { 
  authAPI, 
  TokenManager 
} from './api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'user';
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'clients' | 'subscriptions' | 'plans' | 'hrms'>('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize app - check for existing authentication
  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (TokenManager.isAuthenticated()) {
          const userData = TokenManager.getUser();
          if (userData) {
            setUser(userData);
          } else {
            // Token exists but no user data, fetch from API
            const response = await authAPI.getCurrentUser();
            setUser(response.user);
          }
        }
      } catch (error: any) {
        console.error('App initialization error:', error);
        // If token is invalid, clear it
        TokenManager.removeToken();
        setError('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLoginSuccess = async (user: User) => {
    setUser(user);
    setError(null);
  };

  const handleRegisterSuccess = async (user: User) => {
    setUser(user);
    setError(null);
  };

  const switchToLogin = () => {
    setAuthView('login');
    setError(null);
  };

  const switchToRegister = () => {
    setAuthView('register');
    setError(null);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setCurrentView('dashboard');
      setError(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear local state
      TokenManager.removeToken();
      setUser(null);
      setCurrentView('dashboard');
      setError(null);
      toast.success('Logged out successfully');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HRMS CRM...</p>
        </div>
        <Toaster />
      </div>
    );
  }

  // Not authenticated - show login or register
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {authView === 'login' && (
          <LoginForm 
            onLoginSuccess={handleLoginSuccess} 
            onSwitchToRegister={switchToRegister}
            loading={loading} 
            error={error} 
          />
        )}
        {authView === 'register' && (
          <RegisterForm 
            onRegisterSuccess={handleRegisterSuccess} 
            onSwitchToLogin={switchToLogin}
            loading={loading} 
            error={error} 
          />
        )}
        <Toaster />
      </div>
    );
  }

  // Authenticated - show main app
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-semibold text-gray-900">HRMS CRM</h1>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {['dashboard', 'clients', 'subscriptions', 'plans', 'hrms'].map((view) => (
                    <button
                      key={view}
                      onClick={() => setCurrentView(view as any)}
                      className={`px-3 py-2 rounded-md text-sm capitalize ${
                        currentView === view
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {view === 'hrms' ? 'HRMS Integration' : view}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.first_name} {user.last_name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentView === 'dashboard' && (
          <Dashboard user={user} />
        )}
        {currentView === 'clients' && (
          <ClientManager />
        )}
        {currentView === 'subscriptions' && (
          <SubscriptionManager />
        )}
        {currentView === 'plans' && (
          <PlanManager />
        )}
        {currentView === 'hrms' && (
          <HRMSIntegration user={user} />
        )}
      </main>
      <Toaster />
    </div>
  );
}