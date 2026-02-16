import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { Download, Lock } from "lucide-react";
import * as XLSX from "xlsx";

export default function EquityStatementTab({ statementsByYear, selectedYears }) {
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
      ["Statement of Changes in Equity - Year-over-Year Comparison"],
      [],
      ["Component", ...selectedYears.map(y => y.toString())],
      [],
      ["Beginning Balance - Total", ...selectedYears.map(y => statementsByYear[y]?.equityStatement?.beginningBalance?.total || 0)],
      [],
      ["CHANGES DURING PERIOD"],
      ["Equity Contributions", ...selectedYears.map(y => statementsByYear[y]?.equityStatement?.changes?.equityContributions || 0)],
      ["Grant Income", ...selectedYears.map(y => statementsByYear[y]?.equityStatement?.changes?.grantIncome || 0)],
      ["Net Income", ...selectedYears.map(y => statementsByYear[y]?.equityStatement?.changes?.netIncome || 0)],
      [],
      ["Ending Balance - Total", ...selectedYears.map(y => statementsByYear[y]?.equityStatement?.endingBalance?.total || 0)],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equity Statement");
    XLSX.writeFile(wb, `equity-statement-comparison-${selectedYears.join('-')}.xlsx`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Statement of Changes in Equity</CardTitle>
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
                <TableHead className="font-semibold text-slate-700">Component</TableHead>
                {selectedYears.map(year => (
                  <TableHead key={year} className="text-right font-semibold text-emerald-700">
                    {year}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Beginning Balance */}
              <TableRow className="font-semibold bg-blue-50">
                <TableCell>Beginning Balance - Total</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} className="text-right text-blue-600">
                    {formatCurrency(statementsByYear[year]?.equityStatement?.beginningBalance?.total || 0)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Changes During Period */}
              <TableRow className="bg-slate-50">
                <TableCell className="font-semibold text-slate-700 pt-4">
                  Changes During Period:
                </TableCell>
                {selectedYears.map(year => <TableCell key={year} />)}
              </TableRow>

              <TableRow>
                <TableCell className="pl-8">Equity Contributions</TableCell>
                {selectedYears.map(year => {
                  const eq = statementsByYear[year]?.equityStatement?.changes?.equityContributions || 0;
                  return (
                    <TableCell key={year} className="text-right text-emerald-600">
                      {eq !== 0 ? formatCurrency(eq) : "—"}
                    </TableCell>
                  );
                })}
              </TableRow>

              <TableRow>
                <TableCell className="pl-8">Grant Income Recognized</TableCell>
                {selectedYears.map(year => {
                  const grant = statementsByYear[year]?.equityStatement?.changes?.grantIncome || 0;
                  return (
                    <TableCell key={year} className="text-right text-emerald-600">
                      {grant !== 0 ? formatCurrency(grant) : "—"}
                    </TableCell>
                  );
                })}
              </TableRow>

              <TableRow>
                <TableCell className="pl-8">Net Income for Period</TableCell>
                {selectedYears.map(year => {
                  const netIncome = statementsByYear[year]?.equityStatement?.changes?.netIncome || 0;
                  return (
                    <TableCell key={year} className={`text-right ${netIncome >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatCurrency(netIncome)}
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Ending Balance */}
              <TableRow className="font-bold bg-emerald-50 border-t-4 border-slate-300">
                <TableCell className="text-lg">Ending Balance - Total</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} className="text-right text-lg text-emerald-600">
                    {formatCurrency(statementsByYear[year]?.equityStatement?.endingBalance?.total || 0)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}