import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

export default function ReportBudgetVsActuals({
  projectId,
  selectedYear,
  lineItems,
  budgetCategories,
  subItems,
  transactions,
}) {
  const budgetComparison = useMemo(() => {
    const yearStr = selectedYear.toString();
    
    const budgetedAmount = [...lineItems, ...budgetCategories, ...subItems]
      .filter(item => item.year === yearStr)
      .reduce((sum, item) => sum + (item.budget_amount || 0), 0);

    const actualAmount = transactions
      .filter(t => t.year === yearStr && (t.transaction_type === "EXPENSE" || t.transaction_type === "OPERATING_COST"))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const variance = actualAmount - budgetedAmount;
    const variancePercent = budgetedAmount > 0 ? (variance / budgetedAmount) * 100 : 0;

    return {
      budgetedAmount,
      actualAmount,
      variance,
      variancePercent,
      isOverBudget: variance > 0,
    };
  }, [lineItems, budgetCategories, subItems, transactions, selectedYear]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actuals - FY{selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="text-right">Variance %</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="font-semibold">
                <TableCell>Total Expenses</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(budgetComparison.budgetedAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(budgetComparison.actualAmount)}
                </TableCell>
                <TableCell className={`text-right ${budgetComparison.isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                  {budgetComparison.variance >= 0 ? '+' : ''}{formatCurrency(budgetComparison.variance)}
                </TableCell>
                <TableCell className={`text-right ${budgetComparison.isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                  {budgetComparison.variancePercent >= 0 ? '+' : ''}{budgetComparison.variancePercent.toFixed(1)}%
                </TableCell>
                <TableCell>
                  {budgetComparison.isOverBudget ? (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Over Budget</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-sm">Under Budget</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}