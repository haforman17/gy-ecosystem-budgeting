import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { Download, Search, ChevronDown, ChevronRight, FolderTree } from "lucide-react";
import * as XLSX from "xlsx";
import moment from "moment";

export default function AdminProjectData() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedProject, setExpandedProject] = useState(null);

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["admin-all-projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: lineItems = [] } = useQuery({
    queryKey: ["admin-all-lineItems"],
    queryFn: () => base44.entities.LineItem.list(),
  });

  const { data: revenueStreams = [] } = useQuery({
    queryKey: ["admin-all-revenueStreams"],
    queryFn: () => base44.entities.RevenueStream.list(),
  });

  const { data: fundingSources = [] } = useQuery({
    queryKey: ["admin-all-fundingSources"],
    queryFn: () => base44.entities.FundingSource.list(),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["admin-all-transactions"],
    queryFn: () => base44.entities.Transaction.list(),
  });

  const { data: budgetCategories = [] } = useQuery({
    queryKey: ["admin-all-budgetCategories"],
    queryFn: () => base44.entities.BudgetCategory.list(),
  });

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProjectStats = (projectId) => ({
    lineItems: lineItems.filter((li) => li.project_id === projectId).length,
    revenueStreams: revenueStreams.filter((rs) => rs.project_id === projectId).length,
    fundingSources: fundingSources.filter((fs) => fs.project_id === projectId).length,
    transactions: transactions.filter((t) => t.project_id === projectId).length,
    totalBudget: lineItems
      .filter((li) => li.project_id === projectId)
      .reduce((sum, li) => sum + (li.budget_amount || 0), 0),
    totalRevenue: revenueStreams
      .filter((rs) => rs.project_id === projectId)
      .reduce((sum, rs) => sum + ((rs.estimated_volume || 0) * (rs.estimated_price_per_unit || 0)), 0),
    totalFunding: fundingSources
      .filter((fs) => fs.project_id === projectId)
      .reduce((sum, fs) => sum + (fs.total_amount || 0), 0),
    totalExpenses: transactions
      .filter((t) => t.project_id === projectId && t.transaction_type === "EXPENSE")
      .reduce((sum, t) => sum + (t.amount || 0), 0),
  });

  const downloadProjectData = (project) => {
    const wb = XLSX.utils.book_new();

    // Project info sheet
    const projectSheet = XLSX.utils.json_to_sheet([{
      Name: project.name,
      Type: project.project_type,
      Location: project.location,
      "Site Area (ha)": project.site_area,
      Status: project.status,
      "Start Date": project.start_date,
      "End Date": project.end_date || "",
      Description: project.description || "",
    }]);
    XLSX.utils.book_append_sheet(wb, projectSheet, "Project Info");

    // Budget categories
    const cats = budgetCategories.filter((c) => c.project_id === project.id);
    if (cats.length > 0) {
      const catSheet = XLSX.utils.json_to_sheet(cats.map((c) => ({
        Name: c.name, Tier1: c.tier_1_category, Tier2: c.tier_2_category || "",
        CostType: c.cost_type, Budget: c.budget_amount, Year: c.year || "", Month: c.month || "",
      })));
      XLSX.utils.book_append_sheet(wb, catSheet, "Budget Categories");
    }

    // Line items
    const lis = lineItems.filter((li) => li.project_id === project.id);
    if (lis.length > 0) {
      const liSheet = XLSX.utils.json_to_sheet(lis.map((li) => ({
        Name: li.name, Tier1: li.tier_1_category, Tier2: li.tier_2_category || "",
        CostType: li.cost_type, Budget: li.budget_amount, Year: li.year || "", Month: li.month || "",
        Description: li.description || "",
      })));
      XLSX.utils.book_append_sheet(wb, liSheet, "Line Items");
    }

    // Revenue streams
    const rs = revenueStreams.filter((r) => r.project_id === project.id);
    if (rs.length > 0) {
      const rsSheet = XLSX.utils.json_to_sheet(rs.map((r) => ({
        CreditType: r.credit_type, Description: r.description, Vintage: r.vintage || "",
        EstimatedVolume: r.estimated_volume, EstimatedPricePerUnit: r.estimated_price_per_unit,
        EstimatedRevenue: (r.estimated_volume || 0) * (r.estimated_price_per_unit || 0),
        ActualVolume: r.actual_volume || 0, ActualRevenue: r.actual_revenue || 0,
        Status: r.verification_status,
      })));
      XLSX.utils.book_append_sheet(wb, rsSheet, "Revenue Streams");
    }

    // Funding sources
    const fs = fundingSources.filter((f) => f.project_id === project.id);
    if (fs.length > 0) {
      const fsSheet = XLSX.utils.json_to_sheet(fs.map((f) => ({
        FunderName: f.funder_name, FundingType: f.funding_type, TotalAmount: f.total_amount,
        DrawnAmount: f.drawn_amount || 0, Status: f.status, StartDate: f.start_date, EndDate: f.end_date || "",
      })));
      XLSX.utils.book_append_sheet(wb, fsSheet, "Funding Sources");
    }

    // Transactions
    const txs = transactions.filter((t) => t.project_id === project.id);
    if (txs.length > 0) {
      const txSheet = XLSX.utils.json_to_sheet(txs.map((t) => ({
        Date: t.date, Type: t.transaction_type, Amount: t.amount,
        Description: t.description, Reference: t.reference || "",
        Tier1: t.tier_1_category || "", Tier2: t.tier_2_category || "", Year: t.year || "",
      })));
      XLSX.utils.book_append_sheet(wb, txSheet, "Transactions");
    }

    XLSX.writeFile(wb, `${project.name.replace(/\s+/g, "_")}_data_${moment().format("YYYY-MM-DD")}.xlsx`);
  };

  const downloadAll = () => {
    const wb = XLSX.utils.book_new();

    const projectRows = filteredProjects.map((p) => {
      const stats = getProjectStats(p.id);
      return {
        Name: p.name, Type: p.project_type, Location: p.location, "Site Area (ha)": p.site_area,
        Status: p.status, "Start Date": p.start_date, "End Date": p.end_date || "",
        "Total Budget": stats.totalBudget, "Total Expenses": stats.totalExpenses,
        "Est. Revenue": stats.totalRevenue, "Total Funding": stats.totalFunding,
        "Line Items": stats.lineItems, "Revenue Streams": stats.revenueStreams,
        "Funding Sources": stats.fundingSources, "Transactions": stats.transactions,
      };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(projectRows), "Projects");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(transactions), "All Transactions");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(lineItems), "All Line Items");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(revenueStreams), "All Revenue Streams");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fundingSources), "All Funding Sources");

    XLSX.writeFile(wb, `all_project_data_${moment().format("YYYY-MM-DD")}.xlsx`);
  };

  const statusColors = {
    PLANNING: "bg-slate-100 text-slate-700",
    ACTIVE: "bg-emerald-100 text-emerald-700",
    MAINTENANCE: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-purple-100 text-purple-700",
  };

  return (
    <AdminLayout currentPageName="AdminProjectData">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Data</h1>
          <p className="text-sm text-slate-500 mt-1">{filteredProjects.length} projects — view and download all project data</p>
        </div>
        <Button onClick={downloadAll} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Download All (XLSX)
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PLANNING">Planning</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project List */}
      {loadingProjects ? (
        <div className="text-center py-12 text-slate-500">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No projects found</div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id);
            const isExpanded = expandedProject === project.id;

            return (
              <Card key={project.id} className="border border-slate-200">
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <FolderTree className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{project.name}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[project.status] || "bg-slate-100 text-slate-600"}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{project.location} · {project.project_type?.replace(/_/g, " ")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex gap-6 text-sm text-slate-600">
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{formatCurrency(stats.totalBudget)}</p>
                        <p className="text-xs text-slate-400">Budget</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{formatCurrency(stats.totalExpenses)}</p>
                        <p className="text-xs text-slate-400">Spent</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-700">{formatCurrency(stats.totalRevenue)}</p>
                        <p className="text-xs text-slate-400">Est. Revenue</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); downloadProjectData(project); }}
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Download
                      </Button>
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                      {[
                        { label: "Line Items", value: stats.lineItems },
                        { label: "Revenue Streams", value: stats.revenueStreams },
                        { label: "Funding Sources", value: stats.fundingSources },
                        { label: "Transactions", value: stats.transactions },
                      ].map((s) => (
                        <div key={s.label} className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                          <p className="text-xl font-bold text-slate-900">{s.value}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Recent Transactions Preview */}
                    {transactions.filter((t) => t.project_id === project.id).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recent Transactions</p>
                        <div className="space-y-1.5">
                          {transactions
                            .filter((t) => t.project_id === project.id)
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 5)
                            .map((tx) => (
                              <div key={tx.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-slate-100 text-sm">
                                <span className="text-slate-700">{tx.description}</span>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="text-xs">{tx.transaction_type}</Badge>
                                  <span className={`font-semibold ${tx.transaction_type === "REVENUE" || tx.transaction_type === "FUNDING_DRAWDOWN" ? "text-emerald-600" : "text-red-600"}`}>
                                    {formatCurrency(tx.amount)}
                                  </span>
                                  <span className="text-slate-400 text-xs">{tx.date ? moment(tx.date).format("DD MMM YYYY") : "—"}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}