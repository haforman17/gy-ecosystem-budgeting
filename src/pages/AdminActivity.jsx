import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import moment from "moment";

export default function AdminActivity() {
  const [orgFilter, setOrgFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: auditLogs = [], refetch } = useQuery({
    queryKey: ["admin-all-audit-logs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 100),
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: () => base44.entities.Organization.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => base44.entities.User.list(),
  });

  // Filter logs
  const filteredLogs = auditLogs.filter((log) => {
    const project = projects.find((p) => p.id === log.project_id);
    const matchesOrg =
      orgFilter === "all" || project?.organization_id === orgFilter;
    const matchesAction =
      actionFilter === "all" || log.action.toLowerCase().includes(actionFilter.toLowerCase());
    return matchesOrg && matchesAction;
  });

  // Calculate analytics
  const today = moment().startOf("day");
  const todayLogs = auditLogs.filter((log) =>
    moment(log.created_date).isAfter(today)
  );

  const orgActivity = {};
  todayLogs.forEach((log) => {
    const project = projects.find((p) => p.id === log.project_id);
    if (project?.organization_id) {
      orgActivity[project.organization_id] = (orgActivity[project.organization_id] || 0) + 1;
    }
  });
  const mostActiveOrg = Object.entries(orgActivity).sort((a, b) => b[1] - a[1])[0];

  const userActivity = {};
  todayLogs.forEach((log) => {
    if (log.user_id) {
      userActivity[log.user_id] = (userActivity[log.user_id] || 0) + 1;
    }
  });
  const mostActiveUser = Object.entries(userActivity).sort((a, b) => b[1] - a[1])[0];

  const actionCounts = {};
  todayLogs.forEach((log) => {
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
  });
  const mostCommonAction = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <AdminLayout currentPageName="AdminActivity">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Activity Log</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time feed of all actions across all organizations
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Most Active Organization
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mostActiveOrg ? (
              <>
                <p className="text-lg font-bold text-slate-900">
                  {organizations.find((o) => o.id === mostActiveOrg[0])?.name || "Unknown"}
                </p>
                <p className="text-sm text-slate-500">{mostActiveOrg[1]} actions today</p>
              </>
            ) : (
              <p className="text-sm text-slate-500">No activity yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Most Active User
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mostActiveUser ? (
              <>
                <p className="text-lg font-bold text-slate-900">
                  {users.find((u) => u.id === mostActiveUser[0])?.full_name || "Unknown"}
                </p>
                <p className="text-sm text-slate-500">{mostActiveUser[1]} actions today</p>
              </>
            ) : (
              <p className="text-sm text-slate-500">No activity yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Most Common Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mostCommonAction ? (
              <>
                <p className="text-lg font-bold text-slate-900">{mostCommonAction[0]}</p>
                <p className="text-sm text-slate-500">{mostCommonAction[1]} times today</p>
              </>
            ) : (
              <p className="text-sm text-slate-500">No activity yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-slate-900">{todayLogs.length}</p>
            <p className="text-sm text-slate-500">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOrgFilter("all");
                  setActionFilter("all");
                }}
              >
                Clear Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                    Timestamp
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                    Organization
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                    Action
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                    Entity
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const project = projects.find((p) => p.id === log.project_id);
                  const org = organizations.find((o) => o.id === project?.organization_id);
                  const user = users.find((u) => u.id === log.user_id);

                  return (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-600">
                        <div>{moment(log.created_date).format("MMM D, h:mm A")}</div>
                        <div className="text-xs text-slate-400">
                          {moment(log.created_date).fromNow()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {org ? (
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
                        {user ? (
                          <Link
                            to={createPageUrl("AdminUserDetail") + `?id=${user.id}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {user.full_name}
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">{log.action}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{log.entity_type}</td>
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