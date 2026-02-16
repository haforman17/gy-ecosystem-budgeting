import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { TrendingUp, TrendingDown, DollarSign, Target, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ReportExecutiveSummary({
  project,
  transactions,
  revenueStreams,
  lineItems,
  fundingSources,
  selectedYear,
  selectedScenario,
}) {
  const summary = useMemo(() => {
    // Filter transactions for selected year
    const yearTransactions = transactions.filter(t => {
      if (!t.date) return false;
      return new Date(t.date).getFullYear() === selectedYear;
    });

    // Calculate totals
    const totalRevenue = yearTransactions
      .filter(t => t.transaction_type === "REVENUE")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalExpenses = yearTransactions
      .filter(t => t.transaction_type === "EXPENSE" || t.transaction_type === "OPERATING_COST")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalCOGS = yearTransactions
      .filter(t => t.cost_type === "COGS")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const netIncome = totalRevenue - totalExpenses;
    const grossProfit = totalRevenue - totalCOGS;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Budget calculations
    const totalBudget = lineItems
      .filter(li => li.year === selectedYear.toString())
      .reduce((sum, li) => sum + (li.budget_amount || 0), 0);

    const budgetVariance = totalRevenue - totalBudget;
    const budgetVariancePercent = totalBudget > 0 ? (budgetVariance / totalBudget) * 100 : 0;

    // Funding
    const totalFunding = fundingSources.reduce((sum, fs) => sum + (fs.total_amount || 0), 0);
    const drawnFunding = fundingSources.reduce((sum, fs) => sum + (fs.drawn_amount || 0), 0);

    return {
      totalRevenue,
      totalExpenses,
      totalCOGS,
      netIncome,
      grossProfit,
      grossMargin,
      totalBudget,
      budgetVariance,
      budgetVariancePercent,
      totalFunding,
      drawnFunding,
      transactionCount: yearTransactions.length,
    };
  }, [transactions, lineItems, fundingSources, selectedYear]);

  return (
    <div className="space-y-6">
      {/* Header Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          Executive Summary for <strong>{project.name}</strong> - FY{selectedYear}
          {selectedScenario && (
            <span className="ml-2">
              | Forecast Scenario: <strong>{selectedScenario.scenario_name}</strong>
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Key Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {formatCurrency(summary.totalRevenue)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              {summary.budgetVariance >= 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">
                    +{formatCurrency(summary.budgetVariance)} vs budget
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 font-medium">
                    {formatCurrency(summary.budgetVariance)} vs budget
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Net Income</p>
                <p className={`text-2xl font-bold mt-1 ${summary.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.netIncome)}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${summary.netIncome >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {summary.netIncome >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-600">
              Gross Margin: <span className="font-semibold">{summary.grossMargin.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Budget</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {formatCurrency(summary.totalBudget)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-600">
              Variance: <span className={`font-semibold ${summary.budgetVariancePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {summary.budgetVariancePercent.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Funding Drawn</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {formatCurrency(summary.drawnFunding)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-600">
              of {formatCurrency(summary.totalFunding)} total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Narrative Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Key Highlights - FY{selectedYear}</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            {project.name} generated <strong>{formatCurrency(summary.totalRevenue)}</strong> in total revenue for FY{selectedYear}, 
            {summary.budgetVariance >= 0 ? (
              <span className="text-emerald-600"> exceeding the budget by {formatCurrency(summary.budgetVariance)} (+{summary.budgetVariancePercent.toFixed(1)}%)</span>
            ) : (
              <span className="text-red-600"> falling short of budget by {formatCurrency(Math.abs(summary.budgetVariance))} ({summary.budgetVariancePercent.toFixed(1)}%)</span>
            )}.
          </p>

          <p>
            Net income for the period reached <strong className={summary.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              {formatCurrency(summary.netIncome)}
            </strong>, with a gross margin of <strong>{summary.grossMargin.toFixed(1)}%</strong>.
          </p>

          <p>
            The project has drawn <strong>{formatCurrency(summary.drawnFunding)}</strong> from total available funding of{" "}
            <strong>{formatCurrency(summary.totalFunding)}</strong>, representing{" "}
            <strong>{summary.totalFunding > 0 ? ((summary.drawnFunding / summary.totalFunding) * 100).toFixed(1) : 0}%</strong> utilization.
          </p>

          {selectedScenario && (
            <p className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
              <strong>Forecast Scenario Active:</strong> {selectedScenario.scenario_name}
              {selectedScenario.description && ` - ${selectedScenario.description}`}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}