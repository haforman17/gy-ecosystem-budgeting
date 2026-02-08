import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "../shared/CurrencyFormat";
import { StatusBadge, getLabel } from "../shared/StatusBadge";
import EmptyState from "../shared/EmptyState";
import ConfirmDialog from "../shared/ConfirmDialog";
import { Plus, Trash2, Receipt, Download, MoreVertical, Pencil } from "lucide-react";
import { format } from "date-fns";
import TransactionFormModal from "./TransactionFormModal";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function TransactionsTab({ projectId, transactions, lineItems, revenueStreams, fundingSources }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", projectId] });
      toast.success("Transaction deleted");
      setDeleteId(null);
    },
  });

  const filtered = useMemo(() => {
    let items = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (filterType !== "ALL") items = items.filter((t) => t.transaction_type === filterType);
    return items;
  }, [transactions, filterType]);

  const getRelatedName = (tx) => {
    if (tx.line_item_id) {
      const li = lineItems.find((l) => l.id === tx.line_item_id);
      return li ? li.description : "—";
    }
    if (tx.revenue_stream_id) {
      const rs = revenueStreams.find((r) => r.id === tx.revenue_stream_id);
      return rs ? rs.description : "—";
    }
    return "—";
  };

  const getFundingName = (tx) => {
    if (tx.funding_source_id) {
      const fs = fundingSources.find((f) => f.id === tx.funding_source_id);
      return fs ? fs.funder_name : "—";
    }
    return "—";
  };

  const exportCSV = () => {
    const headers = ["Date", "Type", "Description", "Amount", "Related To", "Funding Source", "Reference"];
    const rows = filtered.map((tx) => [
      tx.date ? format(new Date(tx.date), "yyyy-MM-dd") : "",
      getLabel(tx.transaction_type),
      tx.description,
      tx.amount,
      getRelatedName(tx),
      getFundingName(tx),
      tx.reference || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const txTypeColors = {
    EXPENSE: "text-red-600",
    REVENUE: "text-emerald-600",
    FUNDING_DRAWDOWN: "text-blue-600",
    DEBT_REPAYMENT: "text-amber-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">Transactions</h2>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="EXPENSE">Expenses</SelectItem>
              <SelectItem value="REVENUE">Revenue</SelectItem>
              <SelectItem value="FUNDING_DRAWDOWN">Drawdowns</SelectItem>
              <SelectItem value="DEBT_REPAYMENT">Repayments</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Transaction
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions"
          description="Record expenses, revenue, and funding drawdowns to track financial activity."
          actionLabel="Add Transaction"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/60">
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">Date</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">Description</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">Related To</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">Funding</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">Reference</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs text-slate-500">
                        {tx.date ? format(new Date(tx.date), "dd MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell><StatusBadge value={tx.transaction_type} /></TableCell>
                      <TableCell className="text-sm text-slate-700">{tx.description}</TableCell>
                      <TableCell className={`text-right text-sm font-semibold ${txTypeColors[tx.transaction_type] || ""}`}>
                        {tx.transaction_type === "EXPENSE" || tx.transaction_type === "DEBT_REPAYMENT" ? "−" : "+"}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">{getRelatedName(tx)}</TableCell>
                      <TableCell className="text-xs text-slate-500">{getFundingName(tx)}</TableCell>
                      <TableCell className="text-xs text-slate-400">{tx.reference || "—"}</TableCell>
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
                            <DropdownMenuItem onClick={() => setDeleteId(tx.id)} className="text-red-600">
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
      )}

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

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Transaction"
        description="Are you sure? This action cannot be undone."
        onConfirm={() => deleteMutation.mutate(deleteId)}
        destructive
      />
    </div>
  );
}