import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Client, Subscription, Plan } from "../App";
import {
  Plus,
  Edit,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  clients: Client[];
  plans: Plan[];
  onUpdate: (subscriptions: Subscription[]) => void;
}

export function SubscriptionManager({
  subscriptions,
  clients,
  plans,
  onUpdate,
}: SubscriptionManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [formData, setFormData] = useState({
    clientId: "",
    planId: "",
    status: "active" as "active" | "inactive",
    isPaid: true,
    paymentStatus: "paid" as "paid" | "pending" | "overdue",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSubscription) {
      // Update existing subscription
      const updatedSubscriptions = subscriptions.map((sub) =>
        sub.id === editingSubscription.id
          ? {
              ...sub,
              planId: formData.planId,
              status: formData.status,
              isPaid: formData.isPaid,
              paymentStatus: formData.paymentStatus,
            }
          : sub
      );
      onUpdate(updatedSubscriptions);
      toast.success("Subscription updated successfully");
    } else {
      // Add new subscription
      const newSubscription: Subscription = {
        id: Date.now().toString(),
        clientId: formData.clientId,
        planId: formData.planId,
        status: formData.status,
        isPaid: formData.isPaid,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        paymentStatus: formData.paymentStatus,
      };
      onUpdate([...subscriptions, newSubscription]);
      toast.success("Subscription created successfully");
    }

    resetForm();
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
    setIsDialogOpen(false);
  };

  const openEditDialog = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      clientId: subscription.clientId,
      planId: subscription.planId,
      status: subscription.status,
      isPaid: subscription.isPaid,
      paymentStatus: subscription.paymentStatus,
    });
    setIsDialogOpen(true);
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
  ) => {
    if (!isPaid || paymentStatus === "overdue") return "destructive";
    if (status === "active") return "default";
    return "secondary";
  };

  const getPaymentStatusColor = (status: string) => {
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
            paymentStatus: !sub.isPaid ? "paid" : "overdue",
          }
        : sub
    );
    onUpdate(updatedSubscriptions);
    toast.success("Payment status updated");
  };

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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingSubscription && (
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, clientId: value }))
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
                            {client.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="plan">Plan</Label>
                <Select
                  value={formData.planId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, planId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ₹
                        {plan.price != null
                          ? Number(plan.price).toLocaleString("en-IN")
                          : "0"}
                        /month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value: "paid" | "pending" | "overdue") =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentStatus: value,
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
                  </SelectContent>
                </Select>
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
          const client = clients.find((c) => c.id === subscription.clientId);
          const plan = plans.find((p) => p.id === subscription.planId);

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
                        {client?.name || "Unknown Client"}
                      </h3>
                      <p className="text-gray-600">
                        {plan?.name || "Unknown Plan"} • ₹
                        {plan?.price.toLocaleString("en-IN") || 0}/month
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={getStatusColor(
                        subscription.status,
                        subscription.isPaid,
                        subscription.paymentStatus
                      )}
                    >
                      {subscription.status}
                    </Badge>
                    <Badge
                      variant={getPaymentStatusColor(
                        subscription.paymentStatus
                      )}
                    >
                      {subscription.paymentStatus}
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
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid    md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Subscription Period
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(subscription.startDate).toLocaleDateString()} -
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Available Modules
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {plan?.modules.slice(0, 3).map((module) => (
                        <Badge
                          key={module}
                          variant="outline"
                          className="text-xs"
                        >
                          {module}
                        </Badge>
                      ))}
                      {plan && plan.modules.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{plan.modules.length - 3} more
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
              <Button onClick={() => setIsDialogOpen(true)}>
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
