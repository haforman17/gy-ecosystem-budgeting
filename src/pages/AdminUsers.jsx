import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Download, MoreVertical, Copy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import moment from "moment";

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showSuperAdminsOnly, setShowSuperAdminsOnly] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: () => base44.entities.Organization.list(),
  });

  // Filter users
  let filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg = orgFilter === "all" || user.organization_id === orgFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesSuperAdmin = !showSuperAdminsOnly || user.is_super_admin;
    return matchesSearch && matchesOrg && matchesRole && matchesSuperAdmin;
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: { className: "bg-blue-100 text-blue-700" },
      user: { className: "bg-gray-100 text-gray-700" },
    };
    return variants[role] || variants.user;
  };

  return (
    <AdminLayout currentPageName="AdminUsers">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {filteredUsers.length} users across {organizations.length} organizations
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={orgFilter} onValueChange={setOrgFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="superAdminsOnly"
                checked={showSuperAdminsOnly}
                onChange={(e) => setShowSuperAdminsOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="superAdminsOnly" className="text-sm text-slate-600">
                Super Admins Only
              </label>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setOrgFilter("all");
                setRoleFilter("all");
                setShowSuperAdminsOnly(false);
              }}
            >
              Clear Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Users
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                    Organization
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                    Last Login
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const org = organizations.find((o) => o.id === user.organization_id);

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          to={createPageUrl("AdminUserDetail") + `?id=${user.id}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {user.full_name}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">{user.email}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(user.email)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {user.is_super_admin ? (
                          <Badge className="bg-purple-100 text-purple-700">Super Admin</Badge>
                        ) : org ? (
                          <Link
                            to={createPageUrl("AdminOrganizationDetail") + `?id=${org.id}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {org.name}
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge {...getRoleBadge(user.role)}>{user.role}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {user.last_login_at ? moment(user.last_login_at).fromNow() : "Never"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={createPageUrl("AdminUserDetail") + `?id=${user.id}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => alert('Login As feature coming soon')}>
                              Login As
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => alert('Reset Password feature coming soon')}>
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => alert('Super Admin toggle feature coming soon')}>
                              {user.is_super_admin ? "Remove Super Admin" : "Make Super Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onSelect={() => {
                              if (confirm(`Are you sure you want to delete ${user.full_name}?`)) {
                                alert('Delete feature coming soon');
                              }
                            }}>
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}