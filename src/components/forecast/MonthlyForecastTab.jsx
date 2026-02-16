import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import MonthlyForecastTable from "@/components/forecast/MonthlyForecastTable";
import MonthlyActualsComparison from "@/components/forecast/MonthlyActualsComparison";
import MonthlyForecastChart from "@/components/forecast/MonthlyForecastChart";
import { format, startOfYear, endOfYear, eachMonthOfInterval, parseISO } from "date-fns";

export default function MonthlyForecastTab({ projectId, project }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", projectId],
    queryFn: () => base44.entities.Transaction.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: revenueStreams = [] } = useQuery({
    queryKey: ["revenueStreams", projectId],
    queryFn: () => base44.entities.RevenueStream.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: lineItems = [] } = useQuery({
    queryKey: ["lineItems", projectId],
    queryFn: () => base44.entities.LineItem.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const availableYears = React.useMemo(() => {
    if (!project) return [currentYear];
    const startYear = new Date(project.start_date).getFullYear();
    const years = [];
    for (let y = startYear; y <= currentYear + 5; y++) {
      years.push(y);
    }
    return years;
  }, [project, currentYear]);

  const monthlyActuals = React.useMemo(() => {
    const months = eachMonthOfInterval({
      start: startOfYear(new Date(selectedYear, 0, 1)),
      end: endOfYear(new Date(selectedYear, 11, 31)),
    });

    return months.map((monthDate) => {
      const monthStr = format(monthDate, "yyyy-MM");
      
      const monthTransactions = transactions.filter((t) => {
        const tDate = format(parseISO(t.date), "yyyy-MM");
        return tDate === monthStr;
      });

      const revenue = monthTransactions
        .filter((t) => t.transaction_type === "REVENUE")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t) => t.transaction_type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

      const funding = monthTransactions
        .filter((t) => t.transaction_type === "FUNDING_DRAWDOWN")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(monthDate, "MMM yyyy"),
        monthDate: monthDate,
        actualRevenue: revenue,
        actualExpenses: expenses,
        actualFunding: funding,
        actualNetCashFlow: revenue - expenses + funding,
      };
    });
  }, [transactions, selectedYear]);

  const monthlyForecast = React.useMemo(() => {
    const months = eachMonthOfInterval({
      start: startOfYear(new Date(selectedYear, 0, 1)),
      end: endOfYear(new Date(selectedYear, 11, 31)),
    });

    const annualRevenue = revenueStreams
      .filter((rs) => {
        const genYear = new Date(rs.generation_start_date).getFullYear();
        return genYear <= selectedYear;
      })
      .reduce((sum, rs) => sum + (rs.estimated_revenue || 0), 0);

    const annualExpenses = lineItems.reduce((sum, li) => sum + (li.budget_amount || 0), 0);

    return months.map((monthDate) => ({
      month: format(monthDate, "MMM yyyy"),
      monthDate: monthDate,
      forecastRevenue: Math.round(annualRevenue / 12),
      forecastExpenses: Math.round(annualExpenses / 12),
      forecastNetCashFlow: Math.round((annualRevenue - annualExpenses) / 12),
    }));
  }, [revenueStreams, lineItems, selectedYear]);

  const combinedData = React.useMemo(() => {
    return monthlyActuals.map((actual, idx) => ({
      ...actual,
      ...monthlyForecast[idx],
      varianceRevenue: actual.actualRevenue - (monthlyForecast[idx]?.forecastRevenue || 0),
      varianceExpenses: actual.actualExpenses - (monthlyForecast[idx]?.forecastExpenses || 0),
      varianceNetCashFlow: actual.actualNetCashFlow - (monthlyForecast[idx]?.forecastNetCashFlow || 0),
    }));
  }, [monthlyActuals, monthlyForecast]);

  const yearTotals = React.useMemo(() => {
    const actualRevenue = combinedData.reduce((sum, m) => sum + m.actualRevenue, 0);
    const actualExpenses = combinedData.reduce((sum, m) => sum + m.actualExpenses, 0);
    const actualFunding = combinedData.reduce((sum, m) => sum + (m.actualFunding || 0), 0);
    const forecastRevenue = combinedData.reduce((sum, m) => sum + m.forecastRevenue, 0);
    const forecastExpenses = combinedData.reduce((sum, m) => sum + m.forecastExpenses, 0);

    return {
      actualRevenue,
      actualExpenses,
      actualFunding,
      actualNetCashFlow: actualRevenue - actualExpenses,
      forecastRevenue,
      forecastExpenses,
      forecastNetCashFlow: forecastRevenue - forecastExpenses,
      varianceRevenue: actualRevenue - forecastRevenue,
      varianceExpenses: actualExpenses - forecastExpenses,
      varianceNetCashFlow: actualRevenue - actualExpenses - (forecastRevenue - forecastExpenses),
    };
  }, [combinedData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Forecast Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(yearTotals.forecastRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Actual Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(yearTotals.actualRevenue)}</p>
            <p className={`text-sm mt-1 ${yearTotals.varianceRevenue >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {yearTotals.varianceRevenue >= 0 ? "+" : ""}
              {formatCurrency(yearTotals.varianceRevenue)} variance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Forecast Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(yearTotals.forecastExpenses)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Actual Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(yearTotals.actualExpenses)}</p>
            <p className={`text-sm mt-1 ${yearTotals.varianceExpenses <= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {yearTotals.varianceExpenses >= 0 ? "+" : ""}
              {formatCurrency(yearTotals.varianceExpenses)} variance
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparison">
            <TrendingUp className="h-4 w-4 mr-2" />
            Forecast vs Actuals
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <Calendar className="h-4 w-4 mr-2" />
            Forecast Only
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <MonthlyForecastChart data={combinedData} />
          <MonthlyActualsComparison data={combinedData} totals={yearTotals} />
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <MonthlyForecastTable data={monthlyForecast} year={selectedYear} projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}