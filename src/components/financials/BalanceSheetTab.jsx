import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { AlertTriangle, CheckCircle2, Download, Lock } from "lucide-react";
import * as XLSX from "xlsx";

export default function BalanceSheetTab({ statementsByYear, selectedYears }) {
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
      ["Balance Sheet - Year-over-Year Comparison"],
      [],
      ["Line Item", ...selectedYears.map(y => `As of Dec 31, ${y}`)],
      [],
      ["ASSETS"],
      ["Total Current Assets", ...selectedYears.map(y => statementsByYear[y]?.balanceSheet?.assets?.currentAssets?.totalCurrentAssets || 0)],
      ["Total Fixed Assets", ...selectedYears.map(y => statementsByYear[y]?.balanceSheet?.assets?.fixedAssets?.totalFixedAssets || 0)],
      ["TOTAL ASSETS", ...selectedYears.map(y => statementsByYear[y]?.balanceSheet?.assets?.totalAssets || 0)],
      [],
      ["LIABILITIES"],
      ["Total Current Liabilities", ...selectedYears.map(y => statementsByYear[y]?.balanceSheet?.liabilities?.currentLiabilities?.totalCurrentLiabilities || 0)],
      ["Total Long-Term Liabilities", ...selectedYears.map(y => statementsByYear[y]?.balanceSheet?.liabilities?.longTermLiabilities?.totalLongTermLiabilities || 0)],
      ["TOTAL LIABILITIES", ...selectedYears.map(y => statementsByYear[y]?.balanceSheet?.liabilities?.totalLiabilities || 0)],
      [],
      ["EQUITY"],
      ["TOTAL EQUITY", ...selectedYears.map(y => statementsByYear[y]?.balanceSheet?.equity?.totalEquity || 0)],
      [],
      ["TOTAL LIABILITIES + EQUITY", ...selectedYears.map(y => statementsByYear[y]?.balanceSheet?.totalLiabilitiesAndEquity || 0)],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Balance Sheet");
    XLSX.writeFile(wb, `balance-sheet-comparison-${selectedYears.join('-')}.xlsx`);
  };

  // Check if balance sheets balance for all years
  const balanceChecks = selectedYears.map(year => {
    const bs = statementsByYear[year]?.balanceSheet;
    if (!bs) return { year, balances: false, diff: 0 };
    const diff = Math.abs((bs.assets?.totalAssets || 0) - (bs.totalLiabilitiesAndEquity || 0));
    return { year, balances: diff < 0.01, diff };
  });

  const allBalance = balanceChecks.every(check => check.balances);

  return (
    <div className="space-y-4">
      {/* Balance Check Alert */}
      {!allBalance && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Balance sheet does not balance for some years. Check transaction data integrity.
          </AlertDescription>
        </Alert>
      )}

      {allBalance && (
        <Alert className="bg-emerald-50 border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-700">All balance sheets balance correctly across selected years</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Balance Sheet</CardTitle>
                <Lock className="h-4 w-4 text-slate-400" title="Read-only - auto-generated from transactions" />
              </div>
              <p className="text-sm text-slate-500 mt-1">Year-over-Year Comparison (As of Dec 31)</p>
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
                {/* ASSETS SECTION */}
                <TableRow className="bg-slate-50">
                  <TableCell className="font-bold text-slate-900 text-lg">ASSETS</TableCell>
                  {selectedYears.map(year => <TableCell key={year} />)}
                </TableRow>

                {/* Current Assets */}
                <TableRow>
                  <TableCell className="pl-8">Cash and Cash Equivalents</TableCell>
                  {selectedYears.map(year => (
                    <TableCell key={year} className="text-right">
                      {formatCurrency(statementsByYear[year]?.balanceSheet?.assets?.currentAssets?.cash || 0)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="font-semibold border-t">
                  <TableCell className="pl-4">Total Current Assets</TableCell>
                  {selectedYears.map(year => (
                    <TableCell key={year} className="text-right">
                      {formatCurrency(statementsByYear[year]?.balanceSheet?.assets?.currentAssets?.totalCurrentAssets || 0)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Fixed Assets */}
                <TableRow className="font-semibold border-t">
                  <TableCell className="pl-4">Total Fixed Assets</TableCell>
                  {selectedYears.map(year => (
                    <TableCell key={year} className="text-right">
                      {formatCurrency(statementsByYear[year]?.balanceSheet?.assets?.fixedAssets?.totalFixedAssets || 0)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Total Assets */}
                <TableRow className="font-bold bg-emerald-50 border-t-2 border-slate-300">
                  <TableCell className="text-lg">TOTAL ASSETS</TableCell>
                  {selectedYears.map(year => (
                    <TableCell key={year} className="text-right text-lg text-emerald-600">
                      {formatCurrency(statementsByYear[year]?.balanceSheet?.assets?.totalAssets || 0)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* LIABILITIES SECTION */}
                <TableRow className="bg-slate-50">
                  <TableCell className="font-bold text-slate-900 text-lg pt-6">LIABILITIES</TableCell>
                  {selectedYears.map(year => <TableCell key={year} />)}
                </TableRow>

                <TableRow className="font-semibold border-t">
                  <TableCell className="pl-4">Total Current Liabilities</TableCell>
                  {selectedYears.map(year => (
                    <TableCell key={year} className="text-right">
                      {formatCurrency(statementsByYear[year]?.balanceSheet?.liabilities?.currentLiabilities?.totalCurrentLiabilities || 0)}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow className="font-semibold border-t">
                  <TableCell className="pl-4">Total Long-Term Liabilities</TableCell>
                  {selectedYears.map(year => (
                    <TableCell key={year} className="text-right">
                      {formatCurrency(statementsByYear[year]?.balanceSheet?.liabilities?.longTermLiabilities?.totalLongTermLiabilities || 0)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Total Liabilities */}
                <TableRow className="font-bold bg-amber-50 border-t-2">
                  <TableCell className="text-lg">TOTAL LIABILITIES</TableCell>
                  {selectedYears.map(year => (
                    <TableCell key={year} className="text-right text-lg">
                      {formatCurrency(statementsByYear[year]?.balanceSheet?.liabilities?.totalLiabilities || 0)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* EQUITY SECTION */}
                <TableRow className="bg-slate-50">
                  <TableCell className="font-bold text-slate-900 text-lg pt-6">EQUITY</TableCell>
                  {selectedYears.map(year => <TableCell key={year} />)}
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Retained Earnings</TableCell>
                  {selectedYears.map(year => {
                    const re = statementsByYear[year]?.balanceSheet?.equity?.retainedEarnings || 0;
                    return (
                      <TableCell key={year} className={`text-right ${re >= 0 ? "" : "text-red-600"}`}>
                        {formatCurrency(re)}
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow className="font-bold bg-blue-50 border-t-2">
                  <TableCell className="text-lg">TOTAL EQUITY</TableCell>
                  {selectedYears.map(year => (
                    <TableCell key={year} className="text-right text-lg text-blue-600">
                      {formatCurrency(statementsByYear[year]?.balanceSheet?.equity?.totalEquity || 0)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Total Liabilities + Equity */}
                <TableRow className="font-bold bg-slate-100 border-t-4 border-slate-400">
                  <TableCell className="text-lg">TOTAL LIABILITIES + EQUITY</TableCell>
                  {selectedYears.map(year => (
                    <TableCell key={year} className="text-right text-lg">
                      {formatCurrency(statementsByYear[year]?.balanceSheet?.totalLiabilitiesAndEquity || 0)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}