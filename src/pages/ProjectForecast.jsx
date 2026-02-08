import React, { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Download, Plus } from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import { formatCurrency } from "@/components/shared/CurrencyFormat";

export default function ProjectForecast() {
  const { id } = useParams();
  const [years] = useState(30);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => base44.entities.Project.filter({ id }),
    select: (data) => data[0],
  });

  const { data: scenarios = [], isLoading: scenariosLoading } = useQuery({
    queryKey: ["forecastScenarios", id],
    queryFn: () => base44.entities.ForecastScenario.filter({ project_id: id }),
    enabled: !!id,
  });

  const [selectedScenario] = useState(scenarios[0]?.id || null);

  const { data: forecastPeriods = [], isLoading: periodsLoading } = useQuery({
    queryKey: ["forecastPeriods", selectedScenario],
    queryFn: () => base44.entities.ForecastPeriod.filter({ scenario_id: selectedScenario }),
    enabled: !!selectedScenario,
  });

  // Generate simple forecast data if no scenarios exist
  const forecastData = React.useMemo(() => {
    if (forecastPeriods.length > 0) return forecastPeriods;

    // Simple default forecast
    const data = [];
    const projectStartYear = project?.start_date ? new Date(project.start_date).getFullYear() : new Date().getFullYear();

    for (let year = 1; year <= years; year++) {
      const isEstablishment = year <= 3;
      const revenue = isEstablishment ? 0 : 50000 * year * 0.8; // Simplified revenue growth
      const expenses = isEstablishment ? 100000 : 20000; // High establishment costs, then maintenance

      data.push({
        year,
        period_start: `${projectStartYear + year - 1}-01-01`,
        period_end: `${projectStartYear + year - 1}-12-31`,
        projected_revenue: revenue,
        projected_expenses: expenses,
        projected_cash_flow: revenue - expenses,
        carbon_credits_generated: year > 5 ? 100 * year : 0,
        bng_habitat_units_generated: year === 3 ? 500 : 0,
      });
    }

    return data;
  }, [forecastPeriods, project, years]);

  const totals = React.useMemo(() => {
    return {
      revenue: forecastData.reduce((sum, p) => sum + (p.projected_revenue || 0), 0),
      expenses: forecastData.reduce((sum, p) => sum + (p.projected_expenses || 0), 0),
      cashFlow: forecastData.reduce((sum, p) => sum + (p.projected_cash_flow || 0), 0),
      carbon: forecastData.reduce((sum, p) => sum + (p.carbon_credits_generated || 0), 0),
      bng: forecastData.reduce((sum, p) => sum + (p.bng_habitat_units_generated || 0), 0),
    };
  }, [forecastData]);

  if (projectLoading || scenariosLoading || periodsLoading) {
    return <LoadingState />;
  }

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          <p className="text-sm text-slate-500 mt-1">30-Year Financial Forecast</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue (30yr)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totals.revenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Costs (30yr)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totals.expenses)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Net Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totals.cashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(totals.cashFlow)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Carbon Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{totals.carbon.toLocaleString()} tCO2e</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Forecast Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Revenue & Cash Flow Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs font-semibold">Year</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Revenue</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Expenses</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Net Cash Flow</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Cumulative</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Carbon (tCO2e)</TableHead>
                  <TableHead className="text-xs font-semibold text-right">BNG (units)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecastData.map((period, idx) => {
                  const cumulative = forecastData
                    .slice(0, idx + 1)
                    .reduce((sum, p) => sum + (p.projected_cash_flow || 0), 0);

                  return (
                    <TableRow key={period.year || idx}>
                      <TableCell className="font-medium">Year {period.year}</TableCell>
                      <TableCell className="text-right text-emerald-600">
                        {formatCurrency(period.projected_revenue)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(period.projected_expenses)}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          period.projected_cash_flow >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(period.projected_cash_flow)}
                      </TableCell>
                      <TableCell className={`text-right ${cumulative >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {formatCurrency(cumulative)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-500">
                        {period.carbon_credits_generated?.toLocaleString() || "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-500">
                        {period.bng_habitat_units_generated?.toLocaleString() || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-slate-50 font-semibold">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right text-emerald-600">{formatCurrency(totals.revenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.expenses)}</TableCell>
                  <TableCell className={`text-right ${totals.cashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {formatCurrency(totals.cashFlow)}
                  </TableCell>
                  <TableCell className={`text-right ${totals.cashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {formatCurrency(totals.cashFlow)}
                  </TableCell>
                  <TableCell className="text-right">{totals.carbon.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{totals.bng.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}