import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "../shared/CurrencyFormat";
import EmptyState from "../shared/EmptyState";
import { Plus, Receipt, Download, MoreVertical, Pencil, FileSpreadsheet, Paperclip, Trash2 } from "lucide-react";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import TransactionFormModal from "./TransactionFormModal";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function TransactionsTab({ projectId, transactions, lineItems, revenueStreams, fundingSources }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [activeTab, setActiveTab] = useState("REVENUE");
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Transaction.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", projectId] });
      toast.success("Transaction deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete transaction");
      console.error(error);
    },
  });

  const revenueTransactions = useMemo(() => 
    transactions.filter((t) => t.transaction_type === "REVENUE").sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions]
  );

  const expenseTransactions = useMemo(() => 
    transactions.filter((t) => t.transaction_type === "EXPENSE").sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions]
  );

  const drawdownTransactions = useMemo(() => 
    transactions.filter((t) => t.transaction_type === "FUNDING_DRAWDOWN").sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions]
  );

  const repaymentTransactions = useMemo(() => 
    transactions.filter((t) => t.transaction_type === "DEBT_REPAYMENT").sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions]
  );

  const getEcosystemService = (tx) => {
    if (tx.revenue_stream_id) {
      const rs = revenueStreams.find((r) => r.id === tx.revenue_stream_id);
      return rs ? rs.credit_type : "—";
    }
    return "—";
  };

  const getLineItemTier1 = (tx) => {
    if (tx.line_item_id) {
      const li = lineItems.find((l) => l.id === tx.line_item_id);
      return li ? li.tier_1_category : "—";
    }
    return tx.tier_1_category || "—";
  };

  const getLineItemTier2 = (tx) => {
    if (tx.line_item_id) {
      const li = lineItems.find((l) => l.id === tx.line_item_id);
      return li ? li.tier_2_category : "—";
    }
    return tx.tier_2_category || "—";
  };

  const getFundingName = (tx) => {
    if (tx.funding_source_id) {
      const fs = fundingSources.find((f) => f.id === tx.funding_source_id);
      return fs ? fs.funder_name : "—";
    }
    return "—";
  };

  const exportCSV = (data, type) => {
    let headers, rows;
    if (type === "REVENUE") {
      headers = ["Date", "Ecosystem Service", "Description", "Units", "Price", "Amount", "Reference"];
      rows = data.map((tx) => [
        tx.date ? format(new Date(tx.date), "yyyy-MM-dd") : "",
        getEcosystemService(tx),
        tx.description,
        tx.units_quantity || "",
        tx.unit_price || "",
        tx.amount,
        tx.reference || "",
      ]);
    } else if (type === "EXPENSE") {
      headers = ["Date", "Tier 1", "Tier 2", "Description", "Amount", "Funding Source", "Reference"];
      rows = data.map((tx) => [
        tx.date ? format(new Date(tx.date), "yyyy-MM-dd") : "",
        getLineItemTier1(tx),
        getLineItemTier2(tx),
        tx.description,
        tx.amount,
        getFundingName(tx),
        tx.reference || "",
      ]);
    } else {
      headers = ["Date", "Description", "Amount", "Funding Source", "Reference"];
      rows = data.map((tx) => [
        tx.date ? format(new Date(tx.date), "yyyy-MM-dd") : "",
        tx.description,
        tx.amount,
        getFundingName(tx),
        tx.reference || "",
      ]);
    }
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type.toLowerCase()}-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportXLSX = (data, type) => {
    let headers, rows;
    if (type === "REVENUE") {
      headers = ["Date", "Ecosystem Service", "Description", "Units", "Price", "Amount", "Reference"];
      rows = data.map((tx) => [
        tx.date ? format(new Date(tx.date), "yyyy-MM-dd") : "",
        getEcosystemService(tx),
        tx.description,
        tx.units_quantity || "",
        tx.unit_price || "",
        tx.amount,
        tx.reference || "",
      ]);
    } else if (type === "EXPENSE") {
      headers = ["Date", "Tier 1", "Tier 2", "Description", "Amount", "Funding Source", "Reference"];
      rows = data.map((tx) => [
        tx.date ? format(new Date(tx.date), "yyyy-MM-dd") : "",
        getLineItemTier1(tx),
        getLineItemTier2(tx),
        tx.description,
        tx.amount,
        getFundingName(tx),
        tx.reference || "",
      ]);
    } else {
      headers = ["Date", "Description", "Amount", "Funding Source", "Reference"];
      rows = data.map((tx) => [
        tx.date ? format(new Date(tx.date), "yyyy-MM-dd") : "",
        tx.description,
        tx.amount,
        getFundingName(tx),
        tx.reference || "",
      ]);
    }
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, `${type.toLowerCase()}-transactions-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const renderTable = (data, type) => {
    if (data.length === 0) {
      return (
        <EmptyState
          icon={Receipt}
          title={`No ${type.toLowerCase()} transactions`}
          description={`Add ${type.toLowerCase()} transactions to track this activity.`}
          actionLabel="Add Transaction"
          onAction={() => setShowForm(true)}
        />
      );
    }

    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60">
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">Date</TableHead>
                  {type === "REVENUE" && (
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">Ecosystem Service</TableHead>
                  )}
                  {type === "EXPENSE" && (
                    <>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase">Cost Type</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase">Tier 1</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase">Tier 2</TableHead>
                    </>
                  )}
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">Description</TableHead>
                  {type === "EXPENSE" && (
                    <>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase">Month</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase">Year</TableHead>
                    </>
                  )}
                  {type === "REVENUE" && (
                    <>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Units</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Price</TableHead>
                    </>
                  )}
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Amount</TableHead>
                  {(type === "EXPENSE" || type === "FUNDING_DRAWDOWN" || type === "DEBT_REPAYMENT") && (
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">Funding Source</TableHead>
                  )}
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">Reference</TableHead>
                  <TableHead className="w-10 text-center">
                    <Paperclip className="h-3.5 w-3.5 text-slate-400 mx-auto" />
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-xs text-slate-500">
                      {tx.date ? format(new Date(tx.date), "dd MMM yyyy") : "—"}
                    </TableCell>
                    {type === "REVENUE" && (
                      <TableCell className="text-xs text-slate-600">{getEcosystemService(tx)}</TableCell>
                    )}
                    {type === "EXPENSE" && (
                      <>
                        <TableCell className="text-xs">
                          {tx.cost_type ? (
                            <span className={`px-2 py-0.5 rounded font-semibold text-white ${
                              tx.cost_type === "OP_COSTS" ? "bg-slate-600" : "bg-slate-700"
                            }`}>
                              {tx.cost_type === "OP_COSTS" ? "Op Costs" : "COGS"}
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{getLineItemTier1(tx)}</TableCell>
                        <TableCell className="text-xs text-slate-600">{getLineItemTier2(tx)}</TableCell>
                      </>
                    )}
                    <TableCell className="text-sm text-slate-700">{tx.description}</TableCell>
                    {type === "EXPENSE" && (
                      <>
                        <TableCell className="text-xs text-slate-500">{tx.month || "—"}</TableCell>
                        <TableCell className="text-xs text-slate-500">{tx.year || "—"}</TableCell>
                      </>
                    )}
                    {type === "REVENUE" && (
                      <>
                        <TableCell className="text-right text-sm text-slate-600">
                          {tx.units_quantity ? Number(tx.units_quantity).toLocaleString() : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-600">
                          {tx.unit_price ? formatCurrency(tx.unit_price) : "—"}
                        </TableCell>
                      </>
                    )}
                    <TableCell className={`text-right text-sm font-semibold ${
                      type === "REVENUE" ? "text-emerald-600" : type === "EXPENSE" ? "text-red-600" : type === "FUNDING_DRAWDOWN" ? "text-blue-600" : "text-amber-600"
                    }`}>
                      {type === "EXPENSE" || type === "DEBT_REPAYMENT" ? "−" : "+"}
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    {(type === "EXPENSE" || type === "FUNDING_DRAWDOWN" || type === "DEBT_REPAYMENT") && (
                      <TableCell className="text-xs text-slate-500">{getFundingName(tx)}</TableCell>
                    )}
                    <TableCell className="text-xs text-slate-400">{tx.reference || "—"}</TableCell>
                    <TableCell className="text-center">
                      {tx.receipt_url ? (
                        <a
                          href={tx.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center hover:bg-slate-100 rounded p-1"
                          title="View receipt"
                        >
                          <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
                        </a>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditItem(tx)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteMutation.mutate(tx.id)} className="text-red-600">
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">Transactions</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={
                (activeTab === "REVENUE" && revenueTransactions.length === 0) ||
                (activeTab === "EXPENSE" && expenseTransactions.length === 0) ||
                (activeTab === "FUNDING_DRAWDOWN" && drawdownTransactions.length === 0) ||
                (activeTab === "DEBT_REPAYMENT" && repaymentTransactions.length === 0)
              }>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                const data = activeTab === "REVENUE" ? revenueTransactions : 
                            activeTab === "EXPENSE" ? expenseTransactions : 
                            activeTab === "FUNDING_DRAWDOWN" ? drawdownTransactions : repaymentTransactions;
                exportCSV(data, activeTab);
              }}>
                <FileSpreadsheet className="h-3.5 w-3.5 mr-2" /> Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const data = activeTab === "REVENUE" ? revenueTransactions : 
                            activeTab === "EXPENSE" ? expenseTransactions : 
                            activeTab === "FUNDING_DRAWDOWN" ? drawdownTransactions : repaymentTransactions;
                exportXLSX(data, activeTab);
              }}>
                <FileSpreadsheet className="h-3.5 w-3.5 mr-2" /> Export as XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Transaction
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="REVENUE">Revenue ({revenueTransactions.length})</TabsTrigger>
          <TabsTrigger value="EXPENSE">Expenses ({expenseTransactions.length})</TabsTrigger>
          <TabsTrigger value="FUNDING_DRAWDOWN">Drawdowns ({drawdownTransactions.length})</TabsTrigger>
          <TabsTrigger value="DEBT_REPAYMENT">Repayments ({repaymentTransactions.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="REVENUE" className="mt-4">
          {renderTable(revenueTransactions, "REVENUE")}
        </TabsContent>
        <TabsContent value="EXPENSE" className="mt-4">
          {renderTable(expenseTransactions, "EXPENSE")}
        </TabsContent>
        <TabsContent value="FUNDING_DRAWDOWN" className="mt-4">
          {renderTable(drawdownTransactions, "FUNDING_DRAWDOWN")}
        </TabsContent>
        <TabsContent value="DEBT_REPAYMENT" className="mt-4">
          {renderTable(repaymentTransactions, "DEBT_REPAYMENT")}
        </TabsContent>
      </Tabs>

      {showForm && (
        <TransactionFormModal
          projectId={projectId}
          lineItems={lineItems}
          revenueStreams={revenueStreams}
          fundingSources={fundingSources}
          onClose={() => setShowForm(false)}
        />
      )}

      {editItem && (
        <TransactionFormModal
          projectId={projectId}
          transaction={editItem}
          lineItems={lineItems}
          revenueStreams={revenueStreams}
          fundingSources={fundingSources}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
}