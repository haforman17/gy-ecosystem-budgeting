import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { TrendingUp, DollarSign, Target, Percent } from "lucide-react";

export default function ReportKeyMetrics({
  project,
  transactions,
  revenueStreams,
  lineItems,
  fundingSources,
  selectedYear,
}) {
  const metrics = useMemo(() => {
    const yearTransactions = transactions.filter(t => {
      if (!t.date) return false;
      return new Date(t.date).getFullYear() === selectedYear;
    });

    const totalRevenue = yearTransactions
      .filter(t => t.transaction_type === "REVENUE")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalExpenses = yearTransactions
      .filter(t => t.transaction_type === "EXPENSE" || t.transaction_type === "OPERATING_COST")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalCOGS = yearTransactions
      .filter(t => t.cost_type === "COGS")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const grossProfit = totalRevenue - totalCOGS;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

    const revenuePerHectare = project.site_area > 0 ? totalRevenue / project.site_area : 0;

    return {
      totalRevenue,
      totalExpenses,
      grossProfit,
      grossMargin,
      netMargin,
      revenuePerHectare,
    };
  }, [transactions, project, selectedYear]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-600">Gross Margin</p>
            <Percent className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-600">
            {metrics.grossMargin.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Gross Profit: {formatCurrency(metrics.grossProfit)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-600">Net Margin</p>
            <Percent className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {metrics.netMargin.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Net Income: {formatCurrency(metrics.totalRevenue - metrics.totalExpenses)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-600">Revenue per Hectare</p>
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {formatCurrency(metrics.revenuePerHectare)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Site Area: {project.site_area} ha
          </p>
        </CardContent>
      </Card>
    </div>
  );
}