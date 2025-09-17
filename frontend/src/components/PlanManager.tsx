import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plan } from '../App';
import { Plus, Edit, Trash2, Package, CheckCircle, Star } from 'lucide-react';
import { toast } from 'sonner';

interface PlanManagerProps {
  plans: Plan[];
  onUpdate: (plans: Plan[]) => void;
}

export function PlanManager({ plans, onUpdate }: PlanManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '' as 'Starter' | 'Pro' | 'Enterprise' | '',
    price: '',
    modules: '',
    features: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const modules = formData.modules.split(',').map(m => m.trim()).filter(m => m);
    const features = formData.features.split(',').map(f => f.trim()).filter(f => f);
    
    if (editingPlan) {
      // Update existing plan
      const updatedPlans = plans.map(plan =>
        plan.id === editingPlan.id
          ? {
              ...plan,
              name: formData.name as 'Starter' | 'Pro' | 'Enterprise',
              price: Number(formData.price),
              modules,
              features
            }
          : plan
      );
      onUpdate(updatedPlans);
      toast.success('Plan updated successfully');
    } else {
      // Add new plan
      const newPlan: Plan = {
        id: Date.now().toString(),
        name: formData.name as 'Starter' | 'Pro' | 'Enterprise',
        price: Number(formData.price),
        modules,
        features
      };
      onUpdate([...plans, newPlan]);
      toast.success('Plan created successfully');
    }
    
    resetForm();
  };

  const handleDelete = (planId: string) => {
    if (confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      const updatedPlans = plans.filter(plan => plan.id !== planId);
      onUpdate(updatedPlans);
      toast.success('Plan deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', modules: '', features: '' });
    setEditingPlan(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      modules: plan.modules.join(', '),
      features: plan.features.join(', ')
    });
    setIsDialogOpen(true);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'Starter': return <Package className="w-5 h-5 text-green-600" />;
      case 'Pro': return <Star className="w-5 h-5 text-blue-600" />;
      case 'Enterprise': return <CheckCircle className="w-5 h-5 text-purple-600" />;
      default: return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'Starter': return 'from-green-50 to-green-100 border-green-200';
      case 'Pro': return 'from-blue-50 to-blue-100 border-blue-200';
      case 'Enterprise': return 'from-purple-50 to-purple-100 border-purple-200';
      default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const defaultModules = {
    Starter: ['User Management', 'Basic Reports'],
    Pro: ['User Management', 'Advanced Reports', 'Payroll', 'Leave Management'],
    Enterprise: ['User Management', 'Advanced Reports', 'Payroll', 'Leave Management', 'Performance Management', 'Custom Integrations']
  };

  const defaultFeatures = {
    Starter: ['Up to 10 users', 'Basic reporting', 'Email support'],
    Pro: ['Up to 50 users', 'Advanced reporting', 'Payroll management', 'Priority support'],
    Enterprise: ['Unlimited users', 'Custom reports', 'Full HR suite', 'Dedicated support', 'API access']
  };

  const fillDefaults = (planType: 'Starter' | 'Pro' | 'Enterprise') => {
    setFormData(prev => ({
      ...prev,
      modules: defaultModules[planType].join(', '),
      features: defaultFeatures[planType].join(', ')
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plan Management</h1>
          <p className="text-gray-600">Configure HRMS subscription plans and their features</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPlan(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value as 'Starter' | 'Pro' | 'Enterprise';
                      setFormData(prev => ({ ...prev, name: value }));
                      if (value && !editingPlan) {
                        fillDefaults(value);
                      }
                    }}
                    required
                  >
                    <option value="">Select plan type</option>
                    <option value="Starter">Starter</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="price">Monthly Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="2500"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="modules">Available Modules</Label>
                <Textarea
                  id="modules"
                  value={formData.modules}
                  onChange={(e) => setFormData(prev => ({ ...prev, modules: e.target.value }))}
                  placeholder="User Management, Advanced Reports, Payroll, Leave Management"
                  className="min-h-20"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Comma-separated list of modules available in this plan
                </p>
              </div>

              <div>
                <Label htmlFor="features">Plan Features</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                  placeholder="Up to 50 users, Advanced reporting, Priority support"
                  className="min-h-20"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Comma-separated list of plan features and benefits
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPlan ? 'Update' : 'Create'} Plan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid    md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative bg-gradient-to-br ${getPlanColor(plan.name)}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getPlanIcon(plan.name)}
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      ₹{plan.price.toLocaleString('en-IN')}
                      <span className="text-base font-normal text-gray-600">/month</span>
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
                  <h4 className="font-medium text-gray-900 mb-2">Available Modules</h4>
                  <div className="space-y-1">
                    {plan.modules.map((module) => (
                      <div key={module} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {module}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Plan Features</h4>
                  <div className="space-y-1">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start text-sm">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            
            {plan.name === 'Pro' && (
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No plans configured</h3>
                <p className="text-gray-600 mb-6">
                  Create your first subscription plan to start offering HRMS services.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
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
                      <th key={plan.id} className="text-center py-2 px-4 min-w-20">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(plans.flatMap(p => p.modules))).map((module) => (
                    <tr key={module} className="border-b">
                      <td className="py-2 pr-4 font-medium">{module}</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="text-center py-2 px-4">
                          {plan.modules.includes(module) ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <div className="w-4 h-4 mx-auto"></div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}