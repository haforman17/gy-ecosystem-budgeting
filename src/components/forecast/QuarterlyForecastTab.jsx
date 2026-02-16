import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar } from "lucide-react";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import QuarterlyForecastTable from "@/components/forecast/QuarterlyForecastTable";
import QuarterlyActualsComparison from "@/components/forecast/QuarterlyActualsComparison";
import QuarterlyForecastChart from "@/components/forecast/QuarterlyForecastChart";
import { startOfYear, endOfYear, startOfQuarter, endOfQuarter, eachQuarterOfInterval, parseISO } from "date-fns";

export default function QuarterlyForecastTab({ projectId, project }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [forecastYears, setForecastYears] = useState(1);

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

  const quarterlyActuals = React.useMemo(() => {
    const quarters = eachQuarterOfInterval({
      start: startOfYear(new Date(selectedYear, 0, 1)),
      end: endOfYear(new Date(selectedYear, 11, 31)),
    });

    return quarters.map((quarterDate, idx) => {
      const qStart = startOfQuarter(quarterDate);
      const qEnd = endOfQuarter(quarterDate);
      
      const quarterTransactions = transactions.filter((t) => {
        const tDate = parseISO(t.date);
        return tDate >= qStart && tDate <= qEnd;
      });

      const revenue = quarterTransactions
        .filter((t) => t.transaction_type === "REVENUE")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = quarterTransactions
        .filter((t) => t.transaction_type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

      const funding = quarterTransactions
        .filter((t) => t.transaction_type === "FUNDING_DRAWDOWN")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        quarter: `Q${idx + 1} ${selectedYear}`,
        quarterDate: quarterDate,
        actualRevenue: revenue,
        actualExpenses: expenses,
        actualFunding: funding,
        actualNetCashFlow: revenue - expenses + funding,
      };
    });
  }, [transactions, selectedYear]);

  const quarterlyForecast = React.useMemo(() => {
    const endYear = selectedYear + forecastYears - 1;
    const quarters = eachQuarterOfInterval({
      start: startOfYear(new Date(selectedYear, 0, 1)),
      end: endOfYear(new Date(endYear, 11, 31)),
    });

    const annualRevenue = revenueStreams
      .filter((rs) => {
        const genYear = new Date(rs.generation_start_date).getFullYear();
        return genYear <= selectedYear;
      })
      .reduce((sum, rs) => sum + (rs.estimated_revenue || 0), 0);

    const annualExpenses = lineItems.reduce((sum, li) => sum + (li.budget_amount || 0), 0);

    return quarters.map((quarterDate, idx) => {
      const year = quarterDate.getFullYear();
      const quarterNum = Math.floor((quarterDate.getMonth()) / 3) + 1;
      return {
        quarter: `Q${quarterNum} ${year}`,
        quarterDate: quarterDate,
        forecastRevenue: Math.round(annualRevenue / 4),
        forecastExpenses: Math.round(annualExpenses / 4),
        forecastNetCashFlow: Math.round((annualRevenue - annualExpenses) / 4),
      };
    });
  }, [revenueStreams, lineItems, selectedYear, forecastYears]);

  const combinedData = React.useMemo(() => {
    return quarterlyActuals.map((actual, idx) => ({
      ...actual,
      ...quarterlyForecast[idx],
      varianceRevenue: actual.actualRevenue - (quarterlyForecast[idx]?.forecastRevenue || 0),
      varianceExpenses: actual.actualExpenses - (quarterlyForecast[idx]?.forecastExpenses || 0),
      varianceNetCashFlow: actual.actualNetCashFlow - (quarterlyForecast[idx]?.forecastNetCashFlow || 0),
    }));
  }, [quarterlyActuals, quarterlyForecast]);

  const yearTotals = React.useMemo(() => {
    const actualRevenue = combinedData.reduce((sum, q) => sum + q.actualRevenue, 0);
    const actualExpenses = combinedData.reduce((sum, q) => sum + q.actualExpenses, 0);
    const forecastRevenue = combinedData.reduce((sum, q) => sum + q.forecastRevenue, 0);
    const forecastExpenses = combinedData.reduce((sum, q) => sum + q.forecastExpenses, 0);

    return {
      actualRevenue,
      actualExpenses,
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
      <div className="flex justify-end gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Forecast years:</label>
          <Select value={forecastYears.toString()} onValueChange={(v) => setForecastYears(parseInt(v))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((years) => (
                <SelectItem key={years} value={years.toString()}>
                  {years}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          <QuarterlyForecastChart data={combinedData} />
          <QuarterlyActualsComparison data={combinedData} totals={yearTotals} />
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <QuarterlyForecastTable data={quarterlyForecast} year={selectedYear} projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}