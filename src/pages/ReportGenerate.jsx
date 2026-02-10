import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  TrendingUp,
  BarChart3,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { format, subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";

export default function ReportGenerate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedTemplate = urlParams.get("template");

  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    template: preselectedTemplate || "",
    reportName: "",
    projectId: "",
    periodStart: format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd"),
    periodEnd: format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd"),
    sections: {
      executiveSummary: true,
      financialStatements: true,
      budgetVsActual: true,
      forecastUpdate: true,
      creditGeneration: true,
      complianceStatus: true,
      keyMetrics: true,
      transactionDetails: false,
      assumptions: true,
    },
    includeComparison: true,
    includeBudget: true,
    format: "PDF",
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportData) => {
      const report = await base44.entities.Report.create({
        ...reportData,
        status: "GENERATING",
        generated_by: user?.id,
      });
      
      try {
        // Generate actual PDF report
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        // Add report content
        doc.setFontSize(20);
        doc.text(reportData.report_name, 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Report Type: ${reportData.report_type}`, 20, 35);
        doc.text(`Period: ${format(new Date(reportData.period_start), "MMM d, yyyy")} - ${format(new Date(reportData.period_end), "MMM d, yyyy")}`, 20, 45);
        doc.text(`Generated: ${format(new Date(), "MMM d, yyyy HH:mm")}`, 20, 55);
        
        doc.setFontSize(14);
        doc.text('Report Sections:', 20, 70);
        
        let y = 80;
        Object.entries(reportData.metadata.sections).forEach(([key, included]) => {
          if (included) {
            doc.setFontSize(10);
            doc.text(`• ${key.replace(/([A-Z])/g, ' $1').trim()}`, 30, y);
            y += 10;
          }
        });
        
        // Convert to blob and upload
        const pdfBlob = doc.output('blob');
        const file = new File([pdfBlob], `${reportData.report_name}.pdf`, { type: 'application/pdf' });
        
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        // Update to completed
        await base44.entities.Report.update(report.id, {
          status: "COMPLETED",
          file_url: file_url,
          file_size: pdfBlob.size,
        });
        
        return report;
      } catch (error) {
        await base44.entities.Report.update(report.id, {
          status: "FAILED",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report generated successfully");
      navigate(createPageUrl("Reports"));
    },
    onError: () => {
      toast.error("Failed to generate report");
    },
  });

  const templates = [
    {
      value: "LENDER_MONTHLY",
      label: "Lender Monthly Package",
      icon: Building2,
      description: "Comprehensive monthly report for debt providers",
    },
    {
      value: "GRANT_QUARTERLY",
      label: "Grant Compliance Report",
      icon: FileText,
      description: "Quarterly report for grant funders",
    },
    {
      value: "INVESTOR_ANNUAL",
      label: "Investor Update",
      icon: TrendingUp,
      description: "Annual update for equity investors",
    },
    {
      value: "CUSTOM",
      label: "Custom Financial Report",
      icon: BarChart3,
      description: "Build your own custom report",
    },
  ];

  const handleNext = () => {
    if (step === 1 && !config.template) {
      toast.error("Please select a report template");
      return;
    }
    if (step === 2) {
      if (!config.reportName || !config.projectId) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleGenerate = () => {
    const project = projects.find((p) => p.id === config.projectId);
    const reportData = {
      project_id: config.projectId,
      report_type: config.template,
      report_name: config.reportName,
      description: `Generated report for ${project?.name}`,
      period_start: config.periodStart,
      period_end: config.periodEnd,
      format: config.format,
      metadata: {
        sections: config.sections,
        includeComparison: config.includeComparison,
        includeBudget: config.includeBudget,
      },
    };

    generateReportMutation.mutate(reportData);
  };

  const setDatePreset = (preset) => {
    const now = new Date();
    let start, end;

    switch (preset) {
      case "thisMonth":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "lastMonth":
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      case "thisQuarter":
        start = startOfQuarter(now);
        end = endOfQuarter(now);
        break;
      case "ytd":
        start = startOfYear(now);
        end = now;
        break;
      case "lastYear":
        start = startOfYear(subMonths(now, 12));
        end = endOfYear(subMonths(now, 12));
        break;
      default:
        return;
    }

    setConfig({
      ...config,
      periodStart: format(start, "yyyy-MM-dd"),
      periodEnd: format(end, "yyyy-MM-dd"),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Reports"))}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Generate Report</h1>
          <p className="text-sm text-slate-500 mt-1">Step {step} of 3</p>
        </div>
      </div>

      {/* Progress */}
      <Progress value={(step / 3) * 100} className="h-2" />

      {/* Step 1: Select Template */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Report Template</CardTitle>
            <CardDescription>Choose the type of report you want to generate</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={config.template} onValueChange={(value) => setConfig({ ...config, template: value })}>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={template.value} id={template.value} />
                    <Label htmlFor={template.value} className="flex items-center gap-3 flex-1 cursor-pointer">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <template.icon className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{template.label}</p>
                        <p className="text-sm text-slate-500">{template.description}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex justify-end mt-6">
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Configure Report */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Report</CardTitle>
            <CardDescription>Set up your report parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                value={config.reportName}
                onChange={(e) => setConfig({ ...config, reportName: e.target.value })}
                placeholder="e.g., Monthly Lender Report - January 2026"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Select Project</Label>
              <Select value={config.projectId} onValueChange={(value) => setConfig({ ...config, projectId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Report Period</Label>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setDatePreset("lastMonth")}>
                  Last Month
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDatePreset("thisQuarter")}>
                  This Quarter
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDatePreset("ytd")}>
                  Year to Date
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDatePreset("lastYear")}>
                  Last Year
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodStart">Start Date</Label>
                  <Input
                    id="periodStart"
                    type="date"
                    value={config.periodStart}
                    onChange={(e) => setConfig({ ...config, periodStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodEnd">End Date</Label>
                  <Input
                    id="periodEnd"
                    type="date"
                    value={config.periodEnd}
                    onChange={(e) => setConfig({ ...config, periodEnd: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Sections to Include</Label>
              <div className="space-y-2">
                {Object.entries({
                  executiveSummary: "Executive Summary",
                  financialStatements: "Financial Statements",
                  budgetVsActual: "Budget vs Actual Analysis",
                  forecastUpdate: "Forecast Update",
                  creditGeneration: "Credit Generation Summary",
                  complianceStatus: "Compliance Status",
                  keyMetrics: "Key Metrics Dashboard",
                  transactionDetails: "Transaction Details",
                  assumptions: "Assumptions & Notes",
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={config.sections[key]}
                      onCheckedChange={(checked) =>
                        setConfig({
                          ...config,
                          sections: { ...config.sections, [key]: checked },
                        })
                      }
                    />
                    <Label htmlFor={key} className="cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Report Format</Label>
              <RadioGroup value={config.format} onValueChange={(value) => setConfig({ ...config, format: value })}>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PDF" id="pdf" />
                    <Label htmlFor="pdf" className="cursor-pointer">
                      PDF
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="EXCEL" id="excel" />
                    <Label htmlFor="excel" className="cursor-pointer">
                      Excel
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BOTH" id="both" />
                    <Label htmlFor="both" className="cursor-pointer">
                      Both
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Generate */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Generate</CardTitle>
            <CardDescription>Review your selections before generating the report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-500">Report Name</p>
                <p className="text-base font-semibold text-slate-900">{config.reportName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Project</p>
                <p className="text-base text-slate-900">
                  {projects.find((p) => p.id === config.projectId)?.name || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Template</p>
                <p className="text-base text-slate-900">
                  {templates.find((t) => t.value === config.template)?.label}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Period</p>
                <p className="text-base text-slate-900">
                  {format(new Date(config.periodStart), "MMM d, yyyy")} -{" "}
                  {format(new Date(config.periodEnd), "MMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Format</p>
                <p className="text-base text-slate-900">{config.format}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">Included Sections</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(config.sections)
                    .filter(([_, included]) => included)
                    .map(([key]) => (
                      <span key={key} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Estimated generation time:</strong> 30-60 seconds
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack} disabled={generateReportMutation.isPending}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleGenerate} disabled={generateReportMutation.isPending}>
                {generateReportMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}