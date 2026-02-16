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
import QuarterlyForecastOnlyChart from "@/components/forecast/QuarterlyForecastOnlyChart";
import { startOfYear, endOfYear, startOfQuarter, endOfQuarter, eachQuarterOfInterval, parseISO } from "date-fns";

export default function QuarterlyForecastTab({ projectId, project }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [forecastYears, setForecastYears] = useState(1);
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
    queryKey: ["quarterlyScenarios", projectId, selectedYear],
    queryFn: () => base44.entities.ForecastScenario.filter({ 
      project_id: projectId,
      scenario_type: "QUARTERLY",
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

  const quarterlyActuals = React.useMemo(() => {
    const endYear = selectedYear + forecastYears - 1;
    const quarters = eachQuarterOfInterval({
      start: startOfYear(new Date(selectedYear, 0, 1)),
      end: endOfYear(new Date(endYear, 11, 31)),
    });

    return quarters.map((quarterDate) => {
      const qStart = startOfQuarter(quarterDate);
      const qEnd = endOfQuarter(quarterDate);
      
      const quarterTransactions = transactions.filter((t) => {
        const tDate = parseISO(t.date);
        return tDate >= qStart && tDate <= qEnd;
      });

      const revenue = quarterTransactions
        .filter((t) => t.transaction_type === "REVENUE")
        .reduce((sum, t) => sum + t.amount, 0);

      const cogs = quarterTransactions
        .filter((t) => t.transaction_type === "COGS")
        .reduce((sum, t) => sum + t.amount, 0);

      const operatingCosts = quarterTransactions
        .filter((t) => t.transaction_type === "OPERATING_COST")
        .reduce((sum, t) => sum + t.amount, 0);

      const funding = quarterTransactions
        .filter((t) => t.transaction_type === "FUNDING_DRAWDOWN")
        .reduce((sum, t) => sum + t.amount, 0);

      const tax = quarterTransactions
        .filter((t) => t.transaction_type === "TAX_PAYMENT")
        .reduce((sum, t) => sum + t.amount, 0);

      const year = quarterDate.getFullYear();
      const quarterNum = Math.floor((quarterDate.getMonth()) / 3) + 1;

      const grossMargin = revenue - cogs;
      const netIncomeBeforeTax = grossMargin - operatingCosts;
      const netIncome = netIncomeBeforeTax - tax;
      const netCashFlow = netIncome + funding;

      return {
        quarter: `Q${quarterNum} ${year}`,
        quarterDate: quarterDate,
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
  }, [transactions, selectedYear, forecastYears]);

  const quarterlyForecast = React.useMemo(() => {
    const endYear = selectedYear + forecastYears - 1;
    const quarters = eachQuarterOfInterval({
      start: startOfYear(new Date(selectedYear, 0, 1)),
      end: endOfYear(new Date(endYear, 11, 31)),
    });

    const selectedScenario = scenarios.find(s => s.id === currentScenarioId);
    
    if (selectedScenario && selectedScenario.scenario_data && Array.isArray(selectedScenario.scenario_data)) {
      return selectedScenario.scenario_data.map(item => ({
        quarter: item.quarter,
        quarterDate: item.quarterDate,
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

    return quarters.map((quarterDate, idx) => {
      const year = quarterDate.getFullYear();
      const quarterNum = Math.floor((quarterDate.getMonth()) / 3) + 1;
      return {
        quarter: `Q${quarterNum} ${year}`,
        quarterDate: quarterDate,
        forecastRevenue: Math.round(annualRevenue / 4),
        forecastCOGS: 0,
        forecastOperatingCosts: Math.round(annualExpenses / 4),
        forecastTax: 0,
        forecastFunding: 0,
      };
    });
  }, [revenueStreams, lineItems, selectedYear, forecastYears, scenarios, currentScenarioId]);

  const combinedData = React.useMemo(() => {
    return quarterlyActuals.map((actual, idx) => {
      const forecast = quarterlyForecast[idx] || {};
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
  }, [quarterlyActuals, quarterlyForecast]);

  const yearTotals = React.useMemo(() => {
    const actualRevenue = combinedData.reduce((sum, q) => sum + q.actualRevenue, 0);
    const actualCOGS = combinedData.reduce((sum, q) => sum + (q.actualCOGS || 0), 0);
    const actualOperatingCosts = combinedData.reduce((sum, q) => sum + (q.actualOperatingCosts || 0), 0);
    const actualFunding = combinedData.reduce((sum, q) => sum + (q.actualFunding || 0), 0);
    const actualTax = combinedData.reduce((sum, q) => sum + (q.actualTax || 0), 0);
    const forecastRevenue = combinedData.reduce((sum, q) => sum + q.forecastRevenue, 0);
    const forecastCOGS = combinedData.reduce((sum, q) => sum + (q.forecastCOGS || 0), 0);
    const forecastOperatingCosts = combinedData.reduce((sum, q) => sum + (q.forecastOperatingCosts || 0), 0);
    const forecastTax = combinedData.reduce((sum, q) => sum + (q.forecastTax || 0), 0);

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <QuarterlyForecastOnlyChart data={quarterlyForecast} type="line" />
            <QuarterlyForecastOnlyChart data={quarterlyForecast} type="bar" />
          </div>
          <QuarterlyForecastTable 
            data={quarterlyForecast} 
            year={selectedYear} 
            projectId={projectId}
            onScenarioChange={setCurrentScenarioId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}