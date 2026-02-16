import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { Save, Download, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export default function QuarterlyForecastTable({ data, year, projectId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState(data);

  React.useEffect(() => {
    setEditableData(data);
  }, [data]);

  const handleChange = (index, field, value) => {
    const newData = [...editableData];
    newData[index][field] = parseFloat(value) || 0;
    
    const grossMargin = newData[index].forecastRevenue - (newData[index].forecastCOGS || 0);
    const netIncomeBeforeTax = grossMargin - (newData[index].forecastOperatingCosts || 0);
    const netIncome = netIncomeBeforeTax - (newData[index].forecastTax || 0);
    newData[index].forecastNetCashFlow = netIncome + (newData[index].forecastFunding || 0);
    
    setEditableData(newData);
  };

  const handleSave = () => {
    setIsEditing(false);
    // In production, save to backend/entity here
  };

  const downloadTemplate = () => {
    const templateData = [
      ["Quarterly Forecast Template", `Year: ${year}`],
      [],
      ["INSTRUCTIONS: Fill in the Forecast Revenue and Forecast Expenses columns only. Do not modify the Quarter column."],
      [],
      ["Quarter", "Forecast Revenue", "Forecast COGS", "Forecast Gross Margin", "Forecast Operating Costs", "Forecast Net Income Before Tax", "Forecast Tax", "Forecast Net Income", "Forecast Funding", "Forecast Net Cash Flow"],
      ...editableData.map((q) => {
        const grossMargin = (q.forecastRevenue || 0) - (q.forecastCOGS || 0);
        const netIncomeBeforeTax = grossMargin - (q.forecastOperatingCosts || 0);
        const netIncome = netIncomeBeforeTax - (q.forecastTax || 0);
        const netCashFlow = netIncome + (q.forecastFunding || 0);
        return [
          q.quarter,
          q.forecastRevenue || 0,
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
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
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
        alert("Invalid file format. Please use the template.");
        return;
      }

      const updatedData = editableData.map((quarter) => {
        const matchingRow = jsonData
          .slice(headerRowIndex + 1)
          .find((row) => row[0] === quarter.quarter);

        if (matchingRow) {
          const revenue = parseFloat(matchingRow[1]) || quarter.forecastRevenue;
          const expenses = parseFloat(matchingRow[2]) || quarter.forecastExpenses;
          return {
            ...quarter,
            forecastRevenue: revenue,
            forecastExpenses: expenses,
            forecastNetCashFlow: revenue - expenses,
          };
        }
        return quarter;
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
        const totalGrossMargin = totalRevenue - totalCOGS;
        const totalOpCosts = editableData.reduce((sum, q) => sum + (q.forecastOperatingCosts || 0), 0);
        const totalNIBeforeTax = totalGrossMargin - totalOpCosts;
        const totalTax = editableData.reduce((sum, q) => sum + (q.forecastTax || 0), 0);
        const totalNetIncome = totalNIBeforeTax - totalTax;
        const totalFunding = editableData.reduce((sum, q) => sum + (q.forecastFunding || 0), 0);
        const totalNetCF = totalNetIncome + totalFunding;
        return [
          "TOTAL",
          totalRevenue,
          totalCOGS,
          totalGrossMargin,
          totalOpCosts,
          totalNIBeforeTax,
          totalTax,
          totalNetIncome,
          totalFunding,
          totalNetCF,
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
        <div className="flex items-center justify-between">
          <CardTitle>Quarterly Forecast - {year}</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={downloadTemplate}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Template
            </Button>
            <label>
              <Button size="sm" variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </span>
              </Button>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {isEditing ? (
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                Edit Forecast
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
                      {isEditing ? (
                        <Input type="number" value={quarter.forecastRevenue} onChange={(e) => handleChange(idx, "forecastRevenue", e.target.value)} className="w-32 text-right" />
                      ) : (
                        <span className="text-emerald-600">{formatCurrency(quarter.forecastRevenue)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input type="number" value={quarter.forecastCOGS || 0} onChange={(e) => handleChange(idx, "forecastCOGS", e.target.value)} className="w-32 text-right" />
                      ) : (
                        <span className="text-slate-600">{formatCurrency(quarter.forecastCOGS || 0)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-slate-500 italic">{formatCurrency(grossMargin)}</TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input type="number" value={quarter.forecastOperatingCosts || 0} onChange={(e) => handleChange(idx, "forecastOperatingCosts", e.target.value)} className="w-32 text-right" />
                      ) : (
                        <span className="text-slate-600">{formatCurrency(quarter.forecastOperatingCosts || 0)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-slate-500 italic">{formatCurrency(netIncomeBeforeTax)}</TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input type="number" value={quarter.forecastTax || 0} onChange={(e) => handleChange(idx, "forecastTax", e.target.value)} className="w-32 text-right" />
                      ) : (
                        <span className="text-orange-600">{formatCurrency(quarter.forecastTax || 0)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-slate-500 italic">{formatCurrency(netIncome)}</TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input type="number" value={quarter.forecastFunding || 0} onChange={(e) => handleChange(idx, "forecastFunding", e.target.value)} className="w-32 text-right" />
                      ) : (
                        <span className="text-blue-600">{formatCurrency(quarter.forecastFunding || 0)}</span>
                      )}
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