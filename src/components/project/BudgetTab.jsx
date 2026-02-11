import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "../shared/CurrencyFormat";
import { getLabel } from "../shared/StatusBadge";
import EmptyState from "../shared/EmptyState";
import { Plus, FileText, MoreVertical, Pencil } from "lucide-react";
import { format } from "date-fns";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import LineItemFormModal from "./LineItemFormModal";
import TransactionsModal from "./TransactionsModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const COLORS = ["#059669", "#0891b2", "#7c3aed", "#db2777", "#ea580c", "#d97706", "#4f46e5", "#16a34a", "#64748b", "#dc2626", "#8b5cf6"];

export default function BudgetTab({ projectId, lineItems }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedLineItem, setSelectedLineItem] = useState(null);

  // Fetch transactions to calculate actual expenses
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", projectId],
    queryFn: () => base44.entities.Transaction.filter({ project_id: projectId }),
    initialData: [],
    enabled: !!projectId,
  });

  // Calculate actual amounts from transactions for each line item
  const lineItemActuals = useMemo(() => {
    const actuals = {};
    lineItems.forEach((li) => {
      const relatedTxs = transactions.filter(
        (tx) => tx.transaction_type === "EXPENSE" && tx.line_item_id === li.id
      );
      const totalExpense = relatedTxs.reduce((sum, tx) => {
        const amt = Number(tx.amount) || 0;
        return sum + amt;
      }, 0);
      actuals[li.id] = totalExpense;
    });
    return actuals;
  }, [transactions, lineItems]);

  const totalBudget = lineItems.reduce((sum, li) => sum + (li.budget_amount || 0), 0);
  const totalActual = lineItems.reduce((sum, li) => sum + (lineItemActuals[li.id] || 0), 0);

  // Chart data grouped by category
  const categoryBudgetData = {};
  const categoryActualData = {};
  lineItems.forEach((li) => {
    const cat = li.category || "OTHER";
    categoryBudgetData[cat] = (categoryBudgetData[cat] || 0) + (li.budget_amount || 0);
    categoryActualData[cat] = (categoryActualData[cat] || 0) + (lineItemActuals[li.id] || 0);
  });
  
  const budgetChartData = Object.entries(categoryBudgetData).map(([name, value]) => ({
    name: getLabel(name),
    value,
  }));
  
  const actualChartData = Object.entries(categoryActualData).map(([name, value]) => ({
    name: getLabel(name),
    value,
  }));
  
  const comparisonChartData = Object.keys(categoryBudgetData).map((cat) => ({
    name: getLabel(cat),
    Budget: categoryBudgetData[cat] || 0,
    Actual: categoryActualData[cat] || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Budget Line Items</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Line Item
        </Button>
      </div>

      {lineItems.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No line items"
          description="Add budget line items to track your project costs."
          actionLabel="Add Line Item"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/60">
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase">Category</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase">Description</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Budget</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Actual</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Variance</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase">Year</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((li) => {
                      const actualAmount = lineItemActuals[li.id] || 0;
                      const variance = (li.budget_amount || 0) - actualAmount;
                      return (
                        <TableRow key={li.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedLineItem(li)}>
                          <TableCell className="text-xs font-medium text-slate-600">{getLabel(li.category)}</TableCell>
                          <TableCell className="text-sm text-slate-700">{li.description}</TableCell>
                          <TableCell className="text-right text-sm font-medium">{formatCurrency(li.budget_amount)}</TableCell>
                          <TableCell className="text-right text-sm">{formatCurrency(actualAmount)}</TableCell>
                          <TableCell className={`text-right text-sm font-medium ${variance >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {formatCurrency(variance)}
                          </TableCell>
                          <TableCell className="text-xs text-slate-400">
                            {li.date || "—"}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditItem(li)}>
                                  <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-slate-50/60 font-semibold">
                      <TableCell colSpan={2} className="text-sm text-slate-700">Total</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(totalBudget)}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(totalActual)}</TableCell>
                      <TableCell className={`text-right text-sm ${totalBudget - totalActual >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {formatCurrency(totalBudget - totalActual)}
                      </TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600">Budget by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={budgetChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                      {budgetChartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600">Actual Spend by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={actualChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                      {actualChartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600">Budget vs Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="Budget" fill="#059669" />
                    <Bar dataKey="Actual" fill="#0891b2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {showForm && (
        <LineItemFormModal projectId={projectId} onClose={() => setShowForm(false)} />
      )}

      {editItem && (
        <LineItemFormModal projectId={projectId} item={editItem} onClose={() => setEditItem(null)} />
      )}

      {selectedLineItem && (
        <TransactionsModal
          open={!!selectedLineItem}
          onClose={() => setSelectedLineItem(null)}
          title={`${getLabel(selectedLineItem.category)} - ${selectedLineItem.description}`}
          transactions={transactions.filter(
            (tx) => tx.transaction_type === "EXPENSE" && tx.line_item_id === selectedLineItem.id
          )}
        />
      )}
    </div>
  );
}