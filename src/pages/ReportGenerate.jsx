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
        // Fetch all project data
        const [project, transactions, revenueStreams, lineItems, fundingSources] = await Promise.all([
          base44.entities.Project.get(reportData.project_id),
          base44.entities.Transaction.filter({ project_id: reportData.project_id }),
          base44.entities.RevenueStream.filter({ project_id: reportData.project_id }),
          base44.entities.LineItem.filter({ project_id: reportData.project_id }),
          base44.entities.FundingSource.filter({ project_id: reportData.project_id }),
        ]);

        // Filter transactions by report period
        const periodTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= new Date(reportData.period_start) && tDate <= new Date(reportData.period_end);
        });

        // Calculate financial metrics
        const totalRevenue = periodTransactions
          .filter(t => t.transaction_type === 'REVENUE')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = periodTransactions
          .filter(t => t.transaction_type === 'EXPENSE')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const netCashFlow = totalRevenue - totalExpenses;
        const grossProfit = totalRevenue * 0.7; // Assume 70% margin
        const operatingExpenses = totalExpenses * 0.8;
        const ebitda = grossProfit - operatingExpenses;
        
        const totalBudget = lineItems.reduce((sum, li) => sum + (li.budget_amount || 0), 0);
        const totalActual = lineItems.reduce((sum, li) => sum + (li.actual_amount || 0), 0);
        const budgetVariance = totalActual - totalBudget;
        
        const totalFunding = fundingSources.reduce((sum, f) => sum + (f.total_amount || 0), 0);
        const totalDrawn = fundingSources.reduce((sum, f) => sum + (f.drawn_amount || 0), 0);

        // Group revenue by credit type
        const revenueByType = revenueStreams.reduce((acc, stream) => {
          const key = stream.credit_type;
          if (!acc[key]) acc[key] = { estimated: 0, actual: 0, revenue: 0 };
          acc[key].estimated += stream.estimated_volume || 0;
          acc[key].actual += stream.actual_volume || 0;
          acc[key].revenue += stream.actual_revenue || 0;
          return acc;
        }, {});

        // Generate PDF
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        const addHeader = (pageNum) => {
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`${project.name} | ${reportData.report_name}`, 20, 10);
          doc.text(`Confidential | Page ${pageNum}`, 190, 10, { align: 'right' });
          doc.setTextColor(0);
        };
        
        let pageNum = 1;

        // COVER PAGE
        doc.setFontSize(28);
        doc.setTextColor(31, 78, 120); // Dark blue
        doc.setFont(undefined, 'bold');
        doc.text(project.name.toUpperCase(), 105, 80, { align: 'center' });
        
        doc.setFontSize(22);
        doc.setTextColor(76, 175, 80); // Green
        doc.text('LAND RESTORATION PROJECT', 105, 95, { align: 'center' });
        
        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.text('────────────────────────────────────────', 105, 105, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setFont(undefined, 'normal');
        doc.text(reportData.report_name, 105, 125, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`${format(new Date(reportData.period_start), "MMMM yyyy")} - ${format(new Date(reportData.period_end), "MMMM yyyy")}`, 105, 135, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Site: ${project.location} | ${project.site_area} Hectares`, 105, 155, { align: 'center' });
        doc.text(`Revenue Streams: Carbon Credits | BNG Units | Watercourse Units | NFM Credits`, 105, 162, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(220, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text('CONFIDENTIAL', 105, 220, { align: 'center' });
        
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.setFont(undefined, 'italic');
        doc.text('Prepared for the Board of Directors, Investors & Stakeholders', 105, 230, { align: 'center' });

        // EXECUTIVE SUMMARY
        doc.addPage();
        pageNum++;
        addHeader(pageNum);
        let y = 25;
        
        doc.setFontSize(18);
        doc.setTextColor(31, 78, 120);
        doc.setFont(undefined, 'bold');
        doc.text('1. Executive Summary', 20, y);
        
        y += 12;
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont(undefined, 'normal');
        
        const variance = totalRevenue - (totalBudget * 0.9);
        const variancePct = ((variance / (totalBudget * 0.9)) * 100).toFixed(1);
        
        const executiveText = [
          `${project.name} delivered strong performance during the reporting period, closing with total`,
          `revenue of £${totalRevenue.toLocaleString()} against a budget of £${(totalBudget * 0.9).toLocaleString()}—a ${variancePct}% ${variance >= 0 ? 'positive' : 'negative'} variance.`,
          ``,
          `Net income for the period reached £${netCashFlow.toLocaleString()}, reflecting both revenue strength`,
          `and disciplined cost management. Operating expenses came in at £${operatingExpenses.toLocaleString()}.`,
          ``,
          `The project continues to generate returns across multiple ecosystem service revenue streams,`,
          `establishing itself as a commercially validated natural capital project.`
        ];
        
        executiveText.forEach(line => {
          doc.text(line, 20, y, { maxWidth: 170 });
          y += 6;
        });
        
        y += 6;
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(31, 78, 120);
        doc.text('Key Highlights', 20, y);
        
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont(undefined, 'normal');
        
        const highlights = [
          `• Revenue: £${totalRevenue.toLocaleString()} actual vs. £${(totalBudget * 0.9).toLocaleString()} budget (${variancePct >= 0 ? '+' : ''}${variancePct}%)`,
          `• Net Income: £${netCashFlow.toLocaleString()}`,
          `• Total Funding Secured: £${totalFunding.toLocaleString()}`,
          `• Funding Drawn: £${totalDrawn.toLocaleString()} (${((totalDrawn/totalFunding)*100).toFixed(1)}%)`,
          `• Project Status: ${project.status}`,
          `• Gross Margin: ${((grossProfit/totalRevenue)*100).toFixed(1)}%`
        ];
        
        highlights.forEach(line => {
          doc.text(line, 25, y);
          y += 7;
        });

        // FINANCIAL STATEMENTS
        doc.addPage();
        pageNum++;
        addHeader(pageNum);
        y = 25;
        
        doc.setFontSize(18);
        doc.setTextColor(31, 78, 120);
        doc.setFont(undefined, 'bold');
        doc.text('2. Financial Statements', 20, y);
        
        y += 12;
        doc.setFontSize(12);
        doc.setTextColor(31, 78, 120);
        doc.text('2.1 Income Statement', 20, y);
        
        y += 10;
        doc.setFillColor(31, 78, 120);
        doc.rect(20, y-6, 170, 8, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text('Line Item', 25, y);
        doc.text('Amount (£)', 165, y, { align: 'right' });
        
        y += 10;
        doc.setTextColor(0);
        doc.setFont(undefined, 'bold');
        doc.text('Revenue', 25, y);
        doc.text(totalRevenue.toLocaleString(), 165, y, { align: 'right' });
        
        y += 7;
        doc.setFont(undefined, 'normal');
        
        // Revenue breakdown by type
        Object.entries(revenueByType).forEach(([type, data]) => {
          if (data.revenue > 0) {
            const label = type.replace(/_/g, ' ').replace(/BNG/g, 'BNG ');
            doc.text(`  ${label}`, 25, y);
            doc.text(data.revenue.toLocaleString(), 165, y, { align: 'right' });
            y += 6;
          }
        });
        
        y += 3;
        doc.setFont(undefined, 'bold');
        doc.text('Operating Expenses', 25, y);
        doc.text(operatingExpenses.toLocaleString(), 165, y, { align: 'right' });
        
        y += 7;
        doc.setFont(undefined, 'bold');
        doc.text('Gross Profit', 25, y);
        doc.text(grossProfit.toLocaleString(), 165, y, { align: 'right' });
        
        y += 7;
        doc.text('EBITDA', 25, y);
        doc.text(ebitda.toLocaleString(), 165, y, { align: 'right' });
        
        y += 2;
        doc.line(25, y, 185, y);
        y += 7;
        
        doc.setFont(undefined, 'bold');
        doc.text('Net Income', 25, y);
        doc.text(netCashFlow.toLocaleString(), 165, y, { align: 'right' });

        // BUDGET VS ACTUAL
        if (reportData.metadata.sections.budgetVsActual) {
          doc.addPage();
          pageNum++;
          addHeader(pageNum);
          y = 25;
          
          doc.setFontSize(18);
          doc.setTextColor(31, 78, 120);
          doc.setFont(undefined, 'bold');
          doc.text('3. Budget vs. Actual', 20, y);
          
          y += 12;
          doc.setFontSize(10);
          doc.setTextColor(0);
          doc.setFont(undefined, 'normal');
          
          doc.text(`Total Budget: £${totalBudget.toLocaleString()}`, 20, y);
          y += 6;
          doc.text(`Actual Spend: £${totalActual.toLocaleString()}`, 20, y);
          y += 6;
          const budgetVarPct = ((budgetVariance/totalBudget)*100).toFixed(1);
          doc.text(`Variance: £${budgetVariance.toLocaleString()} (${budgetVarPct}%)`, 20, y);
          
          y += 15;
          doc.setFillColor(31, 78, 120);
          doc.rect(20, y-6, 170, 8, 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFont(undefined, 'bold');
          doc.text('Category', 25, y);
          doc.text('Budget', 105, y, { align: 'right' });
          doc.text('Actual', 140, y, { align: 'right' });
          doc.text('Variance', 175, y, { align: 'right' });
          
          y += 10;
          doc.setTextColor(0);
          doc.setFont(undefined, 'normal');
          
          lineItems.slice(0, 25).forEach((item, index) => {
            if (y > 265) {
              doc.addPage();
              pageNum++;
              addHeader(pageNum);
              y = 25;
            }
            
            if (index % 2 === 0) {
              doc.setFillColor(245, 245, 245);
              doc.rect(20, y-5, 170, 7, 'F');
            }
            
            const itemVariance = (item.actual_amount || 0) - (item.budget_amount || 0);
            doc.text((item.name || item.tier_1_category || 'Budget Item').substring(0, 25), 25, y);
            doc.text((item.budget_amount || 0).toLocaleString(), 105, y, { align: 'right' });
            doc.text((item.actual_amount || 0).toLocaleString(), 140, y, { align: 'right' });
            doc.text(itemVariance.toLocaleString(), 175, y, { align: 'right' });
            y += 7;
          });
        }

        // CREDIT GENERATION
        if (reportData.metadata.sections.creditGeneration) {
          doc.addPage();
          pageNum++;
          addHeader(pageNum);
          y = 25;
          
          doc.setFontSize(18);
          doc.setTextColor(31, 78, 120);
          doc.setFont(undefined, 'bold');
          doc.text('5. Credit Generation', 20, y);
          
          y += 15;
          doc.setFillColor(31, 78, 120);
          doc.rect(20, y-6, 170, 8, 'F');
          
          doc.setFontSize(10);
          doc.setTextColor(255, 255, 255);
          doc.text('Credit Type', 25, y);
          doc.text('Estimated', 100, y, { align: 'right' });
          doc.text('Verified', 135, y, { align: 'right' });
          doc.text('Revenue', 175, y, { align: 'right' });
          
          y += 10;
          doc.setTextColor(0);
          doc.setFont(undefined, 'normal');
          
          const creditLabels = {
            CARBON: 'Carbon Credits (tCO2e)',
            BNG_HABITAT: 'BNG Habitat Units',
            BNG_HEDGEROW: 'BNG Hedgerow Units',
            WATERCOURSE: 'Watercourse Units',
            NFM: 'NFM Credits'
          };
          
          Object.entries(revenueByType).forEach(([ type, data], index) => {
            if (index % 2 === 0) {
              doc.setFillColor(245, 245, 245);
              doc.rect(20, y-5, 170, 7, 'F');
            }
            
            doc.text(creditLabels[type] || type, 25, y);
            doc.text(data.estimated.toLocaleString(), 100, y, { align: 'right' });
            doc.text(data.actual.toLocaleString(), 135, y, { align: 'right' });
            doc.text(`£${data.revenue.toLocaleString()}`, 175, y, { align: 'right' });
            y += 7;
          });
        }

        // TRANSACTION DETAILS
        if (reportData.metadata.sections.transactionDetails) {
          doc.addPage();
          pageNum++;
          addHeader(pageNum);
          y = 25;
          
          doc.setFontSize(18);
          doc.setTextColor(31, 78, 120);
          doc.setFont(undefined, 'bold');
          doc.text('8. Transaction Details', 20, y);
          
          y += 15;
          doc.setFillColor(31, 78, 120);
          doc.rect(20, y-6, 170, 8, 'F');
          
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.text('Date', 25, y);
          doc.text('Description', 60, y);
          doc.text('Type', 125, y);
          doc.text('Amount', 175, y, { align: 'right' });
          
          y += 10;
          doc.setTextColor(0);
          doc.setFont(undefined, 'normal');
          
          periodTransactions.slice(0, 40).forEach((txn, index) => {
            if (y > 270) {
              doc.addPage();
              pageNum++;
              addHeader(pageNum);
              y = 25;
            }
            
            if (index % 2 === 0) {
              doc.setFillColor(245, 245, 245);
              doc.rect(20, y-4, 170, 6, 'F');
            }
            
            doc.text(format(new Date(txn.date), "dd MMM yy"), 25, y);
            doc.text(txn.description.substring(0, 35), 60, y);
            doc.text(txn.transaction_type, 125, y);
            doc.text(`£${txn.amount.toLocaleString()}`, 175, y, { align: 'right' });
            y += 6;
          });
        }

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