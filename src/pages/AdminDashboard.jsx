import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import AdminLayout from "@/components/admin/AdminLayout";
import MetricCard from "@/components/admin/MetricCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Clock,
  DollarSign,
  FolderTree,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Activity,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import moment from "moment";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch organizations
  const { data: organizations = [] } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: () => base44.entities.Organization.list(),
  });

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  // Fetch audit logs
  const { data: auditLogs = [] } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 20),
  });

  // Extend trial mutation
  const extendTrialMutation = useMutation({
    mutationFn: async (orgId) => {
      const org = organizations.find((o) => o.id === orgId);
      const currentEnd = new Date(org.trial_end_date);
      const newEnd = new Date(currentEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      return base44.entities.Organization.update(orgId, {
        trial_end_date: newEnd.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
    queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
    queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
    setLastRefresh(new Date());
  };

  // Calculate metrics
  const totalOrgs = organizations.length;
  const activeTrials = organizations.filter((o) => o.account_status === "TRIAL").length;
  const trialsExpiringThisWeek = organizations.filter((o) => {
    if (o.account_status !== "TRIAL" || !o.trial_end_date) return false;
    const daysUntilExpiry = moment(o.trial_end_date).diff(moment(), "days");
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  }).length;

  const payingCustomers = organizations.filter((o) => o.account_status === "ACTIVE").length;
  const professionalTier = organizations.filter(
    (o) => o.account_status === "ACTIVE" && o.subscription_tier === "PROFESSIONAL"
  ).length;

  const totalProjects = projects.length;
  const projectsThisMonth = projects.filter((p) =>
    moment(p.created_date).isAfter(moment().startOf("month"))
  ).length;

  // Calculate MRR
  const starterCount = organizations.filter(
    (o) => o.account_status === "ACTIVE" && o.subscription_tier === "STARTER"
  ).length;
  const professionalCount = organizations.filter(
    (o) => o.account_status === "ACTIVE" && o.subscription_tier === "PROFESSIONAL"
  ).length;
  const mrr = starterCount * 49 + professionalCount * 149;

  // Trials expiring soon
  const expiringTrials = organizations
    .filter((o) => {
      if (o.account_status !== "TRIAL" || !o.trial_end_date) return false;
      const daysUntilExpiry = moment(o.trial_end_date).diff(moment(), "days");
      return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
    })
    .sort((a, b) => new Date(a.trial_end_date) - new Date(b.trial_end_date));

  return (
    <AdminLayout currentPageName="AdminDashboard">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Last updated: {moment(lastRefresh).format("MMM D, YYYY [at] h:mm A")}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard
          title="Total Organizations"
          value={totalOrgs}
          subtitle={`${activeTrials} active trials`}
          icon={Building2}
          color="blue"
        />
        <MetricCard
          title="Active Trials"
          value={activeTrials}
          subtitle={`${trialsExpiringThisWeek} expiring this week`}
          icon={Clock}
          color="yellow"
        />
        <MetricCard
          title="Paying Customers"
          value={payingCustomers}
          subtitle={`${professionalTier} on Professional`}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Total Projects"
          value={totalProjects}
          subtitle={`${projectsThisMonth} created this month`}
          icon={FolderTree}
          color="purple"
        />
        <MetricCard
          title="Total MRR"
          value={formatCurrency(mrr)}
          subtitle="Monthly recurring revenue"
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Trial Expiration Alerts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Trials Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expiringTrials.length === 0 ? (
            <p className="text-sm text-slate-500">No trials expiring in the next 7 days</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Organization
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Trial Ends
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Projects
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Last Activity
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expiringTrials.map((org) => {
                    const daysLeft = moment(org.trial_end_date).diff(moment(), "days");
                    const orgProjects = projects.filter((p) => p.organization_id === org.id);
                    
                    return (
                      <tr key={org.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link
                            to={createPageUrl("AdminOrganizationDetail") + `?id=${org.id}`}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            {org.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={daysLeft <= 3 ? "destructive" : "outline"}>
                            {daysLeft === 0
                              ? "Today"
                              : daysLeft === 1
                              ? "Tomorrow"
                              : `${daysLeft} days`}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {orgProjects.length}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {moment(org.updated_date).fromNow()}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => extendTrialMutation.mutate(org.id)}
                            disabled={extendTrialMutation.isPending}
                          >
                            Extend Trial
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={createPageUrl("AdminOrganizationDetail") + `?id=${org.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-600" />
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to={createPageUrl("AdminActivity")}>
              View All Activity
              <ExternalLink className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLogs.slice(0, 10).map((log) => {
              const org = organizations.find((o) => o.id === log.project_id);
              
              return (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <span className="text-slate-400 min-w-[80px]">
                    {moment(log.created_date).fromNow()}
                  </span>
                  <span className="text-slate-600">
                    {org && (
                      <>
                        <Link
                          to={createPageUrl("AdminOrganizationDetail") + `?id=${org.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {org.name}
                        </Link>
                        {" - "}
                      </>
                    )}
                    {log.action}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Health Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">API Response Time</p>
            <p className="text-2xl font-bold text-slate-900">45 ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Database Size</p>
            <p className="text-2xl font-bold text-slate-900">2.4 GB</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Error Rate</p>
            <p className="text-2xl font-bold text-slate-900">0.1%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Uptime</p>
            <p className="text-2xl font-bold text-slate-900">99.9%</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}