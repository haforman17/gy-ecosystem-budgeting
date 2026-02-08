import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DashboardMetrics from "../components/dashboard/DashboardMetrics";
import ProjectsTable from "../components/dashboard/ProjectsTable";
import EmptyState from "../components/shared/EmptyState";
import LoadingState from "../components/shared/LoadingState";
import { FolderTree } from "lucide-react";

export default function Dashboard() {
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date"),
  });

  const { data: lineItems = [], isLoading: loadingLineItems } = useQuery({
    queryKey: ["lineItems"],
    queryFn: () => base44.entities.LineItem.list(),
  });

  const { data: revenueStreams = [], isLoading: loadingRevenue } = useQuery({
    queryKey: ["revenueStreams"],
    queryFn: () => base44.entities.RevenueStream.list(),
  });

  const { data: fundingSources = [], isLoading: loadingFunding } = useQuery({
    queryKey: ["fundingSources"],
    queryFn: () => base44.entities.FundingSource.list(),
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => base44.entities.Transaction.list(),
  });

  const isLoading = loadingProjects || loadingLineItems || loadingRevenue || loadingFunding || loadingTransactions;

  if (isLoading) return <LoadingState message="Loading dashboard..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Nature-Based Services Budget Overview</p>
        </div>
        <Link to={createPageUrl("ProjectNew")}>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Metrics */}
      <DashboardMetrics
        projects={projects}
        lineItems={lineItems}
        revenueStreams={revenueStreams}
        fundingSources={fundingSources}
        transactions={transactions}
      />

      {/* Projects Table */}
      {projects.length > 0 ? (
        <ProjectsTable projects={projects} lineItems={lineItems} transactions={transactions} />
      ) : (
        <EmptyState
          icon={FolderTree}
          title="No projects yet"
          description="Create your first nature-based services project to start tracking budgets, revenue streams, and funding sources."
          actionLabel="Create Project"
          onAction={() => window.location.href = createPageUrl("ProjectNew")}
        />
      )}
    </div>
  );
}