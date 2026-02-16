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
      const grossMargin = (editedData.projected_revenue || 0) - (editedData.projected_cogs || 0);
      const netIncomeBeforeTax = grossMargin - (editedData.projected_operating_costs || 0);
      const netIncome = netIncomeBeforeTax - (editedData.projected_tax || 0);
      const cashFlow = netIncome + (editedData.projected_funding || 0);
      
      onUpdatePeriod({
        ...editedData,
        projected_cash_flow: cashFlow
      });
    }
    setEditingRow(null);
    setEditedData({});
  };

  const handleFieldChange = (field, value) => {
    const updated = {
      ...editedData,
      [field]: parseFloat(value) || 0,
    };
    
    const grossMargin = (updated.projected_revenue || 0) - (updated.projected_cogs || 0);
    const netIncomeBeforeTax = grossMargin - (updated.projected_operating_costs || 0);
    const netIncome = netIncomeBeforeTax - (updated.projected_tax || 0);
    updated.projected_cash_flow = netIncome + (updated.projected_funding || 0);
    
    setEditedData(updated);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="text-xs font-semibold w-20">Year</TableHead>
            <TableHead className="text-xs font-semibold text-right">Revenue</TableHead>
            <TableHead className="text-xs font-semibold text-right">COGS</TableHead>
            <TableHead className="text-xs font-semibold text-right">Gross Margin</TableHead>
            <TableHead className="text-xs font-semibold text-right">Op Costs</TableHead>
            <TableHead className="text-xs font-semibold text-right">NI Before Tax</TableHead>
            <TableHead className="text-xs font-semibold text-right">Tax</TableHead>
            <TableHead className="text-xs font-semibold text-right">Net Income</TableHead>
            <TableHead className="text-xs font-semibold text-right">Funding</TableHead>
            <TableHead className="text-xs font-semibold text-right">Net CF</TableHead>
            <TableHead className="text-xs font-semibold text-right">Cumulative</TableHead>
            <TableHead className="text-xs font-semibold text-right">Carbon</TableHead>
            <TableHead className="text-xs font-semibold text-right">BNG</TableHead>
            <TableHead className="text-xs font-semibold w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forecastData.map((period, idx) => {
            const isEditing = editingRow === period.year;
            
            const displayData = isEditing ? editedData : period;
            const grossMargin = (displayData.projected_revenue || 0) - (displayData.projected_cogs || 0);
            const netIncomeBeforeTax = grossMargin - (displayData.projected_operating_costs || 0);
            const netIncome = netIncomeBeforeTax - (displayData.projected_tax || 0);
            const cashFlow = netIncome + (displayData.projected_funding || 0);
            
            const cumulative = forecastData
              .slice(0, idx + 1)
              .reduce((sum, p) => {
                const gm = (p.projected_revenue || 0) - (p.projected_cogs || 0);
                const nibt = gm - (p.projected_operating_costs || 0);
                const ni = nibt - (p.projected_tax || 0);
                const cf = ni + (p.projected_funding || 0);
                return sum + cf;
              }, 0);

            return (
              <TableRow key={period.year || idx} className={isEditing ? "bg-blue-50" : ""}>
                <TableCell className="font-medium">{period.calendarYear || period.year}</TableCell>
                
                <TableCell className="text-right">
                  {isEditing ? (
                    <Input type="number" value={editedData.projected_revenue || 0} onChange={(e) => handleFieldChange("projected_revenue", e.target.value)} className="h-8 text-right" />
                  ) : (
                    <span className="text-emerald-600">{formatCurrency(period.projected_revenue)}</span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  {isEditing ? (
                    <Input type="number" value={editedData.projected_cogs || 0} onChange={(e) => handleFieldChange("projected_cogs", e.target.value)} className="h-8 text-right" />
                  ) : (
                    formatCurrency(period.projected_cogs || 0)
                  )}
                </TableCell>

                <TableCell className="text-right text-slate-500 italic">{formatCurrency(grossMargin)}</TableCell>

                <TableCell className="text-right">
                  {isEditing ? (
                    <Input type="number" value={editedData.projected_operating_costs || 0} onChange={(e) => handleFieldChange("projected_operating_costs", e.target.value)} className="h-8 text-right" />
                  ) : (
                    formatCurrency(period.projected_operating_costs || 0)
                  )}
                </TableCell>

                <TableCell className="text-right text-slate-500 italic">{formatCurrency(netIncomeBeforeTax)}</TableCell>

                <TableCell className="text-right">
                  {isEditing ? (
                    <Input type="number" value={editedData.projected_tax || 0} onChange={(e) => handleFieldChange("projected_tax", e.target.value)} className="h-8 text-right" />
                  ) : (
                    <span className="text-orange-600">{formatCurrency(period.projected_tax || 0)}</span>
                  )}
                </TableCell>

                <TableCell className="text-right text-slate-500 italic">{formatCurrency(netIncome)}</TableCell>

                <TableCell className="text-right">
                  {isEditing ? (
                    <Input type="number" value={editedData.projected_funding || 0} onChange={(e) => handleFieldChange("projected_funding", e.target.value)} className="h-8 text-right" />
                  ) : (
                    <span className="text-blue-600">{formatCurrency(period.projected_funding || 0)}</span>
                  )}
                </TableCell>

                <TableCell className={`text-right font-medium italic ${cashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(cashFlow)}
                </TableCell>

                <TableCell className={`text-right ${cumulative >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(cumulative)}
                </TableCell>

                <TableCell className="text-right text-xs text-slate-500">
                  {isEditing ? (
                    <Input type="number" value={editedData.carbon_credits_generated || 0} onChange={(e) => handleFieldChange("carbon_credits_generated", e.target.value)} className="h-8 text-right" />
                  ) : (
                    period.carbon_credits_generated?.toLocaleString() || "—"
                  )}
                </TableCell>

                <TableCell className="text-right text-xs text-slate-500">
                  {isEditing ? (
                    <Input type="number" value={editedData.bng_habitat_units_generated || 0} onChange={(e) => handleFieldChange("bng_habitat_units_generated", e.target.value)} className="h-8 text-right" />
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