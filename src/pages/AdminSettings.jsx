import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import moment from "moment";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [trialDuration, setTrialDuration] = useState(14);
  const [starterPrice, setStarterPrice] = useState(49);
  const [professionalPrice, setProfessionalPrice] = useState(149);

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const superAdmins = users.filter((u) => u.is_super_admin);

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const handleRemoveSuperAdmin = (userId) => {
    if (window.confirm("Remove super admin access for this user?")) {
      updateUserMutation.mutate({
        id: userId,
        data: { is_super_admin: false },
      });
    }
  };

  return (
    <AdminLayout currentPageName="AdminSettings">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">System Settings</h1>
      <p className="text-slate-500 mb-6">Configure Great Yellow system-wide settings</p>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="trial">Trial & Subscriptions</TabsTrigger>
          <TabsTrigger value="email">Email Configuration</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
          <TabsTrigger value="superadmins">Super Admins</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Application Name</Label>
                <Input value="Great Yellow" disabled />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input
                  defaultValue="Project Management for Nature-Based Services"
                  placeholder="Enter tagline"
                />
              </div>
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input defaultValue="support@greatyellow.io" />
              </div>
              <div className="space-y-2">
                <Label>Sales Email</Label>
                <Input defaultValue="sales@greatyellow.io" />
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Currency</Label>
                <Input value="GBP" disabled />
                <p className="text-xs text-slate-500">Currency is locked to GBP for now</p>
              </div>
              <div className="space-y-2">
                <Label>Default Discount Rate (for NPV)</Label>
                <Input type="number" defaultValue="8" />
                <p className="text-xs text-slate-500">Percentage used in NPV calculations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trial & Subscriptions Tab */}
        <TabsContent value="trial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trial Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Trial Duration (days)</Label>
                <Input
                  type="number"
                  value={trialDuration}
                  onChange={(e) => setTrialDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Trial Reminder (days before expiration)</Label>
                <Input type="number" defaultValue="3" />
              </div>
              <div className="space-y-2">
                <Label>Grace Period After Trial (days)</Label>
                <Input type="number" defaultValue="7" />
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Trial Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Starter Tier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Price (£)</Label>
                  <Input
                    type="number"
                    value={starterPrice}
                    onChange={(e) => setStarterPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Annual Price (£)</Label>
                  <Input type="number" defaultValue="490" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Projects</Label>
                  <Input type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label>Max Users</Label>
                  <Input type="number" defaultValue="10" />
                </div>
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Starter Tier
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Tier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Price (£)</Label>
                  <Input
                    type="number"
                    value={professionalPrice}
                    onChange={(e) => setProfessionalPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Annual Price (£)</Label>
                  <Input type="number" defaultValue="1490" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Projects</Label>
                  <Input type="number" defaultValue="25" />
                </div>
                <div className="space-y-2">
                  <Label>Max Users</Label>
                  <Input value="Unlimited" disabled />
                </div>
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Professional Tier
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Configuration Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input placeholder="smtp.example.com" />
              </div>
              <div className="space-y-2">
                <Label>SMTP Port</Label>
                <Input type="number" defaultValue="587" />
              </div>
              <div className="space-y-2">
                <Label>SMTP Username</Label>
                <Input placeholder="username" />
              </div>
              <div className="space-y-2">
                <Label>SMTP Password</Label>
                <Input type="password" placeholder="password" />
              </div>
              <div className="space-y-2">
                <Label>From Email</Label>
                <Input defaultValue="noreply@greatyellow.io" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Test Email Configuration</Button>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Email Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Flags Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable New Signups</p>
                  <p className="text-sm text-slate-500">
                    Allow new users to register accounts
                  </p>
                </div>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Public Website</p>
                  <p className="text-sm text-slate-500">
                    Show public marketing pages
                  </p>
                </div>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-slate-500">
                    Non-admin users see maintenance page
                  </p>
                </div>
                <Checkbox />
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Feature Flags
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Beta Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Multi-Currency</p>
                  <p className="text-sm text-slate-500">Support multiple currencies</p>
                </div>
                <Checkbox />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable API Access</p>
                  <p className="text-sm text-slate-500">Allow API integrations</p>
                </div>
                <Checkbox />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Super Admins Tab */}
        <TabsContent value="superadmins" className="space-y-6">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Warning</p>
                  <p className="text-sm text-yellow-700">
                    Super admins have full access to all data and settings. Only grant this
                    access to trusted individuals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Super Admins</CardTitle>
            </CardHeader>
            <CardContent>
              {superAdmins.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No super admins</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                          Last Login
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {superAdmins.map((user) => (
                        <tr key={user.id} className="border-b border-slate-100">
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {user.full_name}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {user.last_login_at
                              ? moment(user.last_login_at).fromNow()
                              : "Never"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSuperAdmin(user.id)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger" className="space-y-6">
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-900">Export All Data</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Export complete database dump for backup purposes.
              </p>
              <Button variant="destructive">Export Database</Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-900">Cleanup Old Trials</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Delete all trial accounts that expired more than 30 days ago.
              </p>
              <div className="flex items-center gap-3 mb-4">
                <Checkbox id="cleanup-confirm" />
                <label htmlFor="cleanup-confirm" className="text-sm">
                  I understand this will permanently delete accounts
                </label>
              </div>
              <Button variant="destructive">Delete Expired Trials</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}