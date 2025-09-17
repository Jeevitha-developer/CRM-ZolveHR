import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Client, Subscription, Plan } from '../App';
import { Plus, Edit, Trash2, Building, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ClientManagerProps {
  clients: Client[];
  subscriptions: Subscription[];
  plans: Plan[];
  onUpdate: (clients: Client[]) => void;
}

export function ClientManager({ clients, subscriptions, plans, onUpdate }: ClientManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subscriptionPlan: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      // Update existing client
      const updatedClients = clients.map(client =>
        client.id === editingClient.id
          ? { ...client, name: formData.name, email: formData.email }
          : client
      );
      onUpdate(updatedClients);
      toast.success('Client updated successfully');
    } else {
      // Add new client
      const newClient: Client = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        createdAt: new Date().toISOString().split('T')[0],
        subscriptionId: Date.now().toString()
      };
      onUpdate([...clients, newClient]);
      toast.success('Client added successfully');
    }
    
    resetForm();
  };

  const handleDelete = (clientId: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      const updatedClients = clients.filter(client => client.id !== clientId);
      onUpdate(updatedClients);
      toast.success('Client deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', subscriptionPlan: '' });
    setEditingClient(null);
    setIsAddDialogOpen(false);
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      subscriptionPlan: ''
    });
    setIsAddDialogOpen(true);
  };

  const getClientSubscription = (clientId: string) => {
    return subscriptions.find(sub => sub.clientId === clientId);
  };

  const getClientPlan = (clientId: string) => {
    const subscription = getClientSubscription(clientId);
    return plans.find(plan => plan.id === subscription?.planId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600">Manage your HRMS clients and their subscriptions</p>
        </div>
        
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
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter company name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>

              {!editingClient && (
                <div>
                  <Label htmlFor="plan">Initial Plan</Label>
                  <Select
                    value={formData.subscriptionPlan}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subscriptionPlan: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ₹{plan.price.toLocaleString('en-IN')}/month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingClient ? 'Update' : 'Add'} Client
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                    <h4 className="font-medium text-gray-900 mb-2">Client Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Joined: {new Date(client.createdAt).toLocaleDateString()}
                      </div>
                      <div>ID: {client.id}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Subscription</h4>
                    {subscription && plan ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{plan.name}</Badge>
                          <Badge variant={subscription.isPaid ? 'default' : 'destructive'}>
                            {subscription.isPaid ? 'Paid' : 'Unpaid'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Status: {subscription.status}</div>
                          <div>Payment: {subscription.paymentStatus}</div>
                          <div>Expires: {new Date(subscription.endDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="secondary">No Subscription</Badge>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Available Modules</h4>
                    {plan ? (
                      <div className="space-y-1">
                        {plan.modules.map((module) => (
                          <div key={module} className="text-sm text-gray-600 flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {module}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No modules available</div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      HRMS Sync Status: 
                      <span className="ml-1 text-green-600 font-medium">Active</span>
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
        
        {clients.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
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