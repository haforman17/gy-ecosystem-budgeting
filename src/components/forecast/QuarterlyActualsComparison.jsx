import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import * as XLSX from "xlsx";

export default function QuarterlyActualsComparison({ data, totals }) {
  const exportToExcel = () => {
    const wsData = [
      ["Quarterly Forecast vs Actuals Comparison"],
      [],
      [
        "Quarter",
        "Forecast Revenue",
        "Actual Revenue",
        "Revenue Variance",
        "Forecast Expenses",
        "Actual Expenses",
        "Expense Variance",
        "Actual Funding",
        "Forecast Net CF",
        "Actual Net CF",
        "Net CF Variance",
      ],
      ...data.map((q) => [
        q.quarter,
        q.forecastRevenue,
        q.actualRevenue,
        q.varianceRevenue,
        q.forecastExpenses,
        q.actualExpenses,
        q.varianceExpenses,
        q.actualFunding || 0,
        q.forecastNetCashFlow,
        q.actualNetCashFlow,
        q.varianceNetCashFlow,
      ]),
      [],
      [
        "TOTAL",
        totals.forecastRevenue,
        totals.actualRevenue,
        totals.varianceRevenue,
        totals.forecastExpenses,
        totals.actualExpenses,
        totals.varianceExpenses,
        totals.actualFunding || 0,
        totals.forecastNetCashFlow,
        totals.actualNetCashFlow,
        totals.varianceNetCashFlow,
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Comparison");
    XLSX.writeFile(wb, `quarterly-forecast-vs-actuals.xlsx`);
  };

  const getVarianceBadge = (variance, isExpense = false) => {
    const favorable = isExpense ? variance <= 0 : variance >= 0;
    if (Math.abs(variance) < 100) return null;

    return (
      <Badge className={favorable ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
        {favorable ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {Math.abs((variance / (isExpense ? totals.forecastExpenses : totals.forecastRevenue)) * 100).toFixed(0)}%
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quarterly Forecast vs Actuals</CardTitle>
          <Button size="sm" variant="outline" onClick={exportToExcel}>
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
                <TableHead className="font-semibold">Quarter</TableHead>
                <TableHead className="text-right font-semibold">Forecast Revenue</TableHead>
                <TableHead className="text-right font-semibold">Actual Revenue</TableHead>
                <TableHead className="text-right font-semibold">Variance</TableHead>
                <TableHead className="text-right font-semibold">Forecast Expenses</TableHead>
                <TableHead className="text-right font-semibold">Actual Expenses</TableHead>
                <TableHead className="text-right font-semibold">Variance</TableHead>
                <TableHead className="text-right font-semibold">Actual Funding</TableHead>
                <TableHead className="text-right font-semibold">Forecast Net CF</TableHead>
                <TableHead className="text-right font-semibold">Actual Net CF</TableHead>
                <TableHead className="text-right font-semibold">Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((quarter, idx) => (
                <TableRow key={idx} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{quarter.quarter}</TableCell>
                  <TableCell className="text-right text-slate-600">{formatCurrency(quarter.forecastRevenue)}</TableCell>
                  <TableCell className="text-right text-emerald-600 font-medium">
                    {formatCurrency(quarter.actualRevenue)}
                  </TableCell>
                  <TableCell className={`text-right ${quarter.varianceRevenue >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {quarter.varianceRevenue >= 0 ? "+" : ""}
                    {formatCurrency(quarter.varianceRevenue)}
                  </TableCell>
                  <TableCell className="text-right text-slate-600">{formatCurrency(quarter.forecastExpenses)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(quarter.actualExpenses)}</TableCell>
                  <TableCell className={`text-right ${quarter.varianceExpenses <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {quarter.varianceExpenses >= 0 ? "+" : ""}
                    {formatCurrency(quarter.varianceExpenses)}
                  </TableCell>
                  <TableCell className="text-right text-blue-600 font-medium">
                    {formatCurrency(quarter.actualFunding || 0)}
                  </TableCell>
                  <TableCell className="text-right text-slate-600">{formatCurrency(quarter.forecastNetCashFlow)}</TableCell>
                  <TableCell className={`text-right font-medium ${quarter.actualNetCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {formatCurrency(quarter.actualNetCashFlow)}
                  </TableCell>
                  <TableCell className={`text-right ${quarter.varianceNetCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {quarter.varianceNetCashFlow >= 0 ? "+" : ""}
                    {formatCurrency(quarter.varianceNetCashFlow)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-slate-100 font-bold border-t-2">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.forecastRevenue)}</TableCell>
                <TableCell className="text-right text-emerald-600">{formatCurrency(totals.actualRevenue)}</TableCell>
                <TableCell className={`text-right ${totals.varianceRevenue >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  <div className="flex items-center justify-end gap-2">
                    {getVarianceBadge(totals.varianceRevenue)}
                    <span>
                      {totals.varianceRevenue >= 0 ? "+" : ""}
                      {formatCurrency(totals.varianceRevenue)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(totals.forecastExpenses)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.actualExpenses)}</TableCell>
                <TableCell className={`text-right ${totals.varianceExpenses <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  <div className="flex items-center justify-end gap-2">
                    {getVarianceBadge(totals.varianceExpenses, true)}
                    <span>
                      {totals.varianceExpenses >= 0 ? "+" : ""}
                      {formatCurrency(totals.varianceExpenses)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-blue-600">{formatCurrency(totals.actualFunding || 0)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.forecastNetCashFlow)}</TableCell>
                <TableCell className={`text-right ${totals.actualNetCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(totals.actualNetCashFlow)}
                </TableCell>
                <TableCell className={`text-right ${totals.varianceNetCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {totals.varianceNetCashFlow >= 0 ? "+" : ""}
                  {formatCurrency(totals.varianceNetCashFlow)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}