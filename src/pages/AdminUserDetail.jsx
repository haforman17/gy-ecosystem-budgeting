import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import moment from "moment";
import { createPageUrl } from "../utils";

export default function AdminUserDetail() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");

  const [editedUser, setEditedUser] = useState(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      return users.find((u) => u.id === userId);
    },
    enabled: !!userId,
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: () => base44.entities.Organization.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["admin-user-projects", userId],
    queryFn: async () => {
      const allProjects = await base44.entities.Project.list();
      return allProjects.filter((p) => p.owner_id === userId);
    },
    enabled: !!userId,
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["admin-user-audit", userId],
    queryFn: async () => {
      const allLogs = await base44.entities.AuditLog.list("-created_date", 100);
      return allLogs.filter((log) => log.user_id === userId);
    },
    enabled: !!userId,
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.entities.User.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditedUser(null);
    },
  });

  const handleSave = () => {
    if (editedUser) {
      updateUserMutation.mutate(editedUser);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout currentPageName="AdminUsers">
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout currentPageName="AdminUsers">
        <p>User not found</p>
      </AdminLayout>
    );
  }

  const currentUser = editedUser || user;
  const organization = organizations.find((o) => o.id === user.organization_id);

  const breadcrumbs = [
    { label: "Users", href: createPageUrl("AdminUsers") },
    { label: user.full_name },
  ];

  return (
    <AdminLayout currentPageName="AdminUsers" breadcrumbs={breadcrumbs}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{user.full_name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge>{user.role}</Badge>
            {user.is_super_admin && (
              <Badge className="bg-purple-100 text-purple-700">Super Admin</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Login As</Button>
          <Button variant="outline">Suspend</Button>
          <Button variant="destructive">Delete User</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={currentUser.full_name}
                    onChange={(e) =>
                      setEditedUser({ ...currentUser, full_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={currentUser.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Organization</Label>
                  {organization ? (
                    <Link
                      to={createPageUrl("AdminOrganizationDetail") + `?id=${organization.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {organization.name}
                    </Link>
                  ) : (
                    <p className="text-sm text-slate-500">No organization</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={currentUser.role} disabled />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Created</p>
                    <p className="font-medium">
                      {moment(user.created_date).format("MMM D, YYYY")}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Last Login</p>
                    <p className="font-medium">
                      {user.last_login_at ? moment(user.last_login_at).fromNow() : "Never"}
                    </p>
                  </div>
                </div>
                {editedUser && (
                  <Button onClick={handleSave} disabled={updateUserMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  Send Password Reset Email
                </Button>
                <Button variant="outline" className="w-full">
                  Suspend User
                </Button>
                <Button variant="destructive" className="w-full">
                  Delete User
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardContent className="p-6">
              {auditLogs.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 text-sm border-b border-slate-100 pb-3"
                    >
                      <span className="text-slate-400 min-w-[120px]">
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

        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card>
            <CardContent className="p-6">
              {projects.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  This user hasn't created any projects yet.
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

        {/* Usage Tab */}
        <TabsContent value="usage">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-slate-500 py-8">
                Usage analytics will be displayed here once tracking is implemented.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}