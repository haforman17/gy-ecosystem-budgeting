import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import ProjectHeader from "../components/project/ProjectHeader";
import OverviewTab from "../components/project/OverviewTab";
import BudgetBuilderTab from "../components/project/BudgetBuilderTab";
import BudgetTab from "../components/project/BudgetTab";
import RevenueTab from "../components/project/RevenueTab";
import FundingTab from "../components/project/FundingTab";
import TransactionsTab from "../components/project/TransactionsTab";
import LoadingState from "../components/shared/LoadingState";
import { useProjectAccess } from "../components/shared/useProjectAccess";

export default function ProjectDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");
  const [activeTab, setActiveTab] = useState("overview");
  const [workingYear, setWorkingYear] = useState(new Date().getFullYear().toString());
  const [isYearChanging, setIsYearChanging] = useState(false);

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId,
  });

  const { data: lineItems = [], isLoading: loadingLI } = useQuery({
    queryKey: ["lineItems", projectId, workingYear],
    queryFn: () => base44.entities.LineItem.filter({ project_id: projectId, year: workingYear }),
    enabled: !!projectId,
  });

  const { data: revenueStreams = [], isLoading: loadingRS } = useQuery({
    queryKey: ["revenueStreams", projectId, workingYear],
    queryFn: () => base44.entities.RevenueStream.filter({ project_id: projectId, vintage: workingYear }),
    enabled: !!projectId,
  });

  const { data: fundingSources = [], isLoading: loadingFS } = useQuery({
    queryKey: ["fundingSources", projectId],
    queryFn: () => base44.entities.FundingSource.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: transactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ["transactions", projectId, workingYear],
    queryFn: async () => {
      const all = await base44.entities.Transaction.filter({ project_id: projectId });
      // Filter by working year: use the `year` field if set, otherwise derive from `date`
      return all.filter((t) => {
        const txYear = t.year || (t.date ? new Date(t.date).getFullYear().toString() : null);
        return txYear === workingYear;
      });
    },
    enabled: !!projectId,
  });

  const handleYearChange = (newYear) => {
    setIsYearChanging(true);
    setWorkingYear(newYear);
    setTimeout(() => setIsYearChanging(false), 500);
  };

  const access = useProjectAccess(project, currentUser);

  const isLoading = loadingProject || loadingLI || loadingRS || loadingFS || loadingTx;

  if (isLoading) return <LoadingState message="Loading project..." />;

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Project not found</p>
      </div>
    );
  }

  // Enforce access control — 403 equivalent in frontend
  if (currentUser && !access.canAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied (403)</h2>
        <p className="text-slate-500 text-sm max-w-xs">You do not have permission to view this project. Contact the project owner to request access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={project}
        onEdit={access.canEdit ? () => navigate(createPageUrl(`ProjectEdit?id=${projectId}`)) : undefined}
        onFinancials={() => navigate(createPageUrl(`ProjectFinancials?id=${projectId}`))}
        onForecast={() => navigate(createPageUrl(`ProjectForecasting?id=${projectId}`))}
      />

      {/* Year Selector */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <div>
              <label className="text-sm font-semibold text-slate-700">Working Year</label>
              <p className="text-xs text-slate-500 mt-0.5">Select year to view and edit data</p>
            </div>
          </div>
          <Select value={workingYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-32 bg-emerald-50 border-emerald-200 font-semibold text-emerald-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isYearChanging && (
          <div className="mt-3 text-xs text-emerald-600 font-medium animate-pulse">
            Loading {workingYear} data...
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100/60">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="budgetBuilder" className="text-xs sm:text-sm">Budget Builder</TabsTrigger>
          <TabsTrigger value="budget" className="text-xs sm:text-sm">Budget</TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs sm:text-sm">Revenue</TabsTrigger>
          <TabsTrigger value="funding" className="text-xs sm:text-sm">Funding</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab
            projectId={projectId}
            lineItems={lineItems}
            revenueStreams={revenueStreams}
            fundingSources={fundingSources}
            transactions={transactions}
            workingYear={workingYear}
          />
        </TabsContent>

        <TabsContent value="budgetBuilder" className="mt-6">
          <BudgetBuilderTab projectId={projectId} workingYear={workingYear} />
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <BudgetTab projectId={projectId} lineItems={lineItems} workingYear={workingYear} />
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <RevenueTab projectId={projectId} revenueStreams={revenueStreams} transactions={transactions} workingYear={workingYear} />
        </TabsContent>

        <TabsContent value="funding" className="mt-6">
          <FundingTab projectId={projectId} fundingSources={fundingSources} workingYear={workingYear} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <TransactionsTab
            projectId={projectId}
            transactions={transactions}
            lineItems={lineItems}
            revenueStreams={revenueStreams}
            fundingSources={fundingSources}
            workingYear={workingYear}
          />
        </TabsContent>
      </Tabs>

    </div>
  );
}