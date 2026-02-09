import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, TrendingUp, PieChart } from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";

// Import yearly forecast components
import YearlyForecastTab from "@/components/forecast/YearlyForecastTab";
import QuarterlyForecastTab from "@/components/forecast/QuarterlyForecastTab";
import MonthlyForecastTab from "@/components/forecast/MonthlyForecastTab";

export default function ProjectForecasting() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");
  const [activeTab, setActiveTab] = useState("yearly");

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }),
    select: (data) => data[0],
    enabled: !!projectId,
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          <p className="text-sm text-slate-500 mt-1">Forecasting & Analysis</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl(`ProjectDetail?id=${projectId}`))}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100/60">
          <TabsTrigger value="yearly" className="text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Yearly (30-Year)
          </TabsTrigger>
          <TabsTrigger value="quarterly" className="text-xs sm:text-sm">
            <PieChart className="h-4 w-4 mr-2" />
            Quarterly
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs sm:text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            Monthly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="yearly">
          <YearlyForecastTab projectId={projectId} project={project} />
        </TabsContent>

        <TabsContent value="quarterly">
          <QuarterlyForecastTab projectId={projectId} project={project} />
        </TabsContent>

        <TabsContent value="monthly">
          <MonthlyForecastTab projectId={projectId} project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}