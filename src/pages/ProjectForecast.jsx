import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Download, Plus, Settings, Trash2, Save } from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import ScenarioFormModal from "@/components/forecast/ScenarioFormModal";
import ForecastChart from "@/components/forecast/ForecastChart";
import EditableForecastTable from "@/components/forecast/EditableForecastTable";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { generateForecastPeriods, calculateFinancialMetrics } from "@/components/lib/forecastCalculations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ProjectForecast() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");
  const [years] = useState(30);
  const [showScenarioForm, setShowScenarioForm] = useState(false);
  const [editingScenario, setEditingScenario] = useState(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState(null);
  const [savedPeriods, setSavedPeriods] = useState([]);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }),
    select: (data) => data[0],
    enabled: !!projectId,
  });

  const { data: scenarios = [], isLoading: scenariosLoading } = useQuery({
    queryKey: ["forecastScenarios", projectId],
    queryFn: () => base44.entities.ForecastScenario.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: revenueStreams = [], isLoading: revenueLoading } = useQuery({
    queryKey: ["revenueStreams", projectId],
    queryFn: () => base44.entities.RevenueStream.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: lineItems = [], isLoading: lineItemsLoading } = useQuery({
    queryKey: ["lineItems", projectId],
    queryFn: () => base44.entities.LineItem.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  React.useEffect(() => {
    if (scenarios.length > 0 && !selectedScenarioId) {
      setSelectedScenarioId(scenarios[0].id);
    }
  }, [scenarios, selectedScenarioId]);

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);

  const { data: forecastPeriods = [] } = useQuery({
    queryKey: ["forecastPeriods", selectedScenarioId],
    queryFn: () => base44.entities.ForecastPeriod.filter({ scenario_id: selectedScenarioId }),
    enabled: !!selectedScenarioId,
  });

  React.useEffect(() => {
    setSavedPeriods(forecastPeriods);
  }, [forecastPeriods]);

  const saveForecastMutation = useMutation({
    mutationFn: async (periods) => {
      const promises = periods.map((period) =>
        base44.entities.ForecastPeriod.create({ ...period, scenario_id: selectedScenarioId })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forecastPeriods"] });
      toast.success("Forecast saved");
    },
  });

  const updatePeriodMutation = useMutation({
    mutationFn: async (period) => {
      return base44.entities.ForecastPeriod.update(period.id, {
        projected_revenue: period.projected_revenue,
        projected_expenses: period.projected_expenses,
        projected_cash_flow: period.projected_revenue - period.projected_expenses,
        carbon_credits_generated: period.carbon_credits_generated,
        bng_habitat_units_generated: period.bng_habitat_units_generated,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forecastPeriods"] });
      toast.success("Period updated");
    },
  });

  const deleteScenarioMutation = useMutation({
    mutationFn: (id) => base44.entities.ForecastScenario.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forecastScenarios"] });
      toast.success("Scenario deleted");
      setShowDeleteDialog(false);
      setScenarioToDelete(null);
      if (selectedScenarioId === scenarioToDelete) {
        setSelectedScenarioId(null);
      }
    },
  });

  const forecastData = React.useMemo(() => {
    if (!project || !revenueStreams || !lineItems) return [];

    // If we have saved periods, use those
    if (savedPeriods.length > 0) {
      return savedPeriods;
    }

    // Otherwise generate from assumptions
    if (selectedScenario && selectedScenario.assumptions) {
      return generateForecastPeriods(
        revenueStreams,
        lineItems,
        selectedScenario.assumptions,
        project.start_date,
        years
      );
    }

    // Default scenario if none selected
    const defaultAssumptions = {
      carbon_price: 25,
      bng_habitat_price: 42000,
      bng_hedgerow_price: 28000,
      watercourse_price: 35000,
      nfm_price: 15000,
      price_escalation_rate: 0.03,
      maintenance_cost_increase: 0.02,
      establishment_success_rate: 0.95,
      annual_mortality_rate: 0.01,
      discount_rate: 0.05,
    };

    return generateForecastPeriods(revenueStreams, lineItems, defaultAssumptions, project.start_date, years);
  }, [project, revenueStreams, lineItems, selectedScenario, years, savedPeriods]);

  const totals = React.useMemo(() => {
    const revenue = forecastData.reduce((sum, p) => sum + (p.projected_revenue || 0), 0);
    const expenses = forecastData.reduce((sum, p) => sum + (p.projected_expenses || 0), 0);
    const cashFlow = revenue - expenses;
    const carbon = forecastData.reduce((sum, p) => sum + (p.carbon_credits_generated || 0), 0);
    const bng = forecastData.reduce((sum, p) => sum + (p.bng_habitat_units_generated || 0), 0);

    const metrics = calculateFinancialMetrics(
      forecastData,
      selectedScenario?.assumptions?.discount_rate || 0.05
    );

    return {
      revenue,
      expenses,
      cashFlow,
      carbon,
      bng,
      ...metrics,
    };
  }, [forecastData, selectedScenario]);

  if (projectLoading || scenariosLoading || revenueLoading || lineItemsLoading) {
    return <LoadingState />;
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Project not found</p>
      </div>
    );
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
          {scenarios.length > 0 && (
            <Select value={selectedScenarioId || ""} onValueChange={setSelectedScenarioId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select scenario" />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.scenario_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selectedScenario && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingScenario(selectedScenario);
                  setShowScenarioForm(true);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500"
                onClick={() => {
                  setScenarioToDelete(selectedScenario.id);
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setEditingScenario(null);
              setShowScenarioForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl(`ProjectDetail?id=${projectId}`))}>
            Back to Project
          </Button>
        </div>
      </div>

      {selectedScenario && (
        <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{selectedScenario.scenario_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">{selectedScenario.description || "No description"}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Carbon:</span>{" "}
                <span className="font-medium">£{selectedScenario.assumptions?.carbon_price}/tCO2e</span>
              </div>
              <div>
                <span className="text-slate-500">Escalation:</span>{" "}
                <span className="font-medium">{((selectedScenario.assumptions?.price_escalation_rate || 0) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">NPV / IRR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(totals.npv)}</p>
            {totals.irr && <p className="text-sm text-slate-500">{(totals.irr * 100).toFixed(1)}% IRR</p>}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ForecastChart forecastData={forecastData} type="line" />
        <ForecastChart forecastData={forecastData} type="bar" />
      </div>

      {/* Revenue Forecast Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Revenue & Cash Flow Forecast
              {savedPeriods.length > 0 && (
                <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  Saved
                </span>
              )}
            </CardTitle>
            {selectedScenarioId && savedPeriods.length === 0 && forecastData.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveForecastMutation.mutate(forecastData)}
                disabled={saveForecastMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveForecastMutation.isPending ? "Saving..." : "Save Forecast"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <EditableForecastTable
            forecastData={forecastData}
            onUpdatePeriod={(period) => {
              if (savedPeriods.length > 0) {
                updatePeriodMutation.mutate(period);
              } else {
                // Update local forecast data
                const updated = forecastData.map(p => 
                  p.year === period.year ? { ...p, ...period, projected_cash_flow: period.projected_revenue - period.projected_expenses } : p
                );
                setSavedPeriods(updated);
              }
            }}
          />
          
          <Table className="mt-4">
            <TableBody>
              <TableRow className="bg-slate-50 font-semibold border-t-2">
                <TableCell className="w-20">TOTAL</TableCell>
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
                <TableCell className="w-24"></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ScenarioFormModal
        open={showScenarioForm}
        onOpenChange={setShowScenarioForm}
        projectId={projectId}
        scenario={editingScenario}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Scenario"
        description="Are you sure you want to delete this forecast scenario? This cannot be undone."
        onConfirm={() => deleteScenarioMutation.mutate(scenarioToDelete)}
        destructive
      />
    </div>
  );
}