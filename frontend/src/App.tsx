import React, { useState } from 'react';
import { LoginForm } from '../components/LoginForm.tsx';
import { RegisterForm } from '../components/RegisterForm.tsx';
import { Dashboard } from '../components/Dashboard.tsx';
import { SubscriptionManager } from '../components/SubscriptionManager.tsx';
import { ClientManager } from '../components/ClientManager.tsx';
import { PlanManager } from '../components/PlanManager.tsx';
import { HRMSIntegration } from '../components/HRMSIntegration.tsx';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'user';
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState<'dashboard' | 'clients' | 'subscriptions' | 'plans' | 'hrms'>('dashboard');
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = async (user: User) => {
    setUser(user);
    toast.success(`Welcome back, ${user.first_name}!`);
  };

  const handleRegisterSuccess = async (user: User) => {
    setUser(user);
    toast.success(`Welcome, ${user.first_name}!`);
  };

  const switchToLogin = () => {
    setAuthView('login');
  };

  const switchToRegister = () => {
    setAuthView('register');
  };

  const handleLogout = () => {
    setUser(null);
    toast.success('Logged out successfully');
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
          />
        )}
        {authView === 'register' && (
          <RegisterForm 
            onRegisterSuccess={handleRegisterSuccess} 
            onSwitchToLogin={switchToLogin}
          />
        )}
        <Toaster />
      </div>
    );
  }

  // Authenticated - show simple dashboard
  return (
    <div className="min-h-screen bg-gray-50">
     <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-semibold text-gray-900">HRMS CRM</h1>
              </div>
              <div className="md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {['dashboard', 'clients', 'subscriptions', 'plans'].map((view) => (
                    <button
                      key={view}
                      onClick={() => setCurrentView(view as any)}
                      className={`px-3 py-2 rounded-md text-sm capitalize ${
                        currentView === view
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {/* {view === 'hrms' ? 'HRMS Integration' : view} */}
                      {view}
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
        {/* {currentView === 'hrms' && (
          <HRMSIntegration user={user} />
        )} */}
      </main>
      <Toaster />
    </div>
  );
}