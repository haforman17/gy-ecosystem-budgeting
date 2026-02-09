import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function IncomeStatementTab({ data, startDate, endDate }) {
  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          No financial data available for the selected period.
        </CardContent>
      </Card>
    );
  }

  const exportToCSV = () => {
    const csvData = [
      ["Income Statement", `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`],
      [],
      ["REVENUE"],
      ["Carbon Credit Sales", data.revenue.carbonSales],
      ["BNG Unit Sales", data.revenue.bngSales],
      ["Watercourse Unit Sales", data.revenue.watercourseSales],
      ["NFM Credit Sales", data.revenue.nfmSales],
      ["Other Revenue", data.revenue.otherRevenue],
      ["Total Revenue", data.revenue.totalRevenue],
      [],
      ["COST OF GOODS SOLD"],
      ["Site Preparation", data.cogs.sitePreparation],
      ["Planting", data.cogs.planting],
      ["Fencing", data.cogs.fencing],
      ["Initial Surveys", data.cogs.surveys],
      ["Total COGS", data.cogs.totalCOGS],
      ["Gross Profit", data.grossProfit],
      ["Gross Margin %", data.grossMargin],
      [],
      ["OPERATING EXPENSES"],
      ["Monitoring", data.operatingExpenses.monitoring],
      ["Maintenance", data.operatingExpenses.maintenance],
      ["Legal & Permitting", data.operatingExpenses.legal],
      ["Labor", data.operatingExpenses.labor],
      ["Overhead", data.operatingExpenses.overhead],
      ["Other", data.operatingExpenses.other],
      ["Total Operating Expenses", data.operatingExpenses.totalOperatingExpenses],
      ["EBITDA", data.ebitda],
      [],
      ["OTHER INCOME/EXPENSES"],
      ["Grant Income", data.otherIncome.grantIncome],
      ["Interest Expense", data.otherIncome.interestExpense],
      ["Total Other Income", data.otherIncome.totalOther],
      [],
      ["NET INCOME", data.netIncome],
      ["Net Profit Margin %", data.netMargin],
    ];
    
    const csv = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `income-statement-${format(startDate, "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const wsData = [
      ["Income Statement", `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`],
      [],
      ["REVENUE"],
      ["Carbon Credit Sales", data.revenue.carbonSales],
      ["BNG Unit Sales", data.revenue.bngSales],
      ["Watercourse Unit Sales", data.revenue.watercourseSales],
      ["NFM Credit Sales", data.revenue.nfmSales],
      ["Other Revenue", data.revenue.otherRevenue],
      ["Total Revenue", data.revenue.totalRevenue],
      [],
      ["COST OF GOODS SOLD"],
      ["Site Preparation", data.cogs.sitePreparation],
      ["Planting", data.cogs.planting],
      ["Fencing", data.cogs.fencing],
      ["Initial Surveys", data.cogs.surveys],
      ["Total COGS", data.cogs.totalCOGS],
      ["Gross Profit", data.grossProfit],
      ["Gross Margin %", data.grossMargin],
      [],
      ["OPERATING EXPENSES"],
      ["Monitoring", data.operatingExpenses.monitoring],
      ["Maintenance", data.operatingExpenses.maintenance],
      ["Legal & Permitting", data.operatingExpenses.legal],
      ["Labor", data.operatingExpenses.labor],
      ["Overhead", data.operatingExpenses.overhead],
      ["Other", data.operatingExpenses.other],
      ["Total Operating Expenses", data.operatingExpenses.totalOperatingExpenses],
      ["EBITDA", data.ebitda],
      [],
      ["OTHER INCOME/EXPENSES"],
      ["Grant Income", data.otherIncome.grantIncome],
      ["Interest Expense", data.otherIncome.interestExpense],
      ["Total Other Income", data.otherIncome.totalOther],
      [],
      ["NET INCOME", data.netIncome],
      ["Net Profit Margin %", data.netMargin],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Income Statement");
    XLSX.writeFile(wb, `income-statement-${format(startDate, "yyyy-MM-dd")}.xlsx`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Income Statement</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {/* REVENUE SECTION */}
            <TableRow className="bg-slate-50">
              <TableCell colSpan={2} className="font-semibold text-slate-700">
                REVENUE
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Carbon Credit Sales</TableCell>
              <TableCell className="text-right">{formatCurrency(data.revenue.carbonSales)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">BNG Unit Sales</TableCell>
              <TableCell className="text-right">{formatCurrency(data.revenue.bngSales)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Watercourse Unit Sales</TableCell>
              <TableCell className="text-right">{formatCurrency(data.revenue.watercourseSales)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">NFM Credit Sales</TableCell>
              <TableCell className="text-right">{formatCurrency(data.revenue.nfmSales)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Other Revenue</TableCell>
              <TableCell className="text-right">{formatCurrency(data.revenue.otherRevenue)}</TableCell>
            </TableRow>
            <TableRow className="font-semibold border-t-2">
              <TableCell>Total Revenue</TableCell>
              <TableCell className="text-right text-emerald-600">
                {formatCurrency(data.revenue.totalRevenue)}
              </TableCell>
            </TableRow>

            {/* COGS SECTION */}
            <TableRow className="bg-slate-50">
              <TableCell colSpan={2} className="font-semibold text-slate-700 pt-4">
                COST OF GOODS SOLD (Direct Project Costs)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Site Preparation</TableCell>
              <TableCell className="text-right">{formatCurrency(data.cogs.sitePreparation)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Planting</TableCell>
              <TableCell className="text-right">{formatCurrency(data.cogs.planting)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Fencing</TableCell>
              <TableCell className="text-right">{formatCurrency(data.cogs.fencing)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Initial Surveys</TableCell>
              <TableCell className="text-right">{formatCurrency(data.cogs.surveys)}</TableCell>
            </TableRow>
            <TableRow className="font-semibold border-t">
              <TableCell>Total COGS</TableCell>
              <TableCell className="text-right">{formatCurrency(data.cogs.totalCOGS)}</TableCell>
            </TableRow>
            <TableRow className="font-bold bg-emerald-50">
              <TableCell>Gross Profit</TableCell>
              <TableCell className="text-right flex items-center justify-end gap-2">
                {data.grossProfit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={data.grossProfit >= 0 ? "text-emerald-600" : "text-red-600"}>
                  {formatCurrency(data.grossProfit)}
                </span>
              </TableCell>
            </TableRow>
            <TableRow className="text-sm">
              <TableCell className="pl-8 text-slate-500">Gross Margin</TableCell>
              <TableCell className="text-right text-slate-600">{data.grossMargin.toFixed(1)}%</TableCell>
            </TableRow>

            {/* OPERATING EXPENSES SECTION */}
            <TableRow className="bg-slate-50">
              <TableCell colSpan={2} className="font-semibold text-slate-700 pt-4">
                OPERATING EXPENSES
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Monitoring</TableCell>
              <TableCell className="text-right">{formatCurrency(data.operatingExpenses.monitoring)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Maintenance</TableCell>
              <TableCell className="text-right">{formatCurrency(data.operatingExpenses.maintenance)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Legal & Permitting</TableCell>
              <TableCell className="text-right">{formatCurrency(data.operatingExpenses.legal)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Labor</TableCell>
              <TableCell className="text-right">{formatCurrency(data.operatingExpenses.labor)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Overhead</TableCell>
              <TableCell className="text-right">{formatCurrency(data.operatingExpenses.overhead)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Other</TableCell>
              <TableCell className="text-right">{formatCurrency(data.operatingExpenses.other)}</TableCell>
            </TableRow>
            <TableRow className="font-semibold border-t">
              <TableCell>Total Operating Expenses</TableCell>
              <TableCell className="text-right">
                {formatCurrency(data.operatingExpenses.totalOperatingExpenses)}
              </TableCell>
            </TableRow>
            <TableRow className="font-bold bg-blue-50">
              <TableCell>EBITDA</TableCell>
              <TableCell className={`text-right ${data.ebitda >= 0 ? "text-blue-600" : "text-red-600"}`}>
                {formatCurrency(data.ebitda)}
              </TableCell>
            </TableRow>

            {/* OTHER INCOME/EXPENSES */}
            <TableRow className="bg-slate-50">
              <TableCell colSpan={2} className="font-semibold text-slate-700 pt-4">
                OTHER INCOME/EXPENSES
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Grant Income</TableCell>
              <TableCell className="text-right text-emerald-600">
                {formatCurrency(data.otherIncome.grantIncome)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8">Interest Expense</TableCell>
              <TableCell className="text-right text-red-600">
                ({formatCurrency(data.otherIncome.interestExpense)})
              </TableCell>
            </TableRow>
            <TableRow className="font-semibold border-t">
              <TableCell>Total Other Income</TableCell>
              <TableCell className="text-right">{formatCurrency(data.otherIncome.totalOther)}</TableCell>
            </TableRow>

            {/* NET INCOME */}
            <TableRow className="font-bold bg-slate-100 border-t-2 border-slate-300">
              <TableCell className="text-lg">NET INCOME</TableCell>
              <TableCell className={`text-right text-lg ${data.netIncome >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(data.netIncome)}
              </TableCell>
            </TableRow>
            <TableRow className="text-sm">
              <TableCell className="pl-8 text-slate-500">Net Profit Margin</TableCell>
              <TableCell className="text-right text-slate-600">{data.netMargin.toFixed(1)}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}