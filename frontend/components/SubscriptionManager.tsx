import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Badge } from "./ui/badge.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select.tsx";
import {
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  subscriptionAPI,
  clientAPI,
  planAPI,
  type Subscription,
  type Client,
  type Plan,
} from "../../api";

export function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [formData, setFormData] = useState({
    client_id: "",
    plan_id: "",
    start_date: "",
    end_date: "",
    amount_inr: 0,
    billing_cycle: "monthly" as "monthly" | "quarterly" | "yearly",
    status: "active" as "active" | "inactive" | "cancelled",
    payment_status: "pending" as "paid" | "pending" | "overdue" | "failed",
    auto_renewal: true,
    payment_method: "",
  });

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);

      const [subscriptionsResponse, clientsResponse, plansResponse] =
        await Promise.all([
          subscriptionAPI.getSubscriptions({ limit: 100 }),
          clientAPI.getClients({ limit: 100 }),
          planAPI.getActivePlans(),
        ]);

      setSubscriptions(subscriptionsResponse.subscriptions || []);
      setClients(clientsResponse.clients || []);
      setPlans(plansResponse.plans || []);
    } catch (error: any) {
      console.error("Error loading subscription data:", error);
      toast.error("Failed to load subscription data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("formData", formData);
    try {
      if (editingSubscription) {
        // Update existing subscription
        await subscriptionAPI.updateSubscription(
          editingSubscription.id,
          formData
        );
        toast.success("Subscription updated successfully");
      } else {
        // Add new subscription
        await subscriptionAPI.createSubscription(formData);
        toast.success("Subscription created successfully");
      }

      resetForm();
      loadData(); // Refresh the data
    } catch (error: any) {
      console.error("Error saving subscription:", error);
      toast.error(error.message || "Failed to save subscription");
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      planId: "",
      status: "active",
      isPaid: true,
      paymentStatus: "paid",
    });
    setEditingSubscription(null);
    setIsAddDialogOpen(false);
  };

  const handleDelete = async (subscriptionId: string) => {
    if (confirm("Are you sure you want to delete this subscription?")) {
      try {
        await subscriptionAPI.deleteSubscription(subscriptionId);
        toast.success("Subscription deleted successfully");
        loadData(); // Refresh the data
      } catch (error: any) {
        console.error("Error deleting subscription:", error);
        toast.error(error.message || "Failed to delete subscription");
      }
    }
  };

  const getStatusIcon = (
    status: string,
    isPaid: boolean,
    paymentStatus: string
  ) => {
    if (!isPaid || paymentStatus === "overdue") {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    if (status === "active") {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusColor = (
    status: string,
    isPaid: boolean,
    paymentStatus: string
  ): "default" | "destructive" | "outline" | "secondary" => {
    if (!isPaid || paymentStatus === "overdue") return "destructive";
    if (status === "active") return "default";
    return "secondary";
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
        return "outline";
    }
  };

  const togglePaymentStatus = (subscriptionId: string) => {
    const updatedSubscriptions = subscriptions.map((sub) =>
      sub.id === subscriptionId
        ? {
            ...sub,
            isPaid: !sub.isPaid,
            paymentStatus: (!sub.isPaid ? "paid" : "overdue") as
              | "paid"
              | "pending"
              | "overdue",
          }
        : sub
    );
    onUpdate(updatedSubscriptions);
    toast.success("Payment status updated");
  };

  console.log("clients", clients);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Subscription Management
          </h1>
          <p className="text-gray-600">
            Manage client subscriptions and billing
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSubscription(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Subscription
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSubscription
                  ? "Edit Subscription"
                  : "Create New Subscription"}
              </DialogTitle>
              <DialogDescription>
                {editingSubscription
                  ? "Update subscription details and payment status."
                  : "Create a new subscription by assigning a client to a plan."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingSubscription && (
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, client_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients
                        .filter(
                          (client) =>
                            !subscriptions.some(
                              (sub) => sub.clientId === client.id
                            )
                        )
                        .map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.company_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="plan">Plan</Label>
                <Select
                  value={formData.plan_id}
                  onValueChange={(planId) => {
                    const selectedPlan = plans.find((p) => p.id === planId);
                    setFormData((prev) => ({
                      ...prev,
                      plan_id: planId,
                      amount_inr: selectedPlan?.price_inr || 0,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ₹
                        {plan.price_inr != null
                          ? Number(plan.price_inr).toLocaleString("en-IN")
                          : "0"}
                        /month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start and End Dates */}
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      start_date: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      end_date: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount_inr">Amount (INR)</Label>
                <Input
                  type="number"
                  value={formData.amount_inr || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      amount_inr: Number(e.target.value),
                    }))
                  }
                  placeholder="Enter amount"
                />
              </div>

              {/* Billing Cycle */}
              <div>
                <Label htmlFor="billing_cycle">Billing Cycle</Label>
                <Select
                  value={formData.billing_cycle || ""}
                  onValueChange={(value: "monthly" | "yearly") =>
                    setFormData((prev) => ({ ...prev, billing_cycle: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive" | "cancelled") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Status */}
              <div>
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(
                    value: "paid" | "pending" | "overdue" | "failed"
                  ) =>
                    setFormData((prev) => ({
                      ...prev,
                      payment_status: value,
                      isPaid: value === "paid",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={formData.payment_method || ""}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, payment_method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Auto Renewal */}
              <div className="flex items-center space-x-2">
                <input
                  id="auto_renewal"
                  type="checkbox"
                  checked={formData.auto_renewal || false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      auto_renewal: e.target.checked,
                    }))
                  }
                />
                <Label htmlFor="auto_renewal">Auto Renewal</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSubscription ? "Update" : "Create"} Subscription
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid    md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptions.filter((s) => s.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptions.filter((s) => s.isPaid).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    subscriptions.filter((s) => s.paymentStatus === "pending")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    subscriptions.filter((s) => s.paymentStatus === "overdue")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {subscriptions.map((subscription) => {
          const client = clients.find((c) => c.id === subscription.client_id);
          const plan = plans.find((p) => p.id === subscription.plan_id);
          return (
            <Card key={subscription.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(
                      subscription.status,
                      subscription.isPaid,
                      subscription.paymentStatus
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {client?.client_name || "Unknown Client"}
                      </h3>
                      <p className="text-gray-600">
                        {plan?.name || "Unknown Plan"} • ₹
                        {plan?.price_inr?.toLocaleString("en-IN") || 0}/month
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={getStatusColor(
                        subscription.status,
                        subscription.isPaid,
                        subscription.payment_status
                      )}
                    >
                      {subscription.status}
                    </Badge>
                    <Badge
                      variant={getPaymentStatusColor(
                        subscription.payment_status
                      )}
                    >
                      {subscription.payment_status}
                    </Badge>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePaymentStatus(subscription.id)}
                      >
                        <CreditCard className="w-4 h-4 mr-1" />
                        {subscription.isPaid ? "Mark Unpaid" : "Mark Paid"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(subscription)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(subscription.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid    md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Subscription Period
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(subscription.start_date).toLocaleDateString()} -
                      {new Date(subscription.end_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Available Modules
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {plan?.module_access &&
                        Object.entries(plan.module_access)
                          .filter(([_, value]) => value) // only show truthy modules
                          .slice(0, 3)
                          .map(([module, value]) => (
                            <Badge
                              key={module}
                              variant="outline"
                              className="text-xs"
                            >
                              {typeof value === "boolean"
                                ? module
                                : `${module}: ${value}`}
                            </Badge>
                          ))}

                      {plan?.module_access &&
                        Object.values(plan.module_access).filter(Boolean)
                          .length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +
                            {Object.values(plan.module_access).filter(
                              Boolean
                            ).length - 3}{" "}
                            more
                          </Badge>
                        )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      HRMS Integration
                    </p>
                    <p className="text-sm text-green-600">
                      Synced • Last update: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {subscriptions.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No subscriptions yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create subscriptions for your clients to manage their HRMS
                access.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Subscription
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
