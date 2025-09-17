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
  Building,
  Mail,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  clientAPI,
  planAPI,
  subscriptionAPI,
  type Client,
  type Plan,
  type Subscription,
} from "../../api";

export function ClientManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    gst_number: "",
    pan_number: "",
    industry: "",
    company_size: "1-10",
    status: "active",
    notes: "",
  });

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);

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
      console.error("Error loading client data:", error);
      toast.error("Failed to load client data. Please try again.");
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
      const clientData = {
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country || "India",
        pincode: formData.pincode,
        gst_number: formData.gst_number,
        pan_number: formData.pan_number,
        industry: formData.industry,
        company_size: formData.company_size || "1-10",
        status: formData.status || "active",
        notes: formData.notes,
      };

      console.log("clientData", clientData);
      if (editingClient) {
        // Update existing client
        await clientAPI.updateClient(editingClient.id, clientData);
        toast.success("Client updated successfully");
      } else {
        // Add new client
        await clientAPI.createClient(clientData);
        toast.success("Client added successfully");
      }

      resetForm();
      loadData(); // Refresh the data
    } catch (error: any) {
      console.error("Error saving client:", error);
      toast.error(error.message || "Failed to save client");
    }
  };

  const handleDelete = async (clientId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this client? This will also delete their subscriptions."
      )
    ) {
      try {
        await clientAPI.deleteClient(clientId);
        toast.success("Client deleted successfully");
        loadData(); // Refresh the data
      } catch (error: any) {
        console.error("Error deleting client:", error);
        toast.error(error.message || "Failed to delete client");
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", industry: "", employees: "" });
    setEditingClient(null);
    setIsAddDialogOpen(false);
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      industry: client.industry,
      employees: client.employees.toString(),
    });
    setIsAddDialogOpen(true);
  };

  const getClientSubscription = (clientId: string) => {
    return subscriptions.find((sub) => sub.client_id === clientId);
  };

  const getClientPlan = (clientId: string) => {
    const subscription = getClientSubscription(clientId);
    return plans.find((plan) => plan.id === subscription?.plan_id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Client Management
          </h1>
          <p className="text-gray-600">
            Manage your HRMS clients and their subscriptions
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={loadData}
            variant="outline"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingClient(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? "Edit Client" : "Add New Client"}
                </DialogTitle>
                <DialogDescription>
                  {editingClient
                    ? "Update client information and details."
                    : "Create a new client with their company information and contact details."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Company Name */}
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        company_name: e.target.value,
                      }))
                    }
                    placeholder="Enter company name"
                    required
                  />
                </div>

                {/* Contact Person */}
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact_person: e.target.value,
                      }))
                    }
                    placeholder="Enter contact person"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Address */}
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      placeholder="Enter state"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      placeholder="India"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pincode: e.target.value,
                        }))
                      }
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>

                {/* GST & PAN */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gst_number">GST Number</Label>
                    <Input
                      id="gst_number"
                      value={formData.gst_number}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          gst_number: e.target.value,
                        }))
                      }
                      placeholder="Enter GST number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pan_number">PAN Number</Label>
                    <Input
                      id="pan_number"
                      value={formData.pan_number}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pan_number: e.target.value,
                        }))
                      }
                      placeholder="Enter PAN number"
                    />
                  </div>
                </div>

                {/* Industry */}
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        industry: e.target.value,
                      }))
                    }
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>

                {/* Company Size */}
                <div>
                  <Label htmlFor="company_size">Company Size</Label>
                  <select
                    id="company_size"
                    value={formData.company_size}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        company_size: e.target.value,
                      }))
                    }
                    className="border rounded p-2 w-full"
                    required
                  >
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Any extra info about the client"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingClient ? "Update" : "Add"} Client
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      <div className="grid gap-6">
        {clients.map((client) => {
          const subscription = getClientSubscription(client.id);
          const plan = getClientPlan(client.id);

          return (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Building className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{client.name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Mail className="w-4 h-4 mr-1" />
                        {client.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(client)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(client.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid    md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Client Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Joined:{" "}
                        {new Date(client.created_at).toLocaleDateString()}
                      </div>
                      <div>Industry: {client.industry}</div>
                      <div>Employees: {client.employees}</div>
                      <div>ID: {client.id}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Subscription
                    </h4>
                    {subscription && plan ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{plan.name}</Badge>
                          <Badge
                            variant={
                              subscription.payment_status === "paid"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {subscription.payment_status === "paid"
                              ? "Paid"
                              : "Unpaid"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Status: {subscription.status}</div>
                          <div>Payment: {subscription.payment_status}</div>
                          <div>
                            Expires:{" "}
                            {new Date(
                              subscription.end_date
                            ).toLocaleDateString()}
                          </div>
                          <div>₹{plan.price?.toLocaleString("en-IN")}/month</div>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="secondary">No Subscription</Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Available Modules
                    </h4>
                    {plan ? (
                      <div className="space-y-1">
                        {plan.modules?.map((module: string) => (
                          <div
                            key={module}
                            className="text-sm text-gray-600 flex items-center"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {module}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No modules available
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      HRMS Sync Status:
                      <span className="ml-1 text-green-600 font-medium">
                        Active
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      Sync with HRMS
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {clients.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No clients yet
              </h3>
              <p className="text-gray-600 mb-4">
                Add your first client to start managing their HRMS subscription.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Client
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
