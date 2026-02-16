import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import * as XLSX from "xlsx";

export default function MonthlyActualsComparison({ data, totals }) {
  const exportToExcel = () => {
    const wsData = [
      ["Monthly Forecast vs Actuals Comparison"],
      [],
      [
        "Month",
        "Forecast Revenue",
        "Actual Revenue",
        "Revenue Variance",
        "Forecast COGS",
        "Actual COGS",
        "Forecast Gross Margin",
        "Actual Gross Margin",
        "Forecast Operating Costs",
        "Actual Operating Costs",
        "Forecast Net Income Before Tax",
        "Actual Net Income Before Tax",
        "Actual Tax",
        "Forecast Net Income",
        "Actual Net Income",
        "Actual Funding",
        "Forecast Net CF",
        "Actual Net CF",
      ],
      ...data.map((m) => {
        const forecastCOGS = m.forecastCOGS || 0;
        const actualCOGS = m.actualCOGS || 0;
        const forecastGrossMargin = m.forecastRevenue - forecastCOGS;
        const actualGrossMargin = m.actualRevenue - actualCOGS;
        const forecastOpCosts = m.forecastOperatingCosts || 0;
        const actualOpCosts = m.actualOperatingCosts || 0;
        const forecastNIBeforeTax = forecastGrossMargin - forecastOpCosts;
        const actualNIBeforeTax = actualGrossMargin - actualOpCosts;
        const forecastTax = m.forecastTax || 0;
        const actualTax = m.actualTax || 0;
        const forecastNetIncome = forecastNIBeforeTax - forecastTax;
        const actualNetIncome = actualNIBeforeTax - actualTax;
        const forecastNetCF = forecastNetIncome + (m.forecastFunding || 0);
        const actualNetCF = actualNetIncome + (m.actualFunding || 0);
        
        return [
          m.month,
          m.forecastRevenue,
          m.actualRevenue,
          m.varianceRevenue,
          forecastCOGS,
          actualCOGS,
          forecastGrossMargin,
          actualGrossMargin,
          forecastOpCosts,
          actualOpCosts,
          forecastNIBeforeTax,
          actualNIBeforeTax,
          actualTax,
          forecastNetIncome,
          actualNetIncome,
          m.actualFunding || 0,
          forecastNetCF,
          actualNetCF,
        ];
      }),
      [],
      (() => {
        const forecastGrossMargin = totals.forecastRevenue - (totals.forecastCOGS || 0);
        const actualGrossMargin = totals.actualRevenue - (totals.actualCOGS || 0);
        const forecastNIBeforeTax = forecastGrossMargin - (totals.forecastOperatingCosts || 0);
        const actualNIBeforeTax = actualGrossMargin - (totals.actualOperatingCosts || 0);
        const forecastNetIncome = forecastNIBeforeTax - (totals.forecastTax || 0);
        const actualNetIncome = actualNIBeforeTax - (totals.actualTax || 0);
        const forecastNetCF = forecastNetIncome + (totals.forecastFunding || 0);
        const actualNetCF = actualNetIncome + (totals.actualFunding || 0);
        
        return [
          "TOTAL",
          totals.forecastRevenue,
          totals.actualRevenue,
          totals.varianceRevenue,
          totals.forecastCOGS || 0,
          totals.actualCOGS || 0,
          forecastGrossMargin,
          actualGrossMargin,
          totals.forecastOperatingCosts || 0,
          totals.actualOperatingCosts || 0,
          forecastNIBeforeTax,
          actualNIBeforeTax,
          totals.actualTax || 0,
          forecastNetIncome,
          actualNetIncome,
          totals.actualFunding || 0,
          forecastNetCF,
          actualNetCF,
        ];
      })(),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Comparison");
    XLSX.writeFile(wb, `forecast-vs-actuals-comparison.xlsx`);
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
          <CardTitle>Forecast vs Actuals Comparison</CardTitle>
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
                <TableHead className="font-semibold">Month</TableHead>
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
              {data.map((month, idx) => {
                const forecastCOGS = month.forecastCOGS || 0;
                const actualCOGS = month.actualCOGS || 0;
                const forecastGrossMargin = month.forecastRevenue - forecastCOGS;
                const actualGrossMargin = month.actualRevenue - actualCOGS;
                const forecastOpCosts = month.forecastOperatingCosts || 0;
                const actualOpCosts = month.actualOperatingCosts || 0;
                const forecastNIBeforeTax = forecastGrossMargin - forecastOpCosts;
                const actualNIBeforeTax = actualGrossMargin - actualOpCosts;
                const forecastTax = month.forecastTax || 0;
                const actualTax = month.actualTax || 0;
                const forecastNetIncome = forecastNIBeforeTax - forecastTax;
                const actualNetIncome = actualNIBeforeTax - actualTax;
                const forecastNetCF = forecastNetIncome + (month.forecastFunding || 0);
                const actualNetCF = actualNetIncome + (month.actualFunding || 0);
                
                return (
                  <TableRow key={idx} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{month.month}</TableCell>
                    <TableCell className="text-right text-slate-600">{formatCurrency(month.forecastRevenue)}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium">{formatCurrency(month.actualRevenue)}</TableCell>
                    <TableCell className={`text-right ${month.varianceRevenue >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {month.varianceRevenue >= 0 ? "+" : ""}{formatCurrency(month.varianceRevenue)}
                    </TableCell>
                    <TableCell className="text-right text-slate-600">{formatCurrency(forecastCOGS)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(actualCOGS)}</TableCell>
                    <TableCell className={`text-right ${(actualCOGS - forecastCOGS) <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {(actualCOGS - forecastCOGS) >= 0 ? "+" : ""}{formatCurrency(actualCOGS - forecastCOGS)}
                    </TableCell>
                    <TableCell className="text-right text-slate-500 italic">{formatCurrency(forecastGrossMargin)}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium italic">{formatCurrency(actualGrossMargin)}</TableCell>
                    <TableCell className="text-right text-slate-600">{formatCurrency(forecastOpCosts)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(actualOpCosts)}</TableCell>
                    <TableCell className={`text-right ${(actualOpCosts - forecastOpCosts) <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {(actualOpCosts - forecastOpCosts) >= 0 ? "+" : ""}{formatCurrency(actualOpCosts - forecastOpCosts)}
                    </TableCell>
                    <TableCell className="text-right text-slate-500 italic">{formatCurrency(forecastNIBeforeTax)}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium italic">{formatCurrency(actualNIBeforeTax)}</TableCell>
                    <TableCell className="text-right text-orange-600 font-medium">{formatCurrency(actualTax)}</TableCell>
                    <TableCell className="text-right text-slate-500 italic">{formatCurrency(forecastNetIncome)}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium italic">{formatCurrency(actualNetIncome)}</TableCell>
                    <TableCell className="text-right text-blue-600 font-medium">{formatCurrency(month.actualFunding || 0)}</TableCell>
                    <TableCell className="text-right text-slate-500 italic">{formatCurrency(forecastNetCF)}</TableCell>
                    <TableCell className={`text-right font-medium italic ${actualNetCF >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(actualNetCF)}</TableCell>
                    <TableCell className={`text-right ${(actualNetCF - forecastNetCF) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {(actualNetCF - forecastNetCF) >= 0 ? "+" : ""}{formatCurrency(actualNetCF - forecastNetCF)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {(() => {
                const forecastGrossMargin = totals.forecastRevenue - (totals.forecastCOGS || 0);
                const actualGrossMargin = totals.actualRevenue - (totals.actualCOGS || 0);
                const forecastNIBeforeTax = forecastGrossMargin - (totals.forecastOperatingCosts || 0);
                const actualNIBeforeTax = actualGrossMargin - (totals.actualOperatingCosts || 0);
                const forecastNetIncome = forecastNIBeforeTax - (totals.forecastTax || 0);
                const actualNetIncome = actualNIBeforeTax - (totals.actualTax || 0);
                const forecastNetCF = forecastNetIncome + (totals.forecastFunding || 0);
                const actualNetCF = actualNetIncome + (totals.actualFunding || 0);
                
                return (
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
                    <TableCell className="text-right italic">{formatCurrency(forecastGrossMargin)}</TableCell>
                    <TableCell className="text-right text-emerald-600 italic">{formatCurrency(actualGrossMargin)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.forecastOperatingCosts || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.actualOperatingCosts || 0)}</TableCell>
                    <TableCell className={`text-right ${((totals.actualOperatingCosts || 0) - (totals.forecastOperatingCosts || 0)) <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {((totals.actualOperatingCosts || 0) - (totals.forecastOperatingCosts || 0)) >= 0 ? "+" : ""}{formatCurrency((totals.actualOperatingCosts || 0) - (totals.forecastOperatingCosts || 0))}
                    </TableCell>
                    <TableCell className="text-right italic">{formatCurrency(forecastNIBeforeTax)}</TableCell>
                    <TableCell className="text-right text-emerald-600 italic">{formatCurrency(actualNIBeforeTax)}</TableCell>
                    <TableCell className="text-right text-orange-600">{formatCurrency(totals.actualTax || 0)}</TableCell>
                    <TableCell className="text-right italic">{formatCurrency(forecastNetIncome)}</TableCell>
                    <TableCell className="text-right text-emerald-600 italic">{formatCurrency(actualNetIncome)}</TableCell>
                    <TableCell className="text-right text-blue-600">{formatCurrency(totals.actualFunding || 0)}</TableCell>
                    <TableCell className="text-right italic">{formatCurrency(forecastNetCF)}</TableCell>
                    <TableCell className={`text-right italic ${actualNetCF >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(actualNetCF)}</TableCell>
                    <TableCell className={`text-right ${(actualNetCF - forecastNetCF) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {(actualNetCF - forecastNetCF) >= 0 ? "+" : ""}{formatCurrency(actualNetCF - forecastNetCF)}
                    </TableCell>
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