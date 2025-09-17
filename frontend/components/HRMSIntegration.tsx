import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { toast } from 'sonner';
import { 
  hrmsAPI,
  clientAPI, 
  planAPI, 
  subscriptionAPI,
  type Client,
  type Plan,
  type Subscription 
} from '../../api';
import { User } from '../App';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Settings, 
  Database, 
  Users, 
  Shield,
  Zap,
  Monitor,
  Globe
} from 'lucide-react';
import { Label } from './ui/label.tsx';
import { Input } from './ui/input.tsx';

interface HRMSIntegrationProps {
  user: User;
}

export function HRMSIntegration({ user }: HRMSIntegrationProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'disconnected' | 'syncing'>('connected');
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [clientsResponse, plansResponse, subscriptionsResponse] = await Promise.all([
        clientAPI.getClients({ limit: 100 }),
        planAPI.getActivePlans(),
        subscriptionAPI.getSubscriptions({ limit: 100 })
      ]);

      setClients(clientsResponse.clients || []);
      setPlans(plansResponse.plans || []);
      setSubscriptions(subscriptionsResponse.subscriptions || []);
    } catch (error: any) {
      console.error('Error loading HRMS data:', error);
      toast.error('Failed to load HRMS data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    try {
      setSyncStatus('syncing');
      await hrmsAPI.syncData();
      setLastSync(new Date());
      setSyncStatus('connected');
      toast.success('HRMS data synchronized successfully');
      loadData(); // Refresh data after sync
    } catch (error: any) {
      console.error('HRMS sync error:', error);
      setSyncStatus('disconnected');
      toast.error('Failed to sync with HRMS');
    }
  };

  const testConnection = async () => {
    try {
      await hrmsAPI.testConnection();
      setSyncStatus('connected');
      toast.success('HRMS connection is working');
    } catch (error: any) {
      setSyncStatus('disconnected');
      toast.error('HRMS connection failed');
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'connected':
        return 'Sync Successful';
      case 'disconnected':
        return 'Sync Failed';
      default:
        return 'Ready to Sync';
    }
  };

  const mockApiResponse = {
    users: [
      { id: '1', name: 'John Doe', role: 'Manager', department: 'Engineering' },
      { id: '2', name: 'Jane Smith', role: 'Developer', department: 'Engineering' },
      { id: '3', name: 'Mike Johnson', role: 'Analyst', department: 'HR' }
    ],
    modules: plans.map(plan => plan.modules).flat() || [],
    permissions: {
      canCreateUsers: plans.some(plan => plan.modules.includes('User Management')),
      canViewReports: plans.some(plan => plan.modules.includes('Basic Reports') || plan.modules.includes('Advanced Reports')),
      canManagePayroll: plans.some(plan => plan.modules.includes('Payroll')),
      canManageLeave: plans.some(plan => plan.modules.includes('Leave Management')),
      canViewPerformance: plans.some(plan => plan.modules.includes('Performance Management'))
    },
    lastUpdated: lastSync.toISOString()
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">HRMS Integration</h1>
        <p className="text-gray-600">Manage API connections and sync your HRMS data</p>
      </div>

      {/* Connection Status */}
      <div className="grid    md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${syncStatus === 'connected' ? 'bg-green-100' : 'bg-red-100'}`}>
                {syncStatus === 'connected' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Connection Status</p>
                <p className={`text-lg font-semibold ${syncStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                  {syncStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100">
                {getSyncStatusIcon()}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sync Status</p>
                <p className="text-lg font-semibold text-blue-600">
                  {getSyncStatusText()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-100">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Modules</p>
                <p className="text-lg font-semibold text-purple-600">
                  {plans.map(plan => plan.modules).flat().length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Plan & Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Monitor className="w-5 h-5 mr-2" />
            Current Subscription & Module Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plans && subscriptions ? (
            <div className="grid    md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Plan Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <Badge variant="outline">{plans[0]?.name}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">₹{plans[0]?.price.toLocaleString('en-IN')}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={subscriptions[0]?.isPaid ? 'default' : 'destructive'}>
                      {subscriptions[0]?.isPaid ? 'Active' : 'Payment Due'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Access:</span>
                    <Badge variant={plans[0]?.apiAccess ? 'default' : 'secondary'}>
                      {plans[0]?.apiAccess ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Available Modules</h4>
                <div className="grid grid-cols-2 gap-2">
                  {plans.map(plan => plan.modules).flat().map((module) => (
                    <div key={module} className="flex items-center p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-green-800">{module}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-600">You need an active subscription to access HRMS modules.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid    md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="endpoint">API Endpoint</Label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-md">
                    <Globe className="w-4 h-4 text-gray-500" />
                  </div>
                  <Input
                    id="endpoint"
                    value={apiData.endpoint}
                    onChange={(e) => setApiData(prev => ({ ...prev, endpoint: e.target.value }))}
                    className="rounded-l-none"
                    disabled={!plan?.apiAccess}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-md">
                    <Key className="w-4 h-4 text-gray-500" />
                  </div>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiData.apiKey}
                    onChange={(e) => setApiData(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="rounded-l-none"
                    disabled={!plan?.apiAccess}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    value={apiData.timeout}
                    onChange={(e) => setApiData(prev => ({ ...prev, timeout: e.target.value }))}
                    disabled={!plan?.apiAccess}
                  />
                </div>
                <div>
                  <Label htmlFor="retries">Retry Attempts</Label>
                  <Input
                    id="retries"
                    value={apiData.retryAttempts}
                    onChange={(e) => setApiData(prev => ({ ...prev, retryAttempts: e.target.value }))}
                    disabled={!plan?.apiAccess}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Sync Actions</h4>
              <div className="space-y-3">
                <Button 
                  onClick={handleSync} 
                  disabled={syncStatus === 'syncing' || !plan?.apiAccess}
                  className="w-full"
                >
                  {syncStatus === 'syncing' ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Sync with HRMS
                </Button>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>Last sync: {lastSync.toLocaleString()}</p>
                  <p>Modules synced: {plans.map(plan => plan.modules).flat().length || 0}</p>
                  {!plan?.apiAccess && (
                    <p className="text-yellow-600">
                      ⚠️ API access requires Pro or Enterprise plan
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mock API Response */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="w-5 h-5 mr-2" />
            Mock API Response
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
              <code>{JSON.stringify(mockApiResponse, null, 2)}</code>
            </pre>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>This shows the mock data that would be returned from your HRMS API integration.</p>
            <p>Module access is controlled by your current subscription plan.</p>
          </div>
        </CardContent>
      </Card>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <h4 className="font-medium text-gray-900 mb-3">How to integrate with your HRMS:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Ensure you have an active subscription with API access (Pro or Enterprise plan)</li>
              <li>Configure your API endpoint and authentication key above</li>
              <li>Use the sync function to push user permissions based on your plan modules</li>
              <li>Monitor the connection status and sync logs for any issues</li>
              <li>Access levels are automatically controlled by your subscription plan</li>
            </ol>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Development Notes:</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>All API calls include module-based permission verification</li>
                <li>Failed syncs will retry automatically based on configuration</li>
                <li>Real-time status updates ensure users see current access levels</li>
                <li>Subscription changes immediately affect API permissions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}