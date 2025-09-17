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
import { Textarea } from "./ui/textarea.tsx";
// import { Checkbox } from './ui/checkbox';
import {
  Plus,
  Edit,
  Trash2,
  Package,
  RefreshCw,
  Star,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  planAPI,
  subscriptionAPI,
  type Plan,
  type Subscription,
} from "../../api";

export function PlanManager() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: "" as "Starter" | "Pro" | "Enterprise" | "",
    description: "",
    price_inr: "",
    billing_cycle: "monthly",
    modules: "",
    features: "",
    max_users: "1",
    max_clients: "10",
    is_active: true,
  });

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);

      const [plansResponse, subscriptionsResponse] = await Promise.all([
        planAPI.getPlans({ limit: 100 }),
        subscriptionAPI.getSubscriptions({ limit: 100 }),
      ]);

      setPlans(plansResponse.plans || []);
      setSubscriptions(subscriptionsResponse.subscriptions || []);
    } catch (error: any) {
      console.error("Error loading plan data:", error);
      toast.error("Failed to load plan data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const modules = formData.modules
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m);
      const features = formData.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f);

      const planData = {
        name: formData.name,
        description: formData.description,
        price_inr: parseFloat(formData.price_inr) || 0,
        billing_cycle: formData.billing_cycle,
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        module_access: formData.modules
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean)
          .reduce((acc, module) => {
            acc[module] = true;
            return acc;
          }, {} as Record<string, boolean>),
        max_users: parseInt(formData.max_users) || 1,
        max_clients: parseInt(formData.max_clients) || 10,
        is_active: formData.is_active,
      };

      if (editingPlan) {
        // Update existing plan
        await planAPI.updatePlan(editingPlan.id, planData);
        toast.success("Plan updated successfully");
      } else {
        // Add new plan
        await planAPI.createPlan(planData);
        toast.success("Plan created successfully");
      }

      resetForm();
      loadData(); // Refresh the data
    } catch (error: any) {
      console.error("Error saving plan:", error);
      toast.error(error.message || "Failed to save plan");
    }
  };

  const handleDelete = async (planId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this plan? This action cannot be undone."
      )
    ) {
      try {
        await planAPI.deletePlan(planId);
        toast.success("Plan deleted successfully");
        loadData(); // Refresh the data
      } catch (error: any) {
        console.error("Error deleting plan:", error);
        toast.error(error.message || "Failed to delete plan");
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", modules: "", features: "" });
    setEditingPlan(null);
    setIsAddDialogOpen(false);
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      modules: plan.modules.join(", "),
      features: plan.features.join(", "),
    });
    setIsAddDialogOpen(true);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "Starter":
        return <Package className="w-5 h-5 text-green-600" />;
      case "Pro":
        return <Star className="w-5 h-5 text-blue-600" />;
      case "Enterprise":
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case "Starter":
        return "from-green-50 to-green-100 border-green-200";
      case "Pro":
        return "from-blue-50 to-blue-100 border-blue-200";
      case "Enterprise":
        return "from-purple-50 to-purple-100 border-purple-200";
      default:
        return "from-gray-50 to-gray-100 border-gray-200";
    }
  };

  const defaultModules = {
    Starter: ["User Management", "Basic Reports"],
    Pro: ["User Management", "Advanced Reports", "Payroll", "Leave Management"],
    Enterprise: [
      "User Management",
      "Advanced Reports",
      "Payroll",
      "Leave Management",
      "Performance Management",
      "Custom Integrations",
    ],
  };

  const defaultFeatures = {
    Starter: ["Up to 10 users", "Basic reporting", "Email support"],
    Pro: [
      "Up to 50 users",
      "Advanced reporting",
      "Payroll management",
      "Priority support",
    ],
    Enterprise: [
      "Unlimited users",
      "Custom reports",
      "Full HR suite",
      "Dedicated support",
      "API access",
    ],
  };

  const fillDefaults = (planType: "Starter" | "Pro" | "Enterprise") => {
    setFormData((prev) => ({
      ...prev,
      modules: defaultModules[planType].join(", "),
      features: defaultFeatures[planType].join(", "),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plan Management</h1>
          <p className="text-gray-600">
            Configure HRMS subscription plans and their features
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPlan(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Edit Plan" : "Create New Plan"}
              </DialogTitle>
              <DialogDescription>
                {editingPlan
                  ? "Update plan pricing, modules, and features."
                  : "Create a new subscription plan with pricing and module access configuration."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Plan Name & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter plan name (e.g., Starter, Pro, Enterprise)"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price_inr">Monthly Price (₹)</Label>
                  <Input
                    id="price_inr"
                    type="number"
                    value={formData.price_inr}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price_inr: e.target.value,
                      }))
                    }
                    placeholder="2500"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Short description about the plan"
                  className="min-h-20"
                  required
                />
              </div>

              {/* Billing Cycle */}
              <div>
                <Label htmlFor="billing_cycle">Billing Cycle</Label>
                <select
                  id="billing_cycle"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.billing_cycle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      billing_cycle: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Modules */}
              <div>
                <Label htmlFor="modules">Available Modules</Label>
                <Textarea
                  id="modules"
                  value={formData.modules}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      modules: e.target.value,
                    }))
                  }
                  placeholder="User Management, Payroll, Leave Management"
                  className="min-h-20"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Comma-separated list of modules
                </p>
              </div>

              {/* Features */}
              <div>
                <Label htmlFor="features">Plan Features</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      features: e.target.value,
                    }))
                  }
                  placeholder="Up to 50 users, Advanced reporting, Priority support"
                  className="min-h-20"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Comma-separated list of features
                </p>
              </div>

              {/* Max Users & Clients */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_users">Max Users</Label>
                  <Input
                    id="max_users"
                    type="number"
                    value={formData.max_users}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        max_users: e.target.value,
                      }))
                    }
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_clients">Max Clients</Label>
                  <Input
                    id="max_clients"
                    type="number"
                    value={formData.max_clients}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        max_clients: e.target.value,
                      }))
                    }
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPlan ? "Update" : "Create"} Plan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid    md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative bg-gradient-to-br ${getPlanColor(plan.name)}`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getPlanIcon(plan.name)}
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      ₹
                      {plan.price_inr != null
                        ? Number(plan.price_inr).toLocaleString("en-IN")
                        : "0"}
                      <span className="text-base font-normal text-gray-600">
                        /month
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(plan)}
                    className="bg-white/50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
                    className="bg-white/50 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Available Modules
                  </h4>
                  <div className="space-y-1">
                    {plan.module_access &&
                    Object.keys(plan.module_access).length > 0 ? (
                      Object.keys(plan.module_access).map(
                        (module) =>
                          plan.module_access[module] && (
                            <div
                              key={module}
                              className="flex items-center text-sm"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              {module}
                            </div>
                          )
                      )
                    ) : (
                      <p className="text-sm text-gray-500">No modules</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Plan Features
                  </h4>
                  <div className="space-y-1">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start text-sm">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {plan.apiAccess && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      API Access Included
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            {plan.name === "Pro" && (
              <div className="absolute -top-2 right-4">
                <Badge className="bg-blue-600 text-white">Most Popular</Badge>
              </div>
            )}
          </Card>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No plans configured
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first subscription plan to start offering HRMS
                  services.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Plan Comparison */}
      {plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Module Availability Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Module</th>
                    {plans.map((plan) => (
                      <th
                        key={plan.id}
                        className="text-center py-2 px-4 min-w-20"
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(plans.flatMap((p) => p.modules))).map(
                    (module) => (
                      <tr key={module} className="border-b">
                        <td className="py-2 pr-4 font-medium">{module}</td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="text-center py-2 px-4">
                            {Array.isArray(plan.modules) &&
                            plan.modules.includes(module) ? (
                              <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                            ) : (
                              <div className="w-4 h-4 mx-auto"></div>
                            )}
                          </td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
