import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  RefreshCw, 
  Trash2,
  FileSpreadsheet,
  BarChart3,
  Building2,
  TrendingUp,
  Users
} from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { format } from "date-fns";

export default function Reports() {
  const navigate = useNavigate();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => base44.entities.Report.list("-created_date", 100),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["reportTemplates"],
    queryFn: () => base44.entities.ReportTemplate.filter({ is_default: true }),
  });

  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const reportTypeColors = {
    LENDER_PACKAGE: "bg-blue-100 text-blue-800",
    GRANT_COMPLIANCE: "bg-green-100 text-green-800",
    INVESTOR_UPDATE: "bg-purple-100 text-purple-800",
    CUSTOM: "bg-slate-100 text-slate-800",
  };

  const statusColors = {
    GENERATING: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
  };

  const defaultTemplates = [
    {
      id: "lender",
      type: "LENDER_MONTHLY",
      name: "Lender Monthly Package",
      description: "Comprehensive monthly report for debt providers",
      icon: Building2,
      color: "text-blue-600",
      includes: [
        "Executive Summary",
        "Financial Statements",
        "Debt Covenant Certificate",
        "Credit Generation Update",
        "Use of Funds Analysis",
      ],
    },
    {
      id: "grant",
      type: "GRANT_QUARTERLY",
      name: "Grant Compliance Report",
      description: "Quarterly report for grant funders",
      icon: FileText,
      color: "text-green-600",
      includes: [
        "Grant Summary",
        "Spending by Eligible Category",
        "Project Progress Update",
        "Financial Statements",
        "Supporting Documentation",
      ],
    },
    {
      id: "investor",
      type: "INVESTOR_ANNUAL",
      name: "Investor Update",
      description: "Annual update for equity investors",
      icon: TrendingUp,
      color: "text-purple-600",
      includes: [
        "Letter from Project Manager",
        "Financial Performance",
        "Operational Update",
        "Revised Forecasts",
        "Risk Report",
      ],
    },
    {
      id: "custom",
      type: "CUSTOM",
      name: "Custom Financial Report",
      description: "Build your own custom report",
      icon: BarChart3,
      color: "text-slate-600",
      includes: [
        "Configurable sections",
        "Custom date ranges",
        "Multi-project consolidation",
        "Advanced analytics",
      ],
    },
  ];

  if (isLoading) {
    return <LoadingState message="Loading reports..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Report Library</h1>
          <p className="text-sm text-slate-500 mt-1">Generate and manage professional reports for stakeholders</p>
        </div>
        <Button onClick={() => navigate(createPageUrl("ReportGenerate"))}>
          <Plus className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Reports Yet</h3>
                <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
                  Generate your first report using one of our professional templates
                </p>
                <Button onClick={() => navigate(createPageUrl("ReportGenerate"))}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Report Name</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.report_name}</TableCell>
                        <TableCell>{getProjectName(report.project_id)}</TableCell>
                        <TableCell>
                          <Badge className={reportTypeColors[report.report_type]}>
                            {report.report_type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {format(new Date(report.period_start), "MMM d")} -{" "}
                          {format(new Date(report.period_end), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {format(new Date(report.created_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{report.format}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatFileSize(report.file_size)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[report.status]}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {report.status === "COMPLETED" && report.file_url && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => window.open(report.file_url, "_blank")}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = report.file_url;
                                    link.download = `${report.report_name}.${report.format.toLowerCase()}`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {defaultTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-lg bg-slate-50 flex items-center justify-center ${template.color}`}>
                        <template.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">{template.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">What's included:</p>
                      <ul className="space-y-1.5">
                        {template.includes.map((item, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => navigate(createPageUrl(`ReportGenerate?template=${template.type}`))}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}