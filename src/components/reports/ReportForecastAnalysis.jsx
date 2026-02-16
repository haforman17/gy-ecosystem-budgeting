import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { formatCurrency } from "@/components/shared/CurrencyFormat";

export default function ReportForecastAnalysis({
  project,
  selectedScenario,
  forecastHorizon,
  transactions,
  revenueStreams,
}) {
  const forecastData = useMemo(() => {
    if (!selectedScenario || !selectedScenario.scenario_data) {
      return null;
    }

    const data = selectedScenario.scenario_data;
    
    const totalProjectedRevenue = data.reduce((sum, period) => sum + (period.projected_revenue || 0), 0);
    const totalProjectedExpenses = data.reduce((sum, period) => sum + (period.projected_expenses || 0), 0);
    const totalProjectedCashFlow = data.reduce((sum, period) => sum + (period.projected_cash_flow || 0), 0);

    return {
      totalProjectedRevenue,
      totalProjectedExpenses,
      totalProjectedCashFlow,
      periods: data,
    };
  }, [selectedScenario]);

  if (!selectedScenario) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please select a forecast scenario from the configuration panel above.
        </AlertDescription>
      </Alert>
    );
  }

  if (!forecastData) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No forecast data available for the selected scenario.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Forecast Analysis - {selectedScenario.scenario_name}</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {forecastHorizon === "YEARLY_30YR" && "30-Year Projection"}
            {forecastHorizon === "QUARTERLY" && "Quarterly Forecast"}
            {forecastHorizon === "MONTHLY" && "Monthly Forecast"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Total Projected Revenue</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(forecastData.totalProjectedRevenue)}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Total Projected Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(forecastData.totalProjectedExpenses)}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Net Cash Flow</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(forecastData.totalProjectedCashFlow)}
              </p>
            </div>
          </div>

          {selectedScenario.assumptions && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Key Assumptions:</h4>
              <pre className="text-xs text-slate-600 whitespace-pre-wrap">
                {JSON.stringify(selectedScenario.assumptions, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}