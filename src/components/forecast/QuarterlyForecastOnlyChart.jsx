import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { TrendingUp, BarChart3 } from "lucide-react";

export default function QuarterlyForecastOnlyChart({ data, type = "bar" }) {
  const chartData = data.map((item) => {
    const grossMargin = (item.forecastRevenue || 0) - (item.forecastCOGS || 0);
    const netIncomeBeforeTax = grossMargin - (item.forecastOperatingCosts || 0);
    const netIncome = netIncomeBeforeTax - (item.forecastTax || 0);
    const netCashFlow = netIncome + (item.forecastFunding || 0);
    
    return {
      quarter: item.quarter,
      Revenue: item.forecastRevenue || 0,
      COGS: item.forecastCOGS || 0,
      "Gross Margin": grossMargin,
      "Operating Costs": item.forecastOperatingCosts || 0,
      "Net Income Before Tax": netIncomeBeforeTax,
      Tax: item.forecastTax || 0,
      "Net Income": netIncome,
      Funding: item.forecastFunding || 0,
      "Net Cash Flow": netCashFlow,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-2">{payload[0].payload.quarter}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === "bar") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-slate-600" />
            Quarterly Forecast Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="quarter" stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `£${(val / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="Revenue" fill="#10b981" />
              <Bar dataKey="COGS" fill="#94a3b8" />
              <Bar dataKey="Operating Costs" fill="#64748b" />
              <Bar dataKey="Tax" fill="#f97316" />
              <Bar dataKey="Funding" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          Quarterly Forecast Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="quarter" stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `£${(val / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="COGS" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Operating Costs" stroke="#64748b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Net Income" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Net Cash Flow" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}