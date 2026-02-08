import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X, Check } from "lucide-react";
import { formatCurrency } from "@/components/shared/CurrencyFormat";

export default function EditableForecastTable({ forecastData, onUpdatePeriod }) {
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState({});

  const startEdit = (period) => {
    setEditingRow(period.year);
    setEditedData({ ...period });
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditedData({});
  };

  const saveEdit = () => {
    if (onUpdatePeriod) {
      onUpdatePeriod(editedData);
    }
    setEditingRow(null);
    setEditedData({});
  };

  const handleFieldChange = (field, value) => {
    setEditedData({
      ...editedData,
      [field]: parseFloat(value) || 0,
    });
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="text-xs font-semibold w-20">Year</TableHead>
            <TableHead className="text-xs font-semibold text-right">Revenue</TableHead>
            <TableHead className="text-xs font-semibold text-right">Expenses</TableHead>
            <TableHead className="text-xs font-semibold text-right">Net Cash Flow</TableHead>
            <TableHead className="text-xs font-semibold text-right">Cumulative</TableHead>
            <TableHead className="text-xs font-semibold text-right">Carbon (tCO2e)</TableHead>
            <TableHead className="text-xs font-semibold text-right">BNG (units)</TableHead>
            <TableHead className="text-xs font-semibold w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forecastData.map((period, idx) => {
            const isEditing = editingRow === period.year;
            const cumulative = forecastData
              .slice(0, idx + 1)
              .reduce((sum, p) => sum + (p.projected_cash_flow || 0), 0);

            const displayData = isEditing ? editedData : period;
            const cashFlow = (displayData.projected_revenue || 0) - (displayData.projected_expenses || 0);

            return (
              <TableRow key={period.year || idx} className={isEditing ? "bg-blue-50" : ""}>
                <TableCell className="font-medium">Year {period.year}</TableCell>
                
                <TableCell className="text-right text-emerald-600">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedData.projected_revenue || 0}
                      onChange={(e) => handleFieldChange("projected_revenue", e.target.value)}
                      className="h-8 text-right"
                    />
                  ) : (
                    formatCurrency(period.projected_revenue)
                  )}
                </TableCell>

                <TableCell className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedData.projected_expenses || 0}
                      onChange={(e) => handleFieldChange("projected_expenses", e.target.value)}
                      className="h-8 text-right"
                    />
                  ) : (
                    formatCurrency(period.projected_expenses)
                  )}
                </TableCell>

                <TableCell className={`text-right font-medium ${cashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(cashFlow)}
                </TableCell>

                <TableCell className={`text-right ${cumulative >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(cumulative)}
                </TableCell>

                <TableCell className="text-right text-xs text-slate-500">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedData.carbon_credits_generated || 0}
                      onChange={(e) => handleFieldChange("carbon_credits_generated", e.target.value)}
                      className="h-8 text-right"
                    />
                  ) : (
                    period.carbon_credits_generated?.toLocaleString() || "—"
                  )}
                </TableCell>

                <TableCell className="text-right text-xs text-slate-500">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedData.bng_habitat_units_generated || 0}
                      onChange={(e) => handleFieldChange("bng_habitat_units_generated", e.target.value)}
                      className="h-8 text-right"
                    />
                  ) : (
                    period.bng_habitat_units_generated?.toLocaleString() || "—"
                  )}
                </TableCell>

                <TableCell>
                  {isEditing ? (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveEdit}>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
                        <X className="h-3.5 w-3.5 text-slate-500" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => startEdit(period)}
                    >
                      <Pencil className="h-3.5 w-3.5 text-slate-400" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}