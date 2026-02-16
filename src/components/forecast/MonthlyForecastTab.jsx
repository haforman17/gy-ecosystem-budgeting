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
import MonthlyForecastOnlyChart from "@/components/forecast/MonthlyForecastOnlyChart";
import { format, startOfYear, endOfYear, eachMonthOfInterval, parseISO } from "date-fns";

export default function MonthlyForecastTab({ projectId, project }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [currentScenarioId, setCurrentScenarioId] = useState(null);

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

  const { data: scenarios = [] } = useQuery({
    queryKey: ["monthlyScenarios", projectId, selectedYear],
    queryFn: () => base44.entities.ForecastScenario.filter({ 
      project_id: projectId,
      scenario_type: "MONTHLY",
      year: selectedYear 
    }),
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

      const cogs = monthTransactions
        .filter((t) => t.transaction_type === "COGS")
        .reduce((sum, t) => sum + t.amount, 0);

      const operatingCosts = monthTransactions
        .filter((t) => t.transaction_type === "OPERATING_COST")
        .reduce((sum, t) => sum + t.amount, 0);

      const funding = monthTransactions
        .filter((t) => t.transaction_type === "FUNDING_DRAWDOWN")
        .reduce((sum, t) => sum + t.amount, 0);

      const tax = monthTransactions
        .filter((t) => t.transaction_type === "TAX_PAYMENT")
        .reduce((sum, t) => sum + t.amount, 0);

      const grossMargin = revenue - cogs;
      const netIncomeBeforeTax = grossMargin - operatingCosts;
      const netIncome = netIncomeBeforeTax - tax;
      const netCashFlow = netIncome + funding;

      return {
        month: format(monthDate, "MMM yyyy"),
        monthDate: monthDate,
        actualRevenue: revenue,
        actualCOGS: cogs,
        actualOperatingCosts: operatingCosts,
        actualFunding: funding,
        actualTax: tax,
        actualGrossMargin: grossMargin,
        actualNetIncomeBeforeTax: netIncomeBeforeTax,
        actualNetIncome: netIncome,
        actualNetCashFlow: netCashFlow,
      };
    });
  }, [transactions, selectedYear]);

  const monthlyForecast = React.useMemo(() => {
    const months = eachMonthOfInterval({
      start: startOfYear(new Date(selectedYear, 0, 1)),
      end: endOfYear(new Date(selectedYear, 11, 31)),
    });

    const selectedScenario = scenarios.find(s => s.id === currentScenarioId);
    
    if (selectedScenario && selectedScenario.scenario_data && Array.isArray(selectedScenario.scenario_data)) {
      return selectedScenario.scenario_data.map(item => ({
        month: item.month,
        monthDate: item.monthDate,
        forecastRevenue: item.forecastRevenue || 0,
        forecastCOGS: item.forecastCOGS || 0,
        forecastOperatingCosts: item.forecastOperatingCosts || 0,
        forecastTax: item.forecastTax || 0,
        forecastFunding: item.forecastFunding || 0,
      }));
    }

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
      forecastCOGS: 0,
      forecastOperatingCosts: Math.round(annualExpenses / 12),
      forecastTax: 0,
      forecastFunding: 0,
    }));
  }, [revenueStreams, lineItems, selectedYear, scenarios, currentScenarioId]);

  const combinedData = React.useMemo(() => {
    return monthlyActuals.map((actual, idx) => {
      const forecast = monthlyForecast[idx] || {};
      const forecastGrossMargin = (forecast.forecastRevenue || 0) - (forecast.forecastCOGS || 0);
      const forecastNetIncomeBeforeTax = forecastGrossMargin - (forecast.forecastOperatingCosts || 0);
      const forecastNetIncome = forecastNetIncomeBeforeTax - (forecast.forecastTax || 0);
      const forecastNetCashFlow = forecastNetIncome + (forecast.forecastFunding || 0);
      
      return {
        ...actual,
        ...forecast,
        forecastGrossMargin,
        forecastNetIncomeBeforeTax,
        forecastNetIncome,
        forecastNetCashFlow,
        varianceRevenue: actual.actualRevenue - (forecast.forecastRevenue || 0),
        varianceNetCashFlow: actual.actualNetCashFlow - forecastNetCashFlow,
      };
    });
  }, [monthlyActuals, monthlyForecast]);

  const yearTotals = React.useMemo(() => {
    const actualRevenue = combinedData.reduce((sum, m) => sum + m.actualRevenue, 0);
    const actualCOGS = combinedData.reduce((sum, m) => sum + (m.actualCOGS || 0), 0);
    const actualOperatingCosts = combinedData.reduce((sum, m) => sum + (m.actualOperatingCosts || 0), 0);
    const actualFunding = combinedData.reduce((sum, m) => sum + (m.actualFunding || 0), 0);
    const actualTax = combinedData.reduce((sum, m) => sum + (m.actualTax || 0), 0);
    const forecastRevenue = combinedData.reduce((sum, m) => sum + m.forecastRevenue, 0);
    const forecastCOGS = combinedData.reduce((sum, m) => sum + (m.forecastCOGS || 0), 0);
    const forecastOperatingCosts = combinedData.reduce((sum, m) => sum + (m.forecastOperatingCosts || 0), 0);
    const forecastTax = combinedData.reduce((sum, m) => sum + (m.forecastTax || 0), 0);

    const actualGrossMargin = actualRevenue - actualCOGS;
    const forecastGrossMargin = forecastRevenue - forecastCOGS;
    const actualNetIncomeBeforeTax = actualGrossMargin - actualOperatingCosts;
    const forecastNetIncomeBeforeTax = forecastGrossMargin - forecastOperatingCosts;
    const actualNetIncome = actualNetIncomeBeforeTax - actualTax;
    const forecastNetIncome = forecastNetIncomeBeforeTax - forecastTax;
    const actualNetCashFlow = actualNetIncome + actualFunding;
    const forecastNetCashFlow = forecastNetIncome + actualFunding;

    return {
      actualRevenue,
      actualCOGS,
      actualOperatingCosts,
      actualFunding,
      actualTax,
      actualGrossMargin,
      actualNetIncomeBeforeTax,
      actualNetIncome,
      actualNetCashFlow,
      forecastRevenue,
      forecastCOGS,
      forecastOperatingCosts,
      forecastGrossMargin,
      forecastNetIncomeBeforeTax,
      forecastNetIncome,
      forecastNetCashFlow,
      varianceRevenue: actualRevenue - forecastRevenue,
      varianceNetCashFlow: actualNetCashFlow - forecastNetCashFlow,
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <MonthlyForecastOnlyChart data={monthlyForecast} type="line" />
            <MonthlyForecastOnlyChart data={monthlyForecast} type="bar" />
          </div>
          <MonthlyForecastTable 
            data={monthlyForecast} 
            year={selectedYear} 
            projectId={projectId}
            onScenarioChange={setCurrentScenarioId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}