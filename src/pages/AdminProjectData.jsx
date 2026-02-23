import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { Download, User, FolderTree, Calendar, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import moment from "moment";

// ── helpers ──────────────────────────────────────────────────────────────────
function downloadCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

function downloadXLSX(rows, filename) {
  if (!rows.length) return;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Data");
  XLSX.writeFile(wb, filename);
}

function DataTable({ columns, rows, title, csvFilename, xlsxFilename }) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold text-slate-800">{title}</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => downloadCSV(rows, csvFilename)} disabled={!rows.length}>
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Download CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => downloadXLSX(rows, xlsxFilename)} disabled={!rows.length}>
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
              Download Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {rows.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">No data for selected filters</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-y border-slate-200">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-2.5 text-slate-700 whitespace-nowrap">
                        {row[col.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── main page ────────────────────────────────────────────────────────────────
export default function AdminProjectData() {
  const [selectedUserId, setSelectedUserId] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  // fetch everything
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["admin-all-projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: lineItems = [] } = useQuery({
    queryKey: ["admin-all-lineItems"],
    queryFn: () => base44.entities.LineItem.list(),
  });

  const { data: subItems = [] } = useQuery({
    queryKey: ["admin-all-subItems"],
    queryFn: () => base44.entities.SubItem.list(),
  });

  const { data: budgetCategories = [] } = useQuery({
    queryKey: ["admin-all-budgetCategories"],
    queryFn: () => base44.entities.BudgetCategory.list(),
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

  // ── derived ──────────────────────────────────────────────────────────────
  // projects belonging to selected user
  const userProjects = useMemo(() => {
    if (selectedUserId === "all") return projects;
    return projects.filter((p) => p.created_by === users.find((u) => u.id === selectedUserId)?.email || p.owner_id === selectedUserId);
  }, [selectedUserId, projects, users]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // available years from budget items + revenue streams for selected project
  const availableYears = useMemo(() => {
    if (!selectedProjectId || selectedProjectId === "all") return [];
    const years = new Set();
    [...lineItems, ...budgetCategories, ...subItems]
      .filter((i) => i.project_id === selectedProjectId && i.year)
      .forEach((i) => years.add(i.year));
    revenueStreams.filter((r) => r.project_id === selectedProjectId && r.vintage).forEach((r) => years.add(r.vintage));
    transactions.filter((t) => t.project_id === selectedProjectId && t.year).forEach((t) => years.add(t.year));
    return [...years].sort();
  }, [selectedProjectId, lineItems, budgetCategories, subItems, revenueStreams, transactions]);

  // reset downstream when upstream changes
  const handleUserChange = (val) => { setSelectedUserId(val); setSelectedProjectId("all"); setSelectedYear("all"); };
  const handleProjectChange = (val) => { setSelectedProjectId(val); setSelectedYear("all"); };

  // ── TABLE DATA ────────────────────────────────────────────────────────────
  // Build all budget builder items (categories + line items + sub-items) for selected project+year
  const budgetRows = useMemo(() => {
    if (selectedProjectId === "all") return [];
    const yearMatch = (item) => selectedYear === "all" || item.year === selectedYear;

    const catRows = budgetCategories
      .filter((c) => c.project_id === selectedProjectId && yearMatch(c))
      .map((c) => ({
        "Cost Type": c.cost_type || "",
        "Tier 1 Category": c.tier_1_category || "",
        "Tier 2 Category": c.tier_2_category || "",
        "Tier 3 Category": c.tier_3_category || "",
        "Name": c.name || "",
        "Description": c.description || "",
        "Budget Amount": c.budget_amount ?? 0,
        "Month": c.month || "",
        "Year": c.year || "",
        "Level": "Category",
      }));

    const liRows = lineItems
      .filter((li) => li.project_id === selectedProjectId && yearMatch(li))
      .map((li) => ({
        "Cost Type": li.cost_type || "",
        "Tier 1 Category": li.tier_1_category || "",
        "Tier 2 Category": li.tier_2_category || "",
        "Tier 3 Category": li.tier_3_category || "",
        "Name": li.name || "",
        "Description": li.description || "",
        "Budget Amount": li.budget_amount ?? 0,
        "Month": li.month || "",
        "Year": li.year || "",
        "Level": "Line Item",
      }));

    const siRows = subItems
      .filter((si) => {
        const parentLi = lineItems.find((li) => li.id === si.line_item_id);
        return parentLi && parentLi.project_id === selectedProjectId && yearMatch(si);
      })
      .map((si) => ({
        "Cost Type": si.cost_type || "",
        "Tier 1 Category": si.tier_1_category || "",
        "Tier 2 Category": si.tier_2_category || "",
        "Tier 3 Category": si.tier_3_category || "",
        "Name": si.name || "",
        "Description": si.description || "",
        "Budget Amount": si.budget_amount ?? 0,
        "Month": si.month || "",
        "Year": si.year || "",
        "Level": "Sub-Item",
      }));

    return [...catRows, ...liRows, ...siRows];
  }, [selectedProjectId, selectedYear, budgetCategories, lineItems, subItems]);

  const revenueRows = useMemo(() => {
    if (selectedProjectId === "all") return [];
    return revenueStreams
      .filter((r) => {
        const yearMatch = selectedYear === "all" || r.vintage === selectedYear;
        return r.project_id === selectedProjectId && yearMatch;
      })
      .map((r) => ({
        "Ecosystem Service": r.credit_type || "",
        "Description": r.description || "",
        "Est. BoI (Volume)": r.estimated_volume ?? 0,
        "Est. Price / Unit": r.estimated_price_per_unit ?? 0,
        "Status": r.verification_status || "",
        "Vintage Year": r.vintage || "",
        "Date of Sale": r.date_of_sale || "",
        "Notes": r.notes || "",
      }));
  }, [selectedProjectId, selectedYear, revenueStreams]);

  const fundingRows = useMemo(() => {
    if (selectedProjectId === "all") return [];
    return fundingSources
      .filter((f) => f.project_id === selectedProjectId)
      .map((f) => ({
        "Funding Type": f.funding_type || "",
        "Funder Name": f.funder_name || "",
        "Total Amount": f.total_amount ?? 0,
        "Drawn Amount": f.drawn_amount ?? 0,
        "Start Date": f.start_date || "",
        "End Date": f.end_date || "",
        "Status": f.status || "",
        "Terms": f.terms || "",
      }));
  }, [selectedProjectId, fundingSources]);

  const transactionRows = useMemo(() => {
    if (selectedProjectId === "all") return [];
    return transactions
      .filter((t) => {
        const isRevenue = t.transaction_type === "REVENUE";
        const yearMatch = selectedYear === "all" || t.year === selectedYear || (t.date && new Date(t.date).getFullYear().toString() === selectedYear);
        return t.project_id === selectedProjectId && isRevenue && yearMatch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((t) => ({
        "Date": t.date ? moment(t.date).format("DD MMM YYYY") : "",
        "Ecosystem Service": t.vintage || t.tier_1_category || "",
        "Description": t.description || "",
        "Amount": t.amount ?? 0,
        "Reference": t.reference || "",
      }));
  }, [selectedProjectId, selectedYear, transactions]);

  const slug = selectedProject ? selectedProject.name.replace(/\s+/g, "_") : "export";

  const budgetCols = [
    { key: "Level", label: "Level" },
    { key: "Cost Type", label: "Cost Type" },
    { key: "Tier 1 Category", label: "Tier 1" },
    { key: "Tier 2 Category", label: "Tier 2" },
    { key: "Tier 3 Category", label: "Tier 3" },
    { key: "Name", label: "Name" },
    { key: "Description", label: "Description" },
    { key: "Budget Amount", label: "Budget Amount" },
    { key: "Month", label: "Month" },
    { key: "Year", label: "Year" },
  ];

  const revenueCols = [
    { key: "Ecosystem Service", label: "Ecosystem Service" },
    { key: "Description", label: "Description" },
    { key: "Est. BoI (Volume)", label: "Est. BoI" },
    { key: "Est. Price / Unit", label: "Est. Price" },
    { key: "Status", label: "Status" },
    { key: "Vintage Year", label: "Year" },
    { key: "Date of Sale", label: "Date of Sale" },
    { key: "Notes", label: "Notes" },
  ];

  const fundingCols = [
    { key: "Funding Type", label: "Funding Type" },
    { key: "Funder Name", label: "Funder Name" },
    { key: "Total Amount", label: "Total Amount" },
    { key: "Drawn Amount", label: "Drawn Amount" },
    { key: "Start Date", label: "Start Date" },
    { key: "End Date", label: "End Date" },
    { key: "Status", label: "Status" },
    { key: "Terms", label: "Terms" },
  ];

  const transactionCols = [
    { key: "Date", label: "Date" },
    { key: "Ecosystem Service", label: "Ecosystem Service" },
    { key: "Description", label: "Description" },
    { key: "Amount", label: "Amount" },
    { key: "Reference", label: "Reference" },
  ];

  return (
    <AdminLayout currentPageName="AdminProjectData">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Project Data Repository</h1>
        <p className="text-sm text-slate-500 mt-1">Select a user, project, and year to explore and export data</p>
      </div>

      {/* ── Step Filters ── */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: User */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                <User className="h-3.5 w-3.5" /> Step 1 — Select User
              </label>
              <Select value={selectedUserId} onValueChange={handleUserChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.full_name} ({u.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Project */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                <FolderTree className="h-3.5 w-3.5" /> Step 2 — Select Project
              </label>
              <Select value={selectedProjectId} onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {userProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 3: Year */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                <Calendar className="h-3.5 w-3.5" /> Step 3 — Select Year
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear} disabled={selectedProjectId === "all"}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Context pill */}
          {selectedProject && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              <FolderTree className="h-4 w-4 text-emerald-600" />
              Viewing: <span className="font-semibold text-emerald-800">{selectedProject.name}</span>
              {selectedYear !== "all" && <> · Year <span className="font-semibold text-emerald-800">{selectedYear}</span></>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Tables ── */}
      {selectedProjectId === "all" ? (
        <div className="text-center py-16 text-slate-400">
          <FolderTree className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a project to view its data tables</p>
        </div>
      ) : (
        <>
          <DataTable
            title="Budget Builder"
            columns={budgetCols}
            rows={budgetRows}
            csvFilename={`${slug}_budget_${selectedYear}.csv`}
            xlsxFilename={`${slug}_budget_${selectedYear}.xlsx`}
          />
          <DataTable
            title="Revenue Streams"
            columns={revenueCols}
            rows={revenueRows}
            csvFilename={`${slug}_revenue_${selectedYear}.csv`}
            xlsxFilename={`${slug}_revenue_${selectedYear}.xlsx`}
          />
          <DataTable
            title="Funding Sources"
            columns={fundingCols}
            rows={fundingRows}
            csvFilename={`${slug}_funding.csv`}
            xlsxFilename={`${slug}_funding.xlsx`}
          />
          <DataTable
            title="Revenue Transactions"
            columns={transactionCols}
            rows={transactionRows}
            csvFilename={`${slug}_transactions_${selectedYear}.csv`}
            xlsxFilename={`${slug}_transactions_${selectedYear}.xlsx`}
          />
        </>
      )}
    </AdminLayout>
  );
}