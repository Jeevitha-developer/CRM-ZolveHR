import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { User, Client, Subscription, Plan } from '../App';
import { Users, CreditCard, Package, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface DashboardProps {
  user: User;
  plan: Plan | null;
  subscription: Subscription | null;
  clients: Client[];
  subscriptions: Subscription[];
  plans: Plan[];
}

export function Dashboard({ user, plan, subscription, clients, subscriptions, plans }: DashboardProps) {
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const paidSubscriptions = subscriptions.filter(s => s.isPaid).length;
  const overduePayments = subscriptions.filter(s => s.paymentStatus === 'overdue').length;

  const getStatusColor = (status: string, isPaid: boolean) => {
    if (!isPaid) return 'destructive';
    return status === 'active' ? 'success' : 'secondary';
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'overdue': return 'destructive';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}</p>
      </div>

      {/* Current User Plan */}
      {plan && subscription && (
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Current Plan</span>
              <Badge variant={getStatusColor(subscription.status, subscription.isPaid)}>
                {subscription.status} • {subscription.isPaid ? 'Paid' : 'Unpaid'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid    md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-lg text-indigo-600">{plan.name}</h3>
                <p className="text-gray-600">₹{plan.price.toLocaleString('en-IN')}/month</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Available Modules</h4>
                <div className="flex flex-wrap gap-1">
                  {plan.modules.map((module) => (
                    <Badge key={module} variant="outline" className="text-xs">
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Plan Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {plan.features.slice(0, 2).map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid    md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              Active client accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Currently active plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Fully paid accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overduePayments}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid    lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients.slice(0, 5).map((client) => {
                const clientSub = subscriptions.find(s => s.clientId === client.id);
                const clientPlan = plans.find(p => p.id === clientSub?.planId);
                
                return (
                  <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{clientPlan?.name || 'No Plan'}</Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.slice(0, 5).map((sub) => {
                const client = clients.find(c => c.id === sub.clientId);
                const plan = plans.find(p => p.id === sub.planId);
                
                return (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{client?.name}</p>
                      <p className="text-sm text-gray-600">{plan?.name} Plan</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={getPaymentStatusColor(sub.paymentStatus)}>
                        {sub.paymentStatus}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Expires: {new Date(sub.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HRMS Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            HRMS Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="font-medium text-green-900">Connected to HRMS</p>
                <p className="text-sm text-green-700">
                  Last sync: {new Date().toLocaleString()} • 
                  Available modules: {plan?.modules?.join(', ') || 'None'}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-medium text-gray-900 mb-2">API Sync Configuration</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Endpoint: /api/hrms/sync</p>
                <p>• Authentication: Bearer token</p>
                <p>• Module access controlled by subscription plan</p>
                <p>• Real-time permission updates</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}