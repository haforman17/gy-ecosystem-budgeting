import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Download, Plus, Settings, Trash2, Save, Upload, FileSpreadsheet, Calendar } from "lucide-react";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import ScenarioFormModal from "@/components/forecast/ScenarioFormModal";
import ForecastChart from "@/components/forecast/ForecastChart";
import EditableForecastTable from "@/components/forecast/EditableForecastTable";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { generateForecastPeriods, calculateFinancialMetrics } from "@/components/lib/forecastCalculations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseISO } from "date-fns";

export default function YearlyForecastTab({ projectId, project }) {
  const queryClient = useQueryClient();
  const [years] = useState(30);
  const [showScenarioForm, setShowScenarioForm] = useState(false);
  const [editingScenario, setEditingScenario] = useState(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState(null);
  const [savedPeriods, setSavedPeriods] = useState([]);

  const { data: scenarios = [] } = useQuery({
    queryKey: ["forecastScenarios", projectId],
    queryFn: () => base44.entities.ForecastScenario.filter({ project_id: projectId }),
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

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", projectId],
    queryFn: () => base44.entities.Transaction.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: fundingSources = [] } = useQuery({
    queryKey: ["fundingSources", projectId],
    queryFn: () => base44.entities.FundingSource.filter({ project_id: projectId }),
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

  const bulkUpdateMutation = useMutation({
    mutationFn: async (periods) => {
      const promises = periods.map((period) =>
        base44.entities.ForecastPeriod.update(period.id, period)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forecastPeriods"] });
      toast.success("Forecast updated from file");
    },
  });

  const downloadTemplate = () => {
    const templateData = forecastData.map((period) => ({
      Year: period.year,
      Revenue: period.projected_revenue || 0,
      Expenses: period.projected_expenses || 0,
      "Carbon Credits": period.carbon_credits_generated || 0,
      "BNG Units": period.bng_habitat_units_generated || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Forecast");
    XLSX.writeFile(wb, `${project?.name || "Project"}_Forecast_Template.xlsx`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (savedPeriods.length === 0) {
        toast.error("Please save the forecast first before uploading updates");
        return;
      }

      const updatedPeriods = savedPeriods.map((period) => {
        const row = jsonData.find((r) => r.Year === period.year);
        if (row) {
          return {
            ...period,
            projected_revenue: Number(row.Revenue) || period.projected_revenue,
            projected_expenses: Number(row.Expenses) || period.projected_expenses,
            projected_cash_flow: (Number(row.Revenue) || 0) - (Number(row.Expenses) || 0),
            carbon_credits_generated: Number(row["Carbon Credits"]) || period.carbon_credits_generated,
            bng_habitat_units_generated: Number(row["BNG Units"]) || period.bng_habitat_units_generated,
          };
        }
        return period;
      });

      bulkUpdateMutation.mutate(updatedPeriods);
    } catch (error) {
      toast.error("Failed to process file. Please check the format.");
    }

    e.target.value = "";
  };

  const forecastData = React.useMemo(() => {
    if (!project || !revenueStreams || !lineItems) return [];

    let periods = [];

    if (savedPeriods.length > 0) {
      periods = savedPeriods;
    } else if (selectedScenario && selectedScenario.assumptions) {
      periods = generateForecastPeriods(
        revenueStreams,
        lineItems,
        selectedScenario.assumptions,
        project.start_date,
        years
      );
    } else {
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

      periods = generateForecastPeriods(revenueStreams, lineItems, defaultAssumptions, project.start_date, years);
    }

    const startYear = new Date(project.start_date).getFullYear();
    
    return periods
      .sort((a, b) => (a.year || 0) - (b.year || 0))
      .map(p => ({
        ...p,
        calendarYear: startYear + (p.year - 1)
      }));
  }, [project, revenueStreams, lineItems, selectedScenario, years, savedPeriods]);

  // Calculate yearly actuals from transactions
  const yearlyActuals = React.useMemo(() => {
    if (!project) return [];
    
    const startYear = new Date(project.start_date).getFullYear();
    const currentYear = new Date().getFullYear();
    const yearsArray = [];
    
    for (let calendarYear = startYear; calendarYear <= currentYear; calendarYear++) {
      const yearTransactions = transactions.filter((t) => {
        const tYear = new Date(t.date).getFullYear();
        return tYear === calendarYear;
      });

      const revenue = yearTransactions
        .filter((t) => t.transaction_type === "REVENUE")
        .reduce((sum, t) => sum + t.amount, 0);

      const cogs = yearTransactions
        .filter((t) => t.transaction_type === "COGS")
        .reduce((sum, t) => sum + t.amount, 0);

      const operatingCosts = yearTransactions
        .filter((t) => t.transaction_type === "OPERATING_COST")
        .reduce((sum, t) => sum + t.amount, 0);

      const funding = yearTransactions
        .filter((t) => t.transaction_type === "FUNDING_DRAWDOWN")
        .reduce((sum, t) => sum + t.amount, 0);

      const tax = yearTransactions
        .filter((t) => t.transaction_type === "TAX_PAYMENT")
        .reduce((sum, t) => sum + t.amount, 0);

      const grossMargin = revenue - cogs;
      const netIncomeBeforeTax = grossMargin - operatingCosts;
      const netIncome = netIncomeBeforeTax - tax;
      const netCashFlow = netIncome + funding;

      yearsArray.push({
        calendarYear: calendarYear,
        actualRevenue: revenue,
        actualCOGS: cogs,
        actualOperatingCosts: operatingCosts,
        actualFunding: funding,
        actualTax: tax,
        actualGrossMargin: grossMargin,
        actualNetIncomeBeforeTax: netIncomeBeforeTax,
        actualNetIncome: netIncome,
        actualNetCashFlow: netCashFlow,
      });
    }
    
    return yearsArray;
  }, [transactions, project]);

  // Combine forecast and actuals - add calendar year to forecast data
  const combinedData = React.useMemo(() => {
    if (!project) return [];
    
    const startYear = new Date(project.start_date).getFullYear();
    
    return forecastData.map((forecast) => {
      const calendarYear = startYear + (forecast.year - 1);
      const actual = yearlyActuals.find((a) => a.calendarYear === calendarYear) || {
        actualRevenue: 0,
        actualExpenses: 0,
        actualFunding: 0,
        actualNetCashFlow: 0,
      };
      
      return {
        ...forecast,
        calendarYear: calendarYear,
        ...actual,
        varianceRevenue: actual.actualRevenue - (forecast.projected_revenue || 0),
        varianceExpenses: actual.actualExpenses - (forecast.projected_expenses || 0),
        varianceNetCashFlow: actual.actualNetCashFlow - (forecast.projected_cash_flow || 0),
      };
    });
  }, [forecastData, yearlyActuals, project]);

  const totals = React.useMemo(() => {
    const revenue = forecastData.reduce((sum, p) => sum + (p.projected_revenue || 0), 0);
    const expenses = forecastData.reduce((sum, p) => sum + (p.projected_expenses || 0), 0);
    const cashFlow = revenue - expenses;
    const carbon = forecastData.reduce((sum, p) => sum + (p.carbon_credits_generated || 0), 0);
    const bng = forecastData.reduce((sum, p) => sum + (p.bng_habitat_units_generated || 0), 0);

    const actualRevenue = combinedData.reduce((sum, p) => sum + (p.actualRevenue || 0), 0);
    const actualExpenses = combinedData.reduce((sum, p) => sum + (p.actualExpenses || 0), 0);
    const actualNetCashFlow = combinedData.reduce((sum, p) => sum + (p.actualNetCashFlow || 0), 0);

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
      actualRevenue,
      actualExpenses,
      actualNetCashFlow,
      varianceRevenue: actualRevenue - revenue,
      varianceExpenses: actualExpenses - expenses,
      varianceNetCashFlow: actualNetCashFlow - cashFlow,
      ...metrics,
    };
  }, [forecastData, selectedScenario, combinedData]);

  return (
    <div className="space-y-6">
      {/* Scenario Controls */}
      <div className="flex items-center justify-between gap-3">
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
        <div className="flex items-center gap-2">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Forecast Revenue (30yr)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(totals.revenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Actual Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(totals.actualRevenue)}</p>
            <p className={`text-sm mt-1 ${totals.varianceRevenue >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {totals.varianceRevenue >= 0 ? "+" : ""}
              {formatCurrency(totals.varianceRevenue)} variance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Forecast Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(totals.expenses)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Actual Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(totals.actualExpenses)}</p>
            <p className={`text-sm mt-1 ${totals.varianceExpenses <= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {totals.varianceExpenses >= 0 ? "+" : ""}
              {formatCurrency(totals.varianceExpenses)} variance
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
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ForecastChart forecastData={combinedData} type="line" showActuals />
            <ForecastChart forecastData={combinedData} type="bar" showActuals />
          </div>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Forecast vs Actuals Comparison
                </CardTitle>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Year</TableHead>
                      <TableHead className="text-right font-semibold">Forecast Revenue</TableHead>
                      <TableHead className="text-right font-semibold">Actual Revenue</TableHead>
                      <TableHead className="text-right font-semibold">Variance</TableHead>
                      <TableHead className="text-right font-semibold">Forecast COGS</TableHead>
                      <TableHead className="text-right font-semibold">Actual COGS</TableHead>
                      <TableHead className="text-right font-semibold">Forecast Gross Margin</TableHead>
                      <TableHead className="text-right font-semibold">Actual Gross Margin</TableHead>
                      <TableHead className="text-right font-semibold">Forecast Op Costs</TableHead>
                      <TableHead className="text-right font-semibold">Actual Op Costs</TableHead>
                      <TableHead className="text-right font-semibold">Forecast NI Before Tax</TableHead>
                      <TableHead className="text-right font-semibold">Actual NI Before Tax</TableHead>
                      <TableHead className="text-right font-semibold">Actual Tax</TableHead>
                      <TableHead className="text-right font-semibold">Forecast Net Income</TableHead>
                      <TableHead className="text-right font-semibold">Actual Net Income</TableHead>
                      <TableHead className="text-right font-semibold">Actual Funding</TableHead>
                      <TableHead className="text-right font-semibold">Forecast Net CF</TableHead>
                      <TableHead className="text-right font-semibold">Actual Net CF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combinedData.map((item, idx) => {
                      const forecastCOGS = item.projected_cogs || 0;
                      const actualCOGS = item.actualCOGS || 0;
                      const forecastGrossMargin = (item.projected_revenue || 0) - forecastCOGS;
                      const actualGrossMargin = (item.actualRevenue || 0) - actualCOGS;
                      const forecastOpCosts = item.projected_operating_costs || 0;
                      const actualOpCosts = item.actualOperatingCosts || 0;
                      const forecastNIBeforeTax = forecastGrossMargin - forecastOpCosts;
                      const actualNIBeforeTax = actualGrossMargin - actualOpCosts;
                      const forecastTax = item.projected_tax || 0;
                      const actualTax = item.actualTax || 0;
                      const forecastNetIncome = forecastNIBeforeTax - forecastTax;
                      const actualNetIncome = actualNIBeforeTax - actualTax;
                      const forecastNetCF = forecastNetIncome + (item.actualFunding || 0);
                      const actualNetCF = actualNetIncome + (item.actualFunding || 0);
                      
                      return (
                        <TableRow key={idx} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{item.calendarYear}</TableCell>
                          <TableCell className="text-right text-slate-600">{formatCurrency(item.projected_revenue || 0)}</TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium">{formatCurrency(item.actualRevenue || 0)}</TableCell>
                          <TableCell className={`text-right ${(item.varianceRevenue || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {(item.varianceRevenue || 0) >= 0 ? "+" : ""}{formatCurrency(item.varianceRevenue || 0)}
                          </TableCell>
                          <TableCell className="text-right text-slate-600">{formatCurrency(forecastCOGS)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(actualCOGS)}</TableCell>
                          <TableCell className="text-right text-slate-500 italic">{formatCurrency(forecastGrossMargin)}</TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium italic">{formatCurrency(actualGrossMargin)}</TableCell>
                          <TableCell className="text-right text-slate-600">{formatCurrency(forecastOpCosts)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(actualOpCosts)}</TableCell>
                          <TableCell className="text-right text-slate-500 italic">{formatCurrency(forecastNIBeforeTax)}</TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium italic">{formatCurrency(actualNIBeforeTax)}</TableCell>
                          <TableCell className="text-right text-orange-600 font-medium">{formatCurrency(actualTax)}</TableCell>
                          <TableCell className="text-right text-slate-500 italic">{formatCurrency(forecastNetIncome)}</TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium italic">{formatCurrency(actualNetIncome)}</TableCell>
                          <TableCell className="text-right text-blue-600 font-medium">{formatCurrency(item.actualFunding || 0)}</TableCell>
                          <TableCell className="text-right text-slate-500 italic">{formatCurrency(forecastNetCF)}</TableCell>
                          <TableCell className={`text-right font-medium italic ${actualNetCF >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(actualNetCF)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ForecastChart forecastData={forecastData} type="line" />
            <ForecastChart forecastData={forecastData} type="bar" />
          </div>

          {/* Table */}
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
            <div className="flex gap-2">
              {forecastData.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  {savedPeriods.length > 0 && (
                    <label>
                      <Button variant="outline" size="sm" disabled={bulkUpdateMutation.isPending} asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {bulkUpdateMutation.isPending ? "Uploading..." : "Upload File"}
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </>
              )}
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
          </div>
        </CardHeader>
        <CardContent>
          <EditableForecastTable
            forecastData={forecastData}
            onUpdatePeriod={(period) => {
              if (savedPeriods.length > 0) {
                updatePeriodMutation.mutate(period);
              } else {
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
        </TabsContent>
      </Tabs>

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