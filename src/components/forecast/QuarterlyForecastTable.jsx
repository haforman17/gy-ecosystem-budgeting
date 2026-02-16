import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { Save, Download, Upload, FileSpreadsheet } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ScenarioManager from "@/components/forecast/ScenarioManager";
import * as XLSX from "xlsx";

export default function QuarterlyForecastTable({ data, year, projectId }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(true);
  const [editableData, setEditableData] = useState(data);
  const [currentScenarioId, setCurrentScenarioId] = useState(null);

  const { data: scenarios = [] } = useQuery({
    queryKey: ["quarterlyScenarios", projectId, year],
    queryFn: () => base44.entities.ForecastScenario.filter({ 
      project_id: projectId,
      scenario_type: "QUARTERLY",
      year: year 
    }),
    enabled: !!projectId,
  });

  const saveScenarioMutation = useMutation({
    mutationFn: async ({ name, data }) => {
      const cleanedData = data.map(item => ({
        quarter: item.quarter,
        quarterDate: item.quarterDate,
        forecastRevenue: item.forecastRevenue || 0,
        forecastCOGS: item.forecastCOGS || 0,
        forecastOperatingCosts: item.forecastOperatingCosts || 0,
        forecastTax: item.forecastTax || 0,
        forecastFunding: item.forecastFunding || 0,
      }));

      if (currentScenarioId) {
        return base44.entities.ForecastScenario.update(currentScenarioId, {
          scenario_data: cleanedData
        });
      } else {
        return base44.entities.ForecastScenario.create({
          project_id: projectId,
          scenario_type: "QUARTERLY",
          year: year,
          scenario_name: name,
          scenario_data: cleanedData
        });
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["quarterlyScenarios", projectId, year] });
      setCurrentScenarioId(result.id);
      toast.success(currentScenarioId ? "Scenario updated successfully" : "Scenario saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save scenario: " + error.message);
    }
  });

  const duplicateScenarioMutation = useMutation({
    mutationFn: async (scenario) => {
      return base44.entities.ForecastScenario.create({
        project_id: projectId,
        scenario_type: "QUARTERLY",
        year: year,
        scenario_name: `${scenario.scenario_name} (Copy)`,
        scenario_data: scenario.scenario_data
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["quarterlyScenarios", projectId, year] });
      setCurrentScenarioId(result.id);
      toast.success("Scenario duplicated successfully");
    },
    onError: (error) => {
      toast.error("Failed to duplicate scenario: " + error.message);
    }
  });

  const deleteScenarioMutation = useMutation({
    mutationFn: (id) => base44.entities.ForecastScenario.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quarterlyScenarios", projectId, year] });
      setCurrentScenarioId(null);
      setEditableData(data);
      toast.success("Scenario deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete scenario: " + error.message);
    }
  });

  React.useEffect(() => {
    if (!currentScenarioId) {
      setEditableData(data);
    }
  }, [data, currentScenarioId]);

  React.useEffect(() => {
    if (currentScenarioId) {
      const scenario = scenarios.find(s => s.id === currentScenarioId);
      if (scenario && scenario.scenario_data && Array.isArray(scenario.scenario_data)) {
        setEditableData(scenario.scenario_data);
      }
    }
  }, [currentScenarioId, scenarios]);

  const handleChange = (index, field, value) => {
    const newData = [...editableData];
    newData[index][field] = parseFloat(value) || 0;
    
    const grossMargin = newData[index].forecastRevenue - (newData[index].forecastCOGS || 0);
    const netIncomeBeforeTax = grossMargin - (newData[index].forecastOperatingCosts || 0);
    const netIncome = netIncomeBeforeTax - (newData[index].forecastTax || 0);
    newData[index].forecastNetCashFlow = netIncome + (newData[index].forecastFunding || 0);
    
    setEditableData(newData);
  };

  const handleSaveScenario = (name) => {
    saveScenarioMutation.mutate({ name, data: editableData });
  };

  const handleSelectScenario = (scenarioId) => {
    if (!scenarioId) {
      setCurrentScenarioId(null);
      setEditableData(data);
      return;
    }
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
      ["Quarterly Forecast Template", `Year: ${year}`],
      [],
      ["INSTRUCTIONS: Fill in the Forecast Revenue and Forecast Expenses columns only. Do not modify the Quarter column."],
      [],
      ["Quarter", "Forecast Revenue", "Forecast COGS", "Forecast Gross Margin", "Forecast Operating Costs", "Forecast Net Income Before Tax", "Forecast Tax", "Forecast Net Income", "Forecast Funding", "Forecast Net Cash Flow"],
      ...editableData.map((q) => [
        q.quarter,
        q.forecastRevenue || "",
        q.forecastCOGS || "",
        q.forecastOperatingCosts || "",
        q.forecastTax || "",
        q.forecastFunding || "",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    ws['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `quarterly-forecast-template-${year}.xlsx`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let headerRowIndex = -1;
      for (let i = 0; i < jsonData.length; i++) {
        if (jsonData[i][0] === "Quarter" && jsonData[i][1] === "Forecast Revenue") {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        toast.error("Invalid file format. Please use the downloaded template.");
        e.target.value = "";
        return;
      }

      const updatedData = editableData.map((quarter) => {
        const matchingRow = jsonData
          .slice(headerRowIndex + 1)
          .find((row) => row[0] === quarter.quarter);

        if (matchingRow) {
          return {
            ...quarter,
            forecastRevenue: parseFloat(matchingRow[1]) || quarter.forecastRevenue,
            forecastCOGS: parseFloat(matchingRow[2]) || (quarter.forecastCOGS || 0),
            forecastOperatingCosts: parseFloat(matchingRow[3]) || (quarter.forecastOperatingCosts || 0),
            forecastTax: parseFloat(matchingRow[4]) || (quarter.forecastTax || 0),
            forecastFunding: parseFloat(matchingRow[5]) || (quarter.forecastFunding || 0),
          };
        }
        return quarter;
      });

      setEditableData(updatedData);
      toast.success("Forecast data uploaded successfully!");
    } catch (error) {
      toast.error("Failed to process file. Please check the format and try again.");
    }

    e.target.value = "";
  };

  const exportToExcel = () => {
    const wsData = [
      ["Quarterly Forecast", `Year: ${year}`],
      [],
      ["Quarter", "Forecast Revenue", "Forecast COGS", "Forecast Gross Margin", "Forecast Operating Costs", "Forecast Net Income Before Tax", "Forecast Tax", "Forecast Net Income", "Forecast Funding", "Forecast Net Cash Flow"],
      ...editableData.map((q) => {
        const grossMargin = q.forecastRevenue - (q.forecastCOGS || 0);
        const netIncomeBeforeTax = grossMargin - (q.forecastOperatingCosts || 0);
        const netIncome = netIncomeBeforeTax - (q.forecastTax || 0);
        const netCashFlow = netIncome + (q.forecastFunding || 0);
        return [
          q.quarter,
          q.forecastRevenue,
          q.forecastCOGS || 0,
          grossMargin,
          q.forecastOperatingCosts || 0,
          netIncomeBeforeTax,
          q.forecastTax || 0,
          netIncome,
          q.forecastFunding || 0,
          netCashFlow,
        ];
      }),
      [],
      (() => {
        const totalRevenue = editableData.reduce((sum, q) => sum + q.forecastRevenue, 0);
        const totalCOGS = editableData.reduce((sum, q) => sum + (q.forecastCOGS || 0), 0);
        const totalOpCosts = editableData.reduce((sum, q) => sum + (q.forecastOperatingCosts || 0), 0);
        const totalTax = editableData.reduce((sum, q) => sum + (q.forecastTax || 0), 0);
        const totalFunding = editableData.reduce((sum, q) => sum + (q.forecastFunding || 0), 0);
        return [
          "TOTAL",
          totalRevenue,
          totalCOGS,
          totalOpCosts,
          totalTax,
          totalFunding,
        ];
      })(),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quarterly Forecast");
    XLSX.writeFile(wb, `quarterly-forecast-${year}.xlsx`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle>Quarterly Forecast - {year}</CardTitle>
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
                <TableHead className="font-semibold">Quarter</TableHead>
                <TableHead className="text-right font-semibold">Revenue</TableHead>
                <TableHead className="text-right font-semibold">COGS</TableHead>
                <TableHead className="text-right font-semibold">Gross Margin</TableHead>
                <TableHead className="text-right font-semibold">Op Costs</TableHead>
                <TableHead className="text-right font-semibold">NI Before Tax</TableHead>
                <TableHead className="text-right font-semibold">Tax</TableHead>
                <TableHead className="text-right font-semibold">Net Income</TableHead>
                <TableHead className="text-right font-semibold">Funding</TableHead>
                <TableHead className="text-right font-semibold">Net Cash Flow</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableData.map((quarter, idx) => {
                const grossMargin = quarter.forecastRevenue - (quarter.forecastCOGS || 0);
                const netIncomeBeforeTax = grossMargin - (quarter.forecastOperatingCosts || 0);
                const netIncome = netIncomeBeforeTax - (quarter.forecastTax || 0);
                const netCashFlow = netIncome + (quarter.forecastFunding || 0);
                
                return (
                  <TableRow key={idx} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{quarter.quarter}</TableCell>
                    <TableCell className="text-right">
                      <Input type="number" value={quarter.forecastRevenue} onChange={(e) => handleChange(idx, "forecastRevenue", e.target.value)} className="w-32 text-right" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input type="number" value={quarter.forecastCOGS || 0} onChange={(e) => handleChange(idx, "forecastCOGS", e.target.value)} className="w-32 text-right" />
                    </TableCell>
                    <TableCell className="text-right text-slate-500 italic">{formatCurrency(grossMargin)}</TableCell>
                    <TableCell className="text-right">
                      <Input type="number" value={quarter.forecastOperatingCosts || 0} onChange={(e) => handleChange(idx, "forecastOperatingCosts", e.target.value)} className="w-32 text-right" />
                    </TableCell>
                    <TableCell className="text-right text-slate-500 italic">{formatCurrency(netIncomeBeforeTax)}</TableCell>
                    <TableCell className="text-right">
                      <Input type="number" value={quarter.forecastTax || 0} onChange={(e) => handleChange(idx, "forecastTax", e.target.value)} className="w-32 text-right" />
                    </TableCell>
                    <TableCell className="text-right text-slate-500 italic">{formatCurrency(netIncome)}</TableCell>
                    <TableCell className="text-right">
                      <Input type="number" value={quarter.forecastFunding || 0} onChange={(e) => handleChange(idx, "forecastFunding", e.target.value)} className="w-32 text-right" />
                    </TableCell>
                    <TableCell className={`text-right font-medium italic ${netCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatCurrency(netCashFlow)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {(() => {
                const totalRevenue = editableData.reduce((sum, q) => sum + q.forecastRevenue, 0);
                const totalCOGS = editableData.reduce((sum, q) => sum + (q.forecastCOGS || 0), 0);
                const totalGrossMargin = totalRevenue - totalCOGS;
                const totalOpCosts = editableData.reduce((sum, q) => sum + (q.forecastOperatingCosts || 0), 0);
                const totalNIBeforeTax = totalGrossMargin - totalOpCosts;
                const totalTax = editableData.reduce((sum, q) => sum + (q.forecastTax || 0), 0);
                const totalNetIncome = totalNIBeforeTax - totalTax;
                const totalFunding = editableData.reduce((sum, q) => sum + (q.forecastFunding || 0), 0);
                const totalNetCF = totalNetIncome + totalFunding;
                
                return (
                  <TableRow className="bg-slate-100 font-bold border-t-2">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right text-emerald-600">{formatCurrency(totalRevenue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalCOGS)}</TableCell>
                    <TableCell className="text-right italic">{formatCurrency(totalGrossMargin)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalOpCosts)}</TableCell>
                    <TableCell className="text-right italic">{formatCurrency(totalNIBeforeTax)}</TableCell>
                    <TableCell className="text-right text-orange-600">{formatCurrency(totalTax)}</TableCell>
                    <TableCell className="text-right italic">{formatCurrency(totalNetIncome)}</TableCell>
                    <TableCell className="text-right text-blue-600">{formatCurrency(totalFunding)}</TableCell>
                    <TableCell className={`text-right italic ${totalNetCF >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(totalNetCF)}</TableCell>
                  </TableRow>
                );
              })()}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}