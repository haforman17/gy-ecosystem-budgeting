import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { Save, Download, Upload, FileSpreadsheet } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ScenarioManager from "@/components/forecast/ScenarioManager";
import * as XLSX from "xlsx";

export default function MonthlyForecastTable({ data, year, projectId }) {
  const queryClient = useQueryClient();
  const [editableData, setEditableData] = useState(data);
  const [isEditing, setIsEditing] = useState(true);
  const [currentScenarioId, setCurrentScenarioId] = useState(null);

  const { data: scenarios = [] } = useQuery({
    queryKey: ["monthlyScenarios", projectId, year],
    queryFn: () => base44.entities.ForecastScenario.filter({ 
      project_id: projectId,
      scenario_type: "MONTHLY",
      year: year 
    }),
    enabled: !!projectId,
  });

  const saveScenarioMutation = useMutation({
    mutationFn: async ({ name, data }) => {
      if (currentScenarioId) {
        return base44.entities.ForecastScenario.update(currentScenarioId, {
          scenario_data: data,
          updated_date: new Date().toISOString()
        });
      } else {
        return base44.entities.ForecastScenario.create({
          project_id: projectId,
          scenario_type: "MONTHLY",
          year: year,
          scenario_name: name,
          scenario_data: data
        });
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["monthlyScenarios"] });
      setCurrentScenarioId(result.id);
      toast.success("Scenario saved successfully");
    },
  });

  const duplicateScenarioMutation = useMutation({
    mutationFn: async (scenario) => {
      return base44.entities.ForecastScenario.create({
        project_id: projectId,
        scenario_type: "MONTHLY",
        year: year,
        scenario_name: `${scenario.scenario_name} (Copy)`,
        scenario_data: scenario.scenario_data
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["monthlyScenarios"] });
      setCurrentScenarioId(result.id);
      toast.success("Scenario duplicated successfully");
    },
  });

  const deleteScenarioMutation = useMutation({
    mutationFn: (id) => base44.entities.ForecastScenario.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthlyScenarios"] });
      setCurrentScenarioId(null);
      toast.success("Scenario deleted");
    },
  });

  React.useEffect(() => {
    setEditableData(data);
  }, [data]);

  React.useEffect(() => {
    if (currentScenarioId) {
      const scenario = scenarios.find(s => s.id === currentScenarioId);
      if (scenario && scenario.scenario_data) {
        setEditableData(scenario.scenario_data);
      }
    }
  }, [currentScenarioId, scenarios]);

  const handleCellChange = (index, field, value) => {
    const updated = [...editableData];
    updated[index][field] = parseFloat(value) || 0;
    
    const grossMargin = updated[index].forecastRevenue - (updated[index].forecastCOGS || 0);
    const netIncomeBeforeTax = grossMargin - (updated[index].forecastOperatingCosts || 0);
    const netIncome = netIncomeBeforeTax - (updated[index].forecastTax || 0);
    updated[index].forecastNetCashFlow = netIncome + (updated[index].forecastFunding || 0);
    
    setEditableData(updated);
  };

  const handleSaveScenario = (name) => {
    saveScenarioMutation.mutate({ name, data: editableData });
  };

  const handleSelectScenario = (scenarioId) => {
    setCurrentScenarioId(scenarioId);
  };

  const handleDuplicateScenario = (scenario) => {
    duplicateScenarioMutation.mutate(scenario);
  };

  const handleDeleteScenario = (id) => {
    deleteScenarioMutation.mutate(id);
  };

  const downloadTemplate = () => {
    const templateData = [
      ["Monthly Forecast Template", `Year: ${year}`],
      [],
      ["INSTRUCTIONS: Fill in the Forecast Revenue and Forecast Expenses columns only. Do not modify the Month column."],
      [],
      ["Month", "Forecast Revenue", "Forecast Expenses", "Forecast Funding", "Forecast Tax"],
      ...editableData.map((m) => [
        m.month,
        m.forecastRevenue || 0,
        m.forecastExpenses || 0,
        m.forecastFunding || 0,
        m.forecastTax || 0,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `monthly-forecast-template-${year}.xlsx`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Find the header row (should contain "Month", "Forecast Revenue", "Forecast Expenses")
      let headerRowIndex = -1;
      for (let i = 0; i < jsonData.length; i++) {
        if (jsonData[i][0] === "Month" && jsonData[i][1] === "Forecast Revenue") {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        alert("Invalid file format. Please use the template.");
        return;
      }

      // Parse data rows
      const updatedData = editableData.map((month) => {
        const matchingRow = jsonData
          .slice(headerRowIndex + 1)
          .find((row) => row[0] === month.month);

        if (matchingRow) {
          const revenue = parseFloat(matchingRow[1]) || month.forecastRevenue;
          const expenses = parseFloat(matchingRow[2]) || month.forecastExpenses;
          return {
            ...month,
            forecastRevenue: revenue,
            forecastExpenses: expenses,
            forecastNetCashFlow: revenue - expenses,
          };
        }
        return month;
      });

      setEditableData(updatedData);
      alert("Forecast data uploaded successfully!");
    } catch (error) {
      alert("Failed to process file. Please check the format and try again.");
    }

    e.target.value = "";
  };

  const exportToExcel = () => {
    const wsData = [
      ["Monthly Forecast", `Year: ${year}`],
      [],
      ["Month", "Forecast Revenue", "Forecast Expenses", "Forecast Funding", "Forecast Tax", "Net Cash Flow"],
      ...editableData.map((m) => [
        m.month,
        m.forecastRevenue,
        m.forecastExpenses,
        m.forecastFunding || 0,
        m.forecastTax || 0,
        m.forecastNetCashFlow,
      ]),
      [],
      [
        "TOTAL",
        editableData.reduce((sum, m) => sum + m.forecastRevenue, 0),
        editableData.reduce((sum, m) => sum + m.forecastExpenses, 0),
        editableData.reduce((sum, m) => sum + (m.forecastFunding || 0), 0),
        editableData.reduce((sum, m) => sum + (m.forecastTax || 0), 0),
        editableData.reduce((sum, m) => sum + m.forecastNetCashFlow, 0),
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Forecast");
    XLSX.writeFile(wb, `monthly-forecast-${year}.xlsx`);
  };

  const totals = {
    revenue: editableData.reduce((sum, m) => sum + m.forecastRevenue, 0),
    expenses: editableData.reduce((sum, m) => sum + m.forecastExpenses, 0),
    netCashFlow: editableData.reduce((sum, m) => sum + m.forecastNetCashFlow, 0),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle>Monthly Forecast - {year}</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <ScenarioManager
              scenarios={scenarios}
              currentScenarioId={currentScenarioId}
              onSelectScenario={handleSelectScenario}
              onSaveScenario={handleSaveScenario}
              onDuplicateScenario={handleDuplicateScenario}
              onDeleteScenario={handleDeleteScenario}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={downloadTemplate}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <label>
            <Button size="sm" variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Upload Template
              </span>
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <Button size="sm" variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Month</TableHead>
                <TableHead className="text-right font-semibold">Forecast Revenue</TableHead>
                <TableHead className="text-right font-semibold">Forecast Expenses</TableHead>
                <TableHead className="text-right font-semibold">Forecast Funding</TableHead>
                <TableHead className="text-right font-semibold">Forecast Tax</TableHead>
                <TableHead className="text-right font-semibold">Net Cash Flow</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableData.map((month, idx) => {
                const grossMargin = month.forecastRevenue - (month.forecastCOGS || 0);
                const netIncomeBeforeTax = grossMargin - (month.forecastOperatingCosts || 0);
                const netIncome = netIncomeBeforeTax - (month.forecastTax || 0);
                const netCashFlow = netIncome + (month.forecastFunding || 0);
                
                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{month.month}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={month.forecastRevenue}
                      onChange={(e) => handleCellChange(idx, "forecastRevenue", e.target.value)}
                      className="w-32 text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={month.forecastCOGS || 0}
                      onChange={(e) => handleCellChange(idx, "forecastCOGS", e.target.value)}
                      className="w-32 text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right text-slate-500 italic">{formatCurrency(grossMargin)}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={month.forecastOperatingCosts || 0}
                      onChange={(e) => handleCellChange(idx, "forecastOperatingCosts", e.target.value)}
                      className="w-32 text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right text-slate-500 italic">{formatCurrency(netIncomeBeforeTax)}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={month.forecastTax || 0}
                      onChange={(e) => handleCellChange(idx, "forecastTax", e.target.value)}
                      className="w-32 text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right text-slate-500 italic">{formatCurrency(netIncome)}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={month.forecastFunding || 0}
                      onChange={(e) => handleCellChange(idx, "forecastFunding", e.target.value)}
                      className="w-32 text-right"
                    />
                  </TableCell>
                  <TableCell className={`text-right font-medium italic ${netCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {formatCurrency(netCashFlow)}
                  </TableCell>
                </TableRow>
                );
              })}
              <TableRow className="bg-slate-100 font-bold border-t-2">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right text-emerald-600">{formatCurrency(totals.revenue)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.expenses)}</TableCell>
                <TableCell className="text-right text-blue-600">
                  {formatCurrency(editableData.reduce((sum, m) => sum + (m.forecastFunding || 0), 0))}
                </TableCell>
                <TableCell className="text-right text-orange-600">
                  {formatCurrency(editableData.reduce((sum, m) => sum + (m.forecastTax || 0), 0))}
                </TableCell>
                <TableCell className={`text-right ${totals.netCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(totals.netCashFlow)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}