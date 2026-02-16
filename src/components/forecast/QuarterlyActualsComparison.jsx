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
        "Forecast COGS",
        "Actual COGS",
        "COGS Variance",
        "Forecast Gross Margin",
        "Actual Gross Margin",
        "Forecast Operating Costs",
        "Actual Operating Costs",
        "Operating Costs Variance",
        "Forecast Net Income Before Tax",
        "Actual Net Income Before Tax",
        "Actual Tax",
        "Forecast Net Income",
        "Actual Net Income",
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
        q.forecastCOGS || 0,
        q.actualCOGS || 0,
        (q.actualCOGS || 0) - (q.forecastCOGS || 0),
        q.forecastRevenue - (q.forecastCOGS || 0),
        q.actualRevenue - (q.actualCOGS || 0),
        q.forecastOperatingCosts || 0,
        q.actualOperatingCosts || 0,
        (q.actualOperatingCosts || 0) - (q.forecastOperatingCosts || 0),
        (q.forecastRevenue - (q.forecastCOGS || 0)) - (q.forecastOperatingCosts || 0),
        (q.actualRevenue - (q.actualCOGS || 0)) - (q.actualOperatingCosts || 0),
        q.actualTax || 0,
        ((q.forecastRevenue - (q.forecastCOGS || 0)) - (q.forecastOperatingCosts || 0)) - (q.forecastTax || 0),
        ((q.actualRevenue - (q.actualCOGS || 0)) - (q.actualOperatingCosts || 0)) - (q.actualTax || 0),
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
        totals.forecastCOGS || 0,
        totals.actualCOGS || 0,
        (totals.actualCOGS || 0) - (totals.forecastCOGS || 0),
        totals.forecastGrossMargin || 0,
        totals.actualGrossMargin || 0,
        totals.forecastOperatingCosts || 0,
        totals.actualOperatingCosts || 0,
        (totals.actualOperatingCosts || 0) - (totals.forecastOperatingCosts || 0),
        totals.forecastNetIncomeBeforeTax || 0,
        totals.actualNetIncomeBeforeTax || 0,
        totals.actualTax || 0,
        totals.forecastNetIncome || 0,
        totals.actualNetIncome || 0,
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
                <TableHead className="text-right font-semibold">Forecast COGS</TableHead>
                <TableHead className="text-right font-semibold">Actual COGS</TableHead>
                <TableHead className="text-right font-semibold">Variance</TableHead>
                <TableHead className="text-right font-semibold">Forecast Gross Margin</TableHead>
                <TableHead className="text-right font-semibold">Actual Gross Margin</TableHead>
                <TableHead className="text-right font-semibold">Forecast Op Costs</TableHead>
                <TableHead className="text-right font-semibold">Actual Op Costs</TableHead>
                <TableHead className="text-right font-semibold">Variance</TableHead>
                <TableHead className="text-right font-semibold">Forecast NI Before Tax</TableHead>
                <TableHead className="text-right font-semibold">Actual NI Before Tax</TableHead>
                <TableHead className="text-right font-semibold">Actual Tax</TableHead>
                <TableHead className="text-right font-semibold">Forecast Net Income</TableHead>
                <TableHead className="text-right font-semibold">Actual Net Income</TableHead>
                <TableHead className="text-right font-semibold">Actual Funding</TableHead>
                <TableHead className="text-right font-semibold">Forecast Net CF</TableHead>
                <TableHead className="text-right font-semibold">Actual Net CF</TableHead>
                <TableHead className="text-right font-semibold">Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((quarter, idx) => {
                const forecastGrossMargin = quarter.forecastRevenue - (quarter.forecastCOGS || 0);
                const actualGrossMargin = quarter.actualRevenue - (quarter.actualCOGS || 0);
                const forecastNetIncomeBeforeTax = forecastGrossMargin - (quarter.forecastOperatingCosts || 0);
                const actualNetIncomeBeforeTax = actualGrossMargin - (quarter.actualOperatingCosts || 0);
                const forecastNetIncome = forecastNetIncomeBeforeTax - (quarter.forecastTax || 0);
                const actualNetIncome = actualNetIncomeBeforeTax - (quarter.actualTax || 0);
                const forecastNetCF = forecastNetIncome + (quarter.forecastFunding || 0);
                const actualNetCF = actualNetIncome + (quarter.actualFunding || 0);
                
                return (
                  <TableRow key={idx} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{quarter.quarter}</TableCell>
                    <TableCell className="text-right text-slate-600">{formatCurrency(quarter.forecastRevenue)}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium">{formatCurrency(quarter.actualRevenue)}</TableCell>
                    <TableCell className={`text-right ${quarter.varianceRevenue >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {quarter.varianceRevenue >= 0 ? "+" : ""}{formatCurrency(quarter.varianceRevenue)}
                    </TableCell>
                    <TableCell className="text-right text-slate-600">{formatCurrency(quarter.forecastCOGS || 0)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(quarter.actualCOGS || 0)}</TableCell>
                    <TableCell className={`text-right ${((quarter.actualCOGS || 0) - (quarter.forecastCOGS || 0)) <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {((quarter.actualCOGS || 0) - (quarter.forecastCOGS || 0)) >= 0 ? "+" : ""}{formatCurrency((quarter.actualCOGS || 0) - (quarter.forecastCOGS || 0))}
                    </TableCell>
                    <TableCell className="text-right text-slate-500 italic">{formatCurrency(forecastGrossMargin)}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium italic">{formatCurrency(actualGrossMargin)}</TableCell>
                    <TableCell className="text-right text-slate-600">{formatCurrency(quarter.forecastOperatingCosts || 0)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(quarter.actualOperatingCosts || 0)}</TableCell>
                    <TableCell className={`text-right ${((quarter.actualOperatingCosts || 0) - (quarter.forecastOperatingCosts || 0)) <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {((quarter.actualOperatingCosts || 0) - (quarter.forecastOperatingCosts || 0)) >= 0 ? "+" : ""}{formatCurrency((quarter.actualOperatingCosts || 0) - (quarter.forecastOperatingCosts || 0))}
                    </TableCell>
                    <TableCell className="text-right text-slate-500 italic">{formatCurrency(forecastNetIncomeBeforeTax)}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium italic">{formatCurrency(actualNetIncomeBeforeTax)}</TableCell>
                    <TableCell className="text-right text-orange-600 font-medium">{formatCurrency(quarter.actualTax || 0)}</TableCell>
                    <TableCell className="text-right text-slate-500 italic">{formatCurrency(forecastNetIncome)}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium italic">{formatCurrency(actualNetIncome)}</TableCell>
                    <TableCell className="text-right text-blue-600 font-medium">{formatCurrency(quarter.actualFunding || 0)}</TableCell>
                    <TableCell className="text-right text-slate-500 italic">{formatCurrency(forecastNetCF)}</TableCell>
                    <TableCell className={`text-right font-medium italic ${actualNetCF >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(actualNetCF)}</TableCell>
                    <TableCell className={`text-right ${(actualNetCF - forecastNetCF) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {(actualNetCF - forecastNetCF) >= 0 ? "+" : ""}{formatCurrency(actualNetCF - forecastNetCF)}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-slate-100 font-bold border-t-2">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.forecastRevenue)}</TableCell>
                <TableCell className="text-right text-emerald-600">{formatCurrency(totals.actualRevenue)}</TableCell>
                <TableCell className={`text-right ${totals.varianceRevenue >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  <div className="flex items-center justify-end gap-2">
                    {getVarianceBadge(totals.varianceRevenue)}
                    <span>{totals.varianceRevenue >= 0 ? "+" : ""}{formatCurrency(totals.varianceRevenue)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(totals.forecastCOGS || 0)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.actualCOGS || 0)}</TableCell>
                <TableCell className={`text-right ${((totals.actualCOGS || 0) - (totals.forecastCOGS || 0)) <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {((totals.actualCOGS || 0) - (totals.forecastCOGS || 0)) >= 0 ? "+" : ""}{formatCurrency((totals.actualCOGS || 0) - (totals.forecastCOGS || 0))}
                </TableCell>
                <TableCell className="text-right italic">{formatCurrency(totals.forecastGrossMargin || 0)}</TableCell>
                <TableCell className="text-right text-emerald-600 italic">{formatCurrency(totals.actualGrossMargin || 0)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.forecastOperatingCosts || 0)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.actualOperatingCosts || 0)}</TableCell>
                <TableCell className={`text-right ${((totals.actualOperatingCosts || 0) - (totals.forecastOperatingCosts || 0)) <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {((totals.actualOperatingCosts || 0) - (totals.forecastOperatingCosts || 0)) >= 0 ? "+" : ""}{formatCurrency((totals.actualOperatingCosts || 0) - (totals.forecastOperatingCosts || 0))}
                </TableCell>
                <TableCell className="text-right italic">{formatCurrency(totals.forecastNetIncomeBeforeTax || 0)}</TableCell>
                <TableCell className="text-right text-emerald-600 italic">{formatCurrency(totals.actualNetIncomeBeforeTax || 0)}</TableCell>
                <TableCell className="text-right text-orange-600">{formatCurrency(totals.actualTax || 0)}</TableCell>
                <TableCell className="text-right italic">{formatCurrency(totals.forecastNetIncome || 0)}</TableCell>
                <TableCell className="text-right text-emerald-600 italic">{formatCurrency(totals.actualNetIncome || 0)}</TableCell>
                <TableCell className="text-right text-blue-600">{formatCurrency(totals.actualFunding || 0)}</TableCell>
                <TableCell className="text-right italic">{formatCurrency(totals.forecastNetCashFlow)}</TableCell>
                <TableCell className={`text-right italic ${totals.actualNetCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(totals.actualNetCashFlow)}
                </TableCell>
                <TableCell className={`text-right ${totals.varianceNetCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {totals.varianceNetCashFlow >= 0 ? "+" : ""}{formatCurrency(totals.varianceNetCashFlow)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}