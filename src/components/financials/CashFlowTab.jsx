import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { Download, Lock } from "lucide-react";
import * as XLSX from "xlsx";

export default function CashFlowTab({ statementsByYear, selectedYears }) {
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
      ["Cash Flow Statement - Year-over-Year Comparison"],
      [],
      ["Line Item", ...selectedYears.map(y => y.toString())],
      [],
      ["OPERATING ACTIVITIES"],
      ["Net Income", ...selectedYears.map(y => statementsByYear[y]?.cashFlowStatement?.operatingActivities?.netIncome || 0)],
      ["Net Cash from Operating", ...selectedYears.map(y => statementsByYear[y]?.cashFlowStatement?.operatingActivities?.netOperatingCash || 0)],
      [],
      ["FINANCING ACTIVITIES"],
      ["Debt Drawdowns", ...selectedYears.map(y => statementsByYear[y]?.cashFlowStatement?.financingActivities?.debtDrawdowns || 0)],
      ["Debt Repayments", ...selectedYears.map(y => statementsByYear[y]?.cashFlowStatement?.financingActivities?.debtRepayments || 0)],
      ["Net Cash from Financing", ...selectedYears.map(y => statementsByYear[y]?.cashFlowStatement?.financingActivities?.netFinancingCash || 0)],
      [],
      ["NET CHANGE IN CASH", ...selectedYears.map(y => statementsByYear[y]?.cashFlowStatement?.netChangeInCash || 0)],
      ["Ending Cash Balance", ...selectedYears.map(y => statementsByYear[y]?.cashFlowStatement?.endingCash || 0)],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cash Flow");
    XLSX.writeFile(wb, `cash-flow-comparison-${selectedYears.join('-')}.xlsx`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Statement of Cash Flows</CardTitle>
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
              {/* OPERATING ACTIVITIES */}
              <TableRow className="bg-slate-50">
                <TableCell className="font-bold text-slate-900 text-lg">OPERATING ACTIVITIES</TableCell>
                {selectedYears.map(year => <TableCell key={year} />)}
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Net Income</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} className="text-right">
                    {formatCurrency(statementsByYear[year]?.cashFlowStatement?.operatingActivities?.netIncome || 0)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="font-bold bg-emerald-50 border-t-2">
                <TableCell>Net Cash from Operating Activities</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} className="text-right text-emerald-600">
                    {formatCurrency(statementsByYear[year]?.cashFlowStatement?.operatingActivities?.netOperatingCash || 0)}
                  </TableCell>
                ))}
              </TableRow>

              {/* INVESTING ACTIVITIES */}
              <TableRow className="bg-slate-50">
                <TableCell className="font-bold text-slate-900 text-lg pt-4">INVESTING ACTIVITIES</TableCell>
                {selectedYears.map(year => <TableCell key={year} />)}
              </TableRow>
              <TableRow className="font-bold bg-amber-50 border-t-2">
                <TableCell>Net Cash from Investing Activities</TableCell>
                {selectedYears.map(year => {
                  const netInvesting = statementsByYear[year]?.cashFlowStatement?.investingActivities?.netInvestingCash || 0;
                  return (
                    <TableCell key={year} className={`text-right ${netInvesting >= 0 ? "" : "text-red-600"}`}>
                      {netInvesting < 0 ? "(" : ""}
                      {formatCurrency(Math.abs(netInvesting))}
                      {netInvesting < 0 ? ")" : ""}
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* FINANCING ACTIVITIES */}
              <TableRow className="bg-slate-50">
                <TableCell className="font-bold text-slate-900 text-lg pt-4">FINANCING ACTIVITIES</TableCell>
                {selectedYears.map(year => <TableCell key={year} />)}
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Grant Receipts</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} className="text-right text-emerald-600">
                    {formatCurrency(statementsByYear[year]?.cashFlowStatement?.financingActivities?.grantReceipts || 0)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Debt Drawdowns</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} className="text-right text-blue-600">
                    {formatCurrency(statementsByYear[year]?.cashFlowStatement?.financingActivities?.debtDrawdowns || 0)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Debt Repayments</TableCell>
                {selectedYears.map(year => {
                  const repayments = statementsByYear[year]?.cashFlowStatement?.financingActivities?.debtRepayments || 0;
                  return (
                    <TableCell key={year} className="text-right text-red-600">
                      {repayments !== 0 ? `(${formatCurrency(repayments)})` : "—"}
                    </TableCell>
                  );
                })}
              </TableRow>
              <TableRow className="font-bold bg-blue-50 border-t-2">
                <TableCell>Net Cash from Financing Activities</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} className="text-right text-blue-600">
                    {formatCurrency(statementsByYear[year]?.cashFlowStatement?.financingActivities?.netFinancingCash || 0)}
                  </TableCell>
                ))}
              </TableRow>

              {/* NET CHANGE IN CASH */}
              <TableRow className="font-bold bg-slate-100 border-t-4 border-slate-400 pt-4">
                <TableCell className="text-lg">NET CHANGE IN CASH</TableCell>
                {selectedYears.map(year => {
                  const netChange = statementsByYear[year]?.cashFlowStatement?.netChangeInCash || 0;
                  return (
                    <TableCell key={year} className={`text-right text-lg ${netChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatCurrency(netChange)}
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* CASH RECONCILIATION */}
              <TableRow className="border-t-2 pt-2">
                <TableCell className="pl-4">Beginning Cash Balance</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} className="text-right">
                    {formatCurrency(statementsByYear[year]?.cashFlowStatement?.beginningCash || 0)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="font-bold bg-emerald-50">
                <TableCell className="text-lg">Ending Cash Balance</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} className="text-right text-lg text-emerald-600">
                    {formatCurrency(statementsByYear[year]?.cashFlowStatement?.endingCash || 0)}
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