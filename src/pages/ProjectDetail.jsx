import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectHeader from "../components/project/ProjectHeader";
import OverviewTab from "../components/project/OverviewTab";
import BudgetTab from "../components/project/BudgetTab";
import RevenueTab from "../components/project/RevenueTab";
import FundingTab from "../components/project/FundingTab";
import TransactionsTab from "../components/project/TransactionsTab";
import ConfirmDialog from "../components/shared/ConfirmDialog";
import LoadingState from "../components/shared/LoadingState";
import { toast } from "sonner";

export default function ProjectDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId,
  });

  const { data: lineItems = [], isLoading: loadingLI } = useQuery({
    queryKey: ["lineItems", projectId],
    queryFn: () => base44.entities.LineItem.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: revenueStreams = [], isLoading: loadingRS } = useQuery({
    queryKey: ["revenueStreams", projectId],
    queryFn: () => base44.entities.RevenueStream.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: fundingSources = [], isLoading: loadingFS } = useQuery({
    queryKey: ["fundingSources", projectId],
    queryFn: () => base44.entities.FundingSource.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: transactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ["transactions", projectId],
    queryFn: () => base44.entities.Transaction.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Delete all related entities first
      await Promise.all(transactions.map((t) => base44.entities.Transaction.delete(t.id)));
      await Promise.all(lineItems.map((li) => base44.entities.LineItem.delete(li.id)));
      await Promise.all(revenueStreams.map((rs) => base44.entities.RevenueStream.delete(rs.id)));
      await Promise.all(fundingSources.map((fs) => base44.entities.FundingSource.delete(fs.id)));
      await base44.entities.Project.delete(projectId);
    },
    onSuccess: () => {
      toast.success("Project deleted");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate(createPageUrl("Projects"));
    },
  });

  const isLoading = loadingProject || loadingLI || loadingRS || loadingFS || loadingTx;

  if (isLoading) return <LoadingState message="Loading project..." />;
  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={project}
        onEdit={() => navigate(createPageUrl(`ProjectEdit?id=${projectId}`))}
        onDelete={() => setShowDeleteDialog(true)}
        onFinancials={() => navigate(createPageUrl(`ProjectFinancials?id=${projectId}`))}
        onForecast={() => navigate(createPageUrl(`ProjectForecasting?id=${projectId}`))}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100/60">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="budget" className="text-xs sm:text-sm">Budget</TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs sm:text-sm">Revenue</TabsTrigger>
          <TabsTrigger value="funding" className="text-xs sm:text-sm">Funding</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab
            lineItems={lineItems}
            revenueStreams={revenueStreams}
            fundingSources={fundingSources}
            transactions={transactions}
          />
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <BudgetTab projectId={projectId} lineItems={lineItems} />
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <RevenueTab projectId={projectId} revenueStreams={revenueStreams} />
        </TabsContent>

        <TabsContent value="funding" className="mt-6">
          <FundingTab projectId={projectId} fundingSources={fundingSources} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <TransactionsTab
            projectId={projectId}
            transactions={transactions}
            lineItems={lineItems}
            revenueStreams={revenueStreams}
            fundingSources={fundingSources}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Project"
        description="This will permanently delete the project and all associated data. This cannot be undone."
        onConfirm={() => deleteMutation.mutate()}
        destructive
      />
    </div>
  );
}