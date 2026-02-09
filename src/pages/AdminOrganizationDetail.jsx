import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import moment from "moment";
import { createPageUrl } from "../utils";

export default function AdminOrganizationDetail() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const orgId = urlParams.get("id");

  const [editedOrg, setEditedOrg] = useState(null);

  // Fetch organization
  const { data: organization, isLoading } = useQuery({
    queryKey: ["admin-organization", orgId],
    queryFn: async () => {
      const orgs = await base44.entities.Organization.list();
      return orgs.find((o) => o.id === orgId);
    },
    enabled: !!orgId,
  });

  // Fetch related data
  const { data: projects = [] } = useQuery({
    queryKey: ["admin-org-projects", orgId],
    queryFn: async () => {
      const allProjects = await base44.entities.Project.list();
      return allProjects.filter((p) => p.organization_id === orgId);
    },
    enabled: !!orgId,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-org-users", orgId],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return allUsers.filter((u) => u.organization_id === orgId);
    },
    enabled: !!orgId,
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["admin-org-audit", orgId],
    queryFn: async () => {
      const allLogs = await base44.entities.AuditLog.list("-created_date", 100);
      return allLogs.filter((log) => {
        const project = projects.find((p) => p.id === log.project_id);
        return project?.organization_id === orgId;
      });
    },
    enabled: !!orgId && projects.length > 0,
  });

  // Update mutation
  const updateOrgMutation = useMutation({
    mutationFn: (data) => base44.entities.Organization.update(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organization", orgId] });
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
      setEditedOrg(null);
    },
  });

  const handleSave = () => {
    if (editedOrg) {
      updateOrgMutation.mutate(editedOrg);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout currentPageName="AdminOrganizations">
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  if (!organization) {
    return (
      <AdminLayout currentPageName="AdminOrganizations">
        <p>Organization not found</p>
      </AdminLayout>
    );
  }

  const currentOrg = editedOrg || organization;
  const projectUsage = (projects.length / (organization.max_projects || 100)) * 100;
  const storageUsage = ((organization.storage_used_mb || 0) / 5000) * 100;

  const breadcrumbs = [
    { label: "Organizations", href: createPageUrl("AdminOrganizations") },
    { label: organization.name },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      TRIAL: { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      ACTIVE: { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" },
      SUSPENDED: { variant: "destructive" },
      CANCELLED: { variant: "secondary" },
    };
    return variants[status] || { variant: "secondary" };
  };

  return (
    <AdminLayout currentPageName="AdminOrganizations" breadcrumbs={breadcrumbs}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{organization.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge {...getStatusBadge(organization.account_status)}>
              {organization.account_status}
            </Badge>
            <Badge variant="outline">{organization.subscription_tier?.replace(/_/g, " ")}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Login As</Button>
          <Button variant="outline">
            {organization.account_status === "SUSPENDED" ? "Activate" : "Suspend"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="metrics">Usage Metrics</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle>Organization Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={currentOrg.name}
                    onChange={(e) =>
                      setEditedOrg({ ...currentOrg, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={currentOrg.website || ""}
                    onChange={(e) =>
                      setEditedOrg({ ...currentOrg, website: e.target.value })
                    }
                    placeholder="https://"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input
                    value={currentOrg.industry || ""}
                    onChange={(e) =>
                      setEditedOrg({ ...currentOrg, industry: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={currentOrg.country || ""}
                    onChange={(e) =>
                      setEditedOrg({ ...currentOrg, country: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Created</p>
                    <p className="font-medium">
                      {moment(organization.created_date).format("MMM D, YYYY")}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Last Activity</p>
                    <p className="font-medium">{moment(organization.updated_date).fromNow()}</p>
                  </div>
                </div>
                {editedOrg && (
                  <Button onClick={handleSave} disabled={updateOrgMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Account Status</p>
                    <p className="font-medium">{organization.account_status}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Subscription Tier</p>
                    <p className="font-medium">
                      {organization.subscription_tier?.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>

                {organization.account_status === "TRIAL" && organization.trial_end_date && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Trial Ends</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {moment(organization.trial_end_date).format("MMM D, YYYY")}
                    </p>
                    <p className="text-sm text-slate-500">
                      ({moment(organization.trial_end_date).fromNow()})
                    </p>
                    <Button variant="outline" className="mt-3">
                      Extend Trial by 7 days
                    </Button>
                  </div>
                )}

                {organization.account_status === "ACTIVE" &&
                  organization.subscription_start_date && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Subscription Started</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {moment(organization.subscription_start_date).format("MMM D, YYYY")}
                      </p>
                    </div>
                  )}

                <div>
                  <Label>Billing Email</Label>
                  <Input
                    value={currentOrg.billing_email || ""}
                    onChange={(e) =>
                      setEditedOrg({ ...currentOrg, billing_email: e.target.value })
                    }
                    placeholder="billing@example.com"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Projects</span>
                  <span className="font-medium">
                    {projects.length} / {organization.max_projects || "∞"}
                  </span>
                </div>
                <Progress value={projectUsage} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Users</span>
                  <span className="font-medium">
                    {users.length} / {organization.max_users || "∞"}
                  </span>
                </div>
                <Progress
                  value={(users.length / (organization.max_users || 100)) * 100}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Storage</span>
                  <span className="font-medium">
                    {organization.storage_used_mb || 0} MB / 5 GB
                  </span>
                </div>
                <Progress value={storageUsage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card>
            <CardContent className="p-6">
              {projects.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  This organization hasn't created any projects yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                          Project Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                          Created
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project.id} className="border-b border-slate-100">
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {project.name}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {project.project_type?.replace(/_/g, " ")}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{project.status}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {moment(project.created_date).format("MMM D, YYYY")}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={createPageUrl("ProjectDetail") + `?id=${project.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View in App
                              </a>
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

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardContent className="p-6">
              {users.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  No users in this organization.
                </p>
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
                          Role
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                          Last Login
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-slate-100">
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {user.full_name}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{user.role}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {user.last_login_at
                              ? moment(user.last_login_at).fromNow()
                              : "Never"}
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

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardContent className="p-6">
              {auditLogs.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No activity logs yet.</p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm border-b border-slate-100 pb-3">
                      <span className="text-slate-400 min-w-[100px]">
                        {moment(log.created_date).format("MMM D, h:mm A")}
                      </span>
                      <span className="text-slate-900">{log.action}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-slate-500 py-8">
                Usage metrics will be displayed here once tracking is implemented.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-slate-500 py-8">
                Admin notes feature coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}