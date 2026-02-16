import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, TrendingUp, Calendar, Settings } from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import ReportExecutiveSummary from "@/components/reports/ReportExecutiveSummary";
import ReportFinancialStatements from "@/components/reports/ReportFinancialStatements";
import ReportBudgetVsActuals from "@/components/reports/ReportBudgetVsActuals";
import ReportForecastAnalysis from "@/components/reports/ReportForecastAnalysis";
import ReportKeyMetrics from "@/components/reports/ReportKeyMetrics";
import ReportChartsDashboard from "@/components/reports/ReportChartsDashboard";

export default function ReportBuilder() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");

  const currentYear = new Date().getFullYear();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [forecastHorizon, setForecastHorizon] = useState("YEARLY_30YR");
  const [reportPeriod, setReportPeriod] = useState("annual");
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Fetch project data
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }),
    select: (data) => data[0],
    enabled: !!projectId,
  });

  // Fetch all relevant data
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", projectId],
    queryFn: () => base44.entities.Transaction.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: lineItems = [] } = useQuery({
    queryKey: ["lineItems", projectId],
    queryFn: () => base44.entities.LineItem.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: budgetCategories = [] } = useQuery({
    queryKey: ["budgetCategories", projectId],
    queryFn: () => base44.entities.BudgetCategory.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: subItems = [] } = useQuery({
    queryKey: ["subItems", projectId],
    queryFn: () => base44.entities.SubItem.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: revenueStreams = [] } = useQuery({
    queryKey: ["revenueStreams", projectId],
    queryFn: () => base44.entities.RevenueStream.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: fundingSources = [] } = useQuery({
    queryKey: ["fundingSources", projectId],
    queryFn: () => base44.entities.FundingSource.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  // Fetch forecast scenarios
  const { data: forecastScenarios = [] } = useQuery({
    queryKey: ["forecastScenarios", projectId, forecastHorizon],
    queryFn: () => base44.entities.ForecastScenario.filter({
      project_id: projectId,
      scenario_type: forecastHorizon,
    }),
    enabled: !!projectId,
  });

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = new Set();
    transactions.forEach(tx => {
      if (tx.date) {
        const year = new Date(tx.date).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const handleExportPDF = async () => {
    // PDF export logic will be implemented
    console.log("Exporting to PDF...");
  };

  if (projectLoading) {
    return <LoadingState />;
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
            <p className="text-sm text-slate-500 mt-1">Financial Reporting & Analysis</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={() => navigate(createPageUrl(`ProjectDetail?id=${projectId}`))}>
              <FileText className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
          </div>
        </div>

        {/* Controls Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base">Report Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Year Selection */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">
                  Reporting Year
                </label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Period Selection */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">
                  Report Period
                </label>
                <Select value={reportPeriod} onValueChange={setReportPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Forecast Horizon */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">
                  Forecast Horizon
                </label>
                <Select value={forecastHorizon} onValueChange={setForecastHorizon}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="YEARLY_30YR">30-Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scenario Selection */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">
                  Forecast Scenario
                </label>
                <Select 
                  value={selectedScenario?.id || ""} 
                  onValueChange={(id) => setSelectedScenario(forecastScenarios.find(s => s.id === id))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {forecastScenarios.map(scenario => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.scenario_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="statements">Financial Statements</TabsTrigger>
          <TabsTrigger value="budget">Budget vs Actuals</TabsTrigger>
          <TabsTrigger value="forecast">Forecast Analysis</TabsTrigger>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
          <TabsTrigger value="charts">Charts & Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <ReportExecutiveSummary
            project={project}
            transactions={transactions}
            revenueStreams={revenueStreams}
            lineItems={lineItems}
            fundingSources={fundingSources}
            selectedYear={selectedYear}
            selectedScenario={selectedScenario}
          />
        </TabsContent>

        <TabsContent value="statements">
          <ReportFinancialStatements
            projectId={projectId}
            selectedYear={selectedYear}
            transactions={transactions}
            revenueStreams={revenueStreams}
            lineItems={lineItems}
            fundingSources={fundingSources}
          />
        </TabsContent>

        <TabsContent value="budget">
          <ReportBudgetVsActuals
            projectId={projectId}
            selectedYear={selectedYear}
            lineItems={lineItems}
            budgetCategories={budgetCategories}
            subItems={subItems}
            transactions={transactions}
          />
        </TabsContent>

        <TabsContent value="forecast">
          <ReportForecastAnalysis
            project={project}
            selectedScenario={selectedScenario}
            forecastHorizon={forecastHorizon}
            transactions={transactions}
            revenueStreams={revenueStreams}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <ReportKeyMetrics
            project={project}
            transactions={transactions}
            revenueStreams={revenueStreams}
            lineItems={lineItems}
            fundingSources={fundingSources}
            selectedYear={selectedYear}
          />
        </TabsContent>

        <TabsContent value="charts">
          <ReportChartsDashboard
            project={project}
            transactions={transactions}
            revenueStreams={revenueStreams}
            lineItems={lineItems}
            selectedYear={selectedYear}
            selectedScenario={selectedScenario}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}