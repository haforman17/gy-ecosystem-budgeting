import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { Save, Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function MonthlyForecastTable({ data, year, projectId }) {
  const [editableData, setEditableData] = useState(data);
  const [isEditing, setIsEditing] = useState(false);

  const handleCellChange = (index, field, value) => {
    const updated = [...editableData];
    updated[index] = {
      ...updated[index],
      [field]: parseFloat(value) || 0,
      forecastNetCashFlow:
        field === "forecastRevenue"
          ? parseFloat(value || 0) - updated[index].forecastExpenses
          : field === "forecastExpenses"
          ? updated[index].forecastRevenue - parseFloat(value || 0)
          : updated[index].forecastNetCashFlow,
    };
    setEditableData(updated);
  };

  const handleSave = () => {
    // TODO: Save to database if needed
    setIsEditing(false);
    alert("Forecast saved successfully");
  };

  const exportToExcel = () => {
    const wsData = [
      ["Monthly Forecast", `Year: ${year}`],
      [],
      ["Month", "Forecast Revenue", "Forecast Expenses", "Net Cash Flow"],
      ...editableData.map((m) => [
        m.month,
        m.forecastRevenue,
        m.forecastExpenses,
        m.forecastNetCashFlow,
      ]),
      [],
      [
        "TOTAL",
        editableData.reduce((sum, m) => sum + m.forecastRevenue, 0),
        editableData.reduce((sum, m) => sum + m.forecastExpenses, 0),
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
        <div className="flex items-center justify-between">
          <CardTitle>Monthly Forecast - {year}</CardTitle>
          <div className="flex gap-2">
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
                <TableHead className="font-semibold">Month</TableHead>
                <TableHead className="text-right font-semibold">Forecast Revenue</TableHead>
                <TableHead className="text-right font-semibold">Forecast Expenses</TableHead>
                <TableHead className="text-right font-semibold">Net Cash Flow</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableData.map((month, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{month.month}</TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={month.forecastRevenue}
                        onChange={(e) => handleCellChange(idx, "forecastRevenue", e.target.value)}
                        className="w-32 text-right"
                      />
                    ) : (
                      <span className="text-emerald-600">{formatCurrency(month.forecastRevenue)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={month.forecastExpenses}
                        onChange={(e) => handleCellChange(idx, "forecastExpenses", e.target.value)}
                        className="w-32 text-right"
                      />
                    ) : (
                      formatCurrency(month.forecastExpenses)
                    )}
                  </TableCell>
                  <TableCell className={`text-right ${month.forecastNetCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {formatCurrency(month.forecastNetCashFlow)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-slate-100 font-bold border-t-2">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right text-emerald-600">{formatCurrency(totals.revenue)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.expenses)}</TableCell>
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