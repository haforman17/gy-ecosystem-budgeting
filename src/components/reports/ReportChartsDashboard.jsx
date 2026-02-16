import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/components/shared/CurrencyFormat";

export default function ReportChartsDashboard({
  project,
  transactions,
  revenueStreams,
  lineItems,
  selectedYear,
  selectedScenario,
}) {
  const chartData = useMemo(() => {
    const yearTransactions = transactions.filter(t => {
      if (!t.date) return false;
      return new Date(t.date).getFullYear() === selectedYear;
    });

    // Monthly aggregation
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthTransactions = yearTransactions.filter(t => {
        const txMonth = new Date(t.date).getMonth() + 1;
        return txMonth === month;
      });

      const revenue = monthTransactions
        .filter(t => t.transaction_type === "REVENUE")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const expenses = monthTransactions
        .filter(t => t.transaction_type === "EXPENSE" || t.transaction_type === "OPERATING_COST")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        month: new Date(selectedYear, i).toLocaleString('default', { month: 'short' }),
        Revenue: revenue,
        Expenses: expenses,
        "Net Income": revenue - expenses,
      };
    });

    return { monthlyData };
  }, [transactions, selectedYear]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses - Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="Revenue" fill="#10b981" />
              <Bar dataKey="Expenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Net Income Trend - FY{selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="Net Income" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}