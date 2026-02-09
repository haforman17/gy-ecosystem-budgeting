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
import { Search, Download, MoreVertical, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import moment from "moment";

export default function AdminOrganizations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Fetch data
  const { data: organizations = [] } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: () => base44.entities.Organization.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  // Filter and sort
  let filteredOrgs = organizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || org.account_status === statusFilter;
    const matchesTier = tierFilter === "all" || org.subscription_tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  // Sort
  filteredOrgs = [...filteredOrgs].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "created":
        return new Date(b.created_date) - new Date(a.created_date);
      case "activity":
        return new Date(b.updated_date) - new Date(a.updated_date);
      case "projects":
        const aProjects = projects.filter((p) => p.organization_id === a.id).length;
        const bProjects = projects.filter((p) => p.organization_id === b.id).length;
        return bProjects - aProjects;
      default:
        return 0;
    }
  });

  const getStatusBadge = (status) => {
    const variants = {
      TRIAL: { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      ACTIVE: { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" },
      SUSPENDED: { variant: "destructive" },
      CANCELLED: { variant: "secondary" },
    };
    return variants[status] || { variant: "secondary" };
  };

  const getTrialColor = (trialEndDate) => {
    if (!trialEndDate) return "text-slate-400";
    const days = moment(trialEndDate).diff(moment(), "days");
    if (days <= 3) return "text-red-600 font-semibold";
    if (days <= 7) return "text-yellow-600 font-semibold";
    return "text-slate-600";
  };

  return (
    <AdminLayout currentPageName="AdminOrganizations">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Organizations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {filteredOrgs.length} of {organizations.length} organizations
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
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="TRIAL">Trial</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="FREE_TRIAL">Free Trial</SelectItem>
                <SelectItem value="STARTER">Starter</SelectItem>
                <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="created">Created (Newest)</SelectItem>
                <SelectItem value="activity">Last Activity</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setTierFilter("all");
                setSortBy("name");
              }}
            >
              Clear Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                    Organization
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Tier</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                    Trial Ends
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                    Projects
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                    Created
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
                {filteredOrgs.map((org) => {
                  const orgProjects = projects.filter((p) => p.organization_id === org.id);
                  const statusBadge = getStatusBadge(org.account_status);

                  return (
                    <tr
                      key={org.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          to={createPageUrl("AdminOrganizationDetail") + `?id=${org.id}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {org.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <Badge {...statusBadge}>{org.account_status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {org.subscription_tier?.replace(/_/g, " ")}
                      </td>
                      <td className={`py-3 px-4 text-sm ${getTrialColor(org.trial_end_date)}`}>
                        {org.account_status === "TRIAL" && org.trial_end_date
                          ? moment(org.trial_end_date).format("MMM D, YYYY")
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {orgProjects.length} / {org.max_projects || "∞"}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {moment(org.created_date).format("MMM D, YYYY")}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {moment(org.updated_date).fromNow()}
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
                              <Link to={createPageUrl("AdminOrganizationDetail") + `?id=${org.id}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Login As</DropdownMenuItem>
                            {org.account_status === "TRIAL" && (
                              <DropdownMenuItem>Extend Trial</DropdownMenuItem>
                            )}
                            <DropdownMenuItem>Suspend Account</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Delete Organization
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