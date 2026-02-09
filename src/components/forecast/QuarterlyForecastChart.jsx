import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/components/shared/CurrencyFormat";

export default function QuarterlyForecastChart({ data }) {
  const chartData = data.map((q) => ({
    quarter: q.quarter,
    "Forecast Revenue": q.forecastRevenue,
    "Actual Revenue": q.actualRevenue,
    "Forecast Expenses": q.forecastExpenses,
    "Actual Expenses": q.actualExpenses,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quarterly Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="quarter" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="Forecast Revenue" fill="#10b981" opacity={0.6} />
            <Bar dataKey="Actual Revenue" fill="#059669" />
            <Bar dataKey="Forecast Expenses" fill="#94a3b8" opacity={0.6} />
            <Bar dataKey="Actual Expenses" fill="#64748b" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}