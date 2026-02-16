import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { Download, Lock } from "lucide-react";
import * as XLSX from "xlsx";

export default function IncomeStatementTab({ statementsByYear, selectedYears }) {
  if (!statementsByYear) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          No transaction data available. Add transactions to generate financial statements.
        </CardContent>
      </Card>
    );
  }

  const exportToExcel = () => {
    const wsData = [
      ["Income Statement - Year-over-Year Comparison"],
      [],
      ["Line Item", ...selectedYears.map(y => y.toString())],
      [],
      ["REVENUE"],
      ["Total Revenue", ...selectedYears.map(y => statementsByYear[y]?.incomeStatement?.revenue?.totalRevenue || 0)],
      [],
      ["COST OF GOODS SOLD"],
      ["Total COGS", ...selectedYears.map(y => statementsByYear[y]?.incomeStatement?.cogs?.totalCOGS || 0)],
      ["Gross Profit", ...selectedYears.map(y => statementsByYear[y]?.incomeStatement?.grossProfit || 0)],
      [],
      ["OPERATING EXPENSES"],
      ["Total Operating Expenses", ...selectedYears.map(y => statementsByYear[y]?.incomeStatement?.operatingExpenses?.totalOperatingExpenses || 0)],
      ["EBITDA", ...selectedYears.map(y => statementsByYear[y]?.incomeStatement?.ebitda || 0)],
      [],
      ["NET INCOME", ...selectedYears.map(y => statementsByYear[y]?.incomeStatement?.netIncome || 0)],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Income Statement");
    XLSX.writeFile(wb, `income-statement-comparison-${selectedYears.join('-')}.xlsx`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Income Statement</CardTitle>
              <Lock className="h-4 w-4 text-slate-400" title="Read-only - auto-generated from transactions" />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Year-over-Year Comparison
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Line Item</TableHead>
                {selectedYears.map(year => (
                  <TableHead key={year} className="text-right font-semibold text-emerald-700">
                    {year}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* REVENUE SECTION */}
              <TableRow className="bg-slate-50">
                <TableCell className="font-semibold text-slate-700">REVENUE</TableCell>
                {selectedYears.map(year => <TableCell key={year} />)}
              </TableRow>
              <TableRow className="font-semibold border-t">
                <TableCell>Total Revenue</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} className="text-right text-emerald-600">
                    {formatCurrency(statementsByYear[year]?.incomeStatement?.revenue?.totalRevenue || 0)}
                  </TableCell>
                ))}
              </TableRow>

              {/* COGS SECTION */}
              <TableRow className="bg-slate-50">
                <TableCell className="font-semibold text-slate-700 pt-4">COST OF GOODS SOLD</TableCell>
                {selectedYears.map(year => <TableCell key={year} />)}
              </TableRow>
              <TableRow className="font-semibold border-t">
                <TableCell>Total COGS</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} className="text-right">
                    {formatCurrency(statementsByYear[year]?.incomeStatement?.cogs?.totalCOGS || 0)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="font-bold bg-emerald-50">
                <TableCell>Gross Profit</TableCell>
                {selectedYears.map(year => {
                  const gp = statementsByYear[year]?.incomeStatement?.grossProfit || 0;
                  return (
                    <TableCell key={year} className={`text-right ${gp >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatCurrency(gp)}
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* OPERATING EXPENSES SECTION */}
              <TableRow className="bg-slate-50">
                <TableCell className="font-semibold text-slate-700 pt-4">OPERATING EXPENSES</TableCell>
                {selectedYears.map(year => <TableCell key={year} />)}
              </TableRow>
              <TableRow className="font-semibold border-t">
                <TableCell>Total Operating Expenses</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} className="text-right">
                    {formatCurrency(statementsByYear[year]?.incomeStatement?.operatingExpenses?.totalOperatingExpenses || 0)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="font-bold bg-blue-50">
                <TableCell>EBITDA</TableCell>
                {selectedYears.map(year => {
                  const ebitda = statementsByYear[year]?.incomeStatement?.ebitda || 0;
                  return (
                    <TableCell key={year} className={`text-right ${ebitda >= 0 ? "text-blue-600" : "text-red-600"}`}>
                      {formatCurrency(ebitda)}
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* OTHER INCOME/EXPENSES */}
              <TableRow className="bg-slate-50">
                <TableCell className="font-semibold text-slate-700 pt-4">OTHER INCOME/EXPENSES</TableCell>
                {selectedYears.map(year => <TableCell key={year} />)}
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Grant Income</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} className="text-right text-emerald-600">
                    {formatCurrency(statementsByYear[year]?.incomeStatement?.otherIncome?.grantIncome || 0)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Interest Expense</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} className="text-right text-red-600">
                    ({formatCurrency(statementsByYear[year]?.incomeStatement?.otherIncome?.interestExpense || 0)})
                  </TableCell>
                ))}
              </TableRow>

              {/* NET INCOME */}
              <TableRow className="font-bold bg-slate-100 border-t-4 border-slate-300">
                <TableCell className="text-lg">NET INCOME</TableCell>
                {selectedYears.map(year => {
                  const netIncome = statementsByYear[year]?.incomeStatement?.netIncome || 0;
                  return (
                    <TableCell key={year} className={`text-right text-lg ${netIncome >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatCurrency(netIncome)}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}