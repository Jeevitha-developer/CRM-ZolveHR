import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Badge } from "./ui/badge.tsx";
import { Button } from "./ui/button.tsx";
import { toast } from "sonner";
import {
  clientAPI,
  planAPI,
  subscriptionAPI,
  type Client,
  type Plan,
  type Subscription,
} from "../../api";
import { User } from "../App";
import {
  Users,
  CreditCard,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  const loadData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [clientsResponse, plansResponse, subscriptionsResponse] =
        await Promise.all([
          clientAPI.getClients({ limit: 100 }),
          planAPI.getActivePlans(),
          subscriptionAPI.getSubscriptions({ limit: 100 }),
        ]);

      setClients(clientsResponse.clients || []);
      setPlans(plansResponse.plans || []);
      setSubscriptions(subscriptionsResponse.subscriptions || []);
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper functions to get user-specific data
  const getUserPlan = (): Plan | null => {
    if (!user) return null;

    // For admin/manager, return the first available plan
    // For user, find their client's active subscription plan
    if (user.role === "admin" || user.role === "manager") {
      return plans.length > 0 ? plans[0] : null;
    }

    // Find client created by this user
    const userClient = clients.find((c) => c.created_by === user.id);
    if (!userClient) return null;

    // Find active subscription for this client
    const activeSubscription = subscriptions.find(
      (s) => s.client_id === userClient.id && s.status === "active"
    );
    if (!activeSubscription) return null;

    // Find the plan for this subscription
    return plans.find((p) => p.id === activeSubscription.plan_id) || null;
  };

  const getUserSubscription = (): Subscription | null => {
    if (!user) return null;

    // For admin/manager, return null or first subscription for demo
    if (user.role === "admin" || user.role === "manager") {
      return subscriptions.length > 0 ? subscriptions[0] : null;
    }

    // Find client created by this user
    const userClient = clients.find((c) => c.created_by === user.id);
    if (!userClient) return null;

    // Find active subscription for this client
    return (
      subscriptions.find(
        (s) => s.client_id === userClient.id && s.status === "active"
      ) || null
    );
  };

  const plan = getUserPlan();
  const subscription = getUserSubscription();
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active"
  ).length;
  const paidSubscriptions = subscriptions.filter(
    (s) => s.payment_status === "paid"
  ).length;
  const overduePayments = subscriptions.filter(
    (s) => s.payment_status === "overdue"
  ).length;

  const getStatusColor = (
    status: string,
    isPaid: boolean
  ): "default" | "destructive" | "outline" | "secondary" => {
    if (!isPaid) return "destructive";
    return status === "active" ? "default" : "secondary";
  };

  const getPaymentStatusColor = (
    status: string
  ): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case "paid":
        return "default";
      case "overdue":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user.first_name} {user.last_name}
          </p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Current User Plan */}
      {plan && subscription && (
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Current Plan</span>
              <Badge
                variant={getStatusColor(
                  subscription.status,
                  subscription.payment_status === "paid"
                )}
              >
                {subscription.status} •{" "}
                {subscription.payment_status === "paid" ? "Paid" : "Unpaid"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid    md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-lg text-indigo-600">
                  {plan.name}
                </h3>
                <p className="text-gray-600">
                  ₹{plan?.price_inr?.toLocaleString("en-IN")}/month
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Available Modules
                </h4>
                <div className="flex flex-wrap gap-1">
                  {plan?.module_access &&
                    Object.entries(plan.module_access).map(
                      ([module, value]) => {
                        if (!value) return null; // skip false modules

                        return (
                          <Badge
                            key={module}
                            variant="outline"
                            className="text-xs"
                          >
                            {typeof value === "boolean"
                              ? module
                              : `${module}: ${value}`}
                          </Badge>
                        );
                      }
                    )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Plan Features
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {plan.features?.slice(0, 2).map((feature: string) => (
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
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
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
            <CardTitle className="text-sm font-medium">
              Paid Subscriptions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Fully paid accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Payments
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overduePayments}
            </div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
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
                const clientSub = subscriptions.find(
                  (s) => s.client_id === client.id
                );
                const clientPlan = plans.find(
                  (p) => p.id === clientSub?.plan_id
                );
                console.log("hello", clients, clientPlan);
                return (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {client.client_name}
                      </p>
                      <p className="text-sm text-gray-600">{client.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {clientPlan?.name || "No Plan"}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(client.created_at).toLocaleDateString()}
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
                const client = clients.find((c) => c.id === sub.client_id);
                const plan = plans.find((p) => p.id === sub.plan_id);
                console.log("subscriptions", subscriptions);
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {client?.name}
                      </p>
                      <p className="text-sm text-gray-600">{plan?.name} Plan</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={getPaymentStatusColor(sub.payment_status)}
                      >
                        {sub.payment_status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Expires: {new Date(sub.end_date).toLocaleDateString()}
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
      {/* <Card>
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
                  Last sync: {new Date().toLocaleString()} • Available modules:{" "}
                  {plan?.modules?.join(", ") || "None"}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-medium text-gray-900 mb-2">
                API Sync Configuration
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Endpoint: /api/hrms/sync</p>
                <p>• Authentication: Bearer token</p>
                <p>• Module access controlled by subscription plan</p>
                <p>• Real-time permission updates</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
