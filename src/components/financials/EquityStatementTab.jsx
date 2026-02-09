import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { format } from "date-fns";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function EquityStatementTab({ data, startDate, endDate }) {
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
      ["Statement of Changes in Equity", `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`],
      [],
      ["Component", "Contributed Capital", "Grant Funding", "Retained Earnings", "Total"],
      ["Beginning Balance", data.beginningBalance.contributed, data.beginningBalance.grants, data.beginningBalance.retained, data.beginningBalance.total],
      [],
      ["Changes During Period:"],
      ["Equity Contributions", data.changes.equityContributions, 0, 0, data.changes.equityContributions],
      ["Grant Income Recognized", 0, data.changes.grantIncome, 0, data.changes.grantIncome],
      ["Net Income for Period", 0, 0, data.changes.netIncome, data.changes.netIncome],
      ...(data.changes.distributions !== 0 ? [["Distributions/Dividends", 0, 0, -data.changes.distributions, -data.changes.distributions]] : []),
      [],
      ["Ending Balance", data.endingBalance.contributed, data.endingBalance.grants, data.endingBalance.retained, data.endingBalance.total],
    ];
    
    const csv = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `equity-statement-${format(startDate, "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const wsData = [
      ["Statement of Changes in Equity", `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`],
      [],
      ["Component", "Contributed Capital", "Grant Funding", "Retained Earnings", "Total"],
      ["Beginning Balance", data.beginningBalance.contributed, data.beginningBalance.grants, data.beginningBalance.retained, data.beginningBalance.total],
      [],
      ["Changes During Period:"],
      ["Equity Contributions", data.changes.equityContributions, 0, 0, data.changes.equityContributions],
      ["Grant Income Recognized", 0, data.changes.grantIncome, 0, data.changes.grantIncome],
      ["Net Income for Period", 0, 0, data.changes.netIncome, data.changes.netIncome],
      ...(data.changes.distributions !== 0 ? [["Distributions/Dividends", 0, 0, -data.changes.distributions, -data.changes.distributions]] : []),
      [],
      ["Ending Balance", data.endingBalance.contributed, data.endingBalance.grants, data.endingBalance.retained, data.endingBalance.total],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equity Statement");
    XLSX.writeFile(wb, `equity-statement-${format(startDate, "yyyy-MM-dd")}.xlsx`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Statement of Changes in Equity</CardTitle>
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
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Component</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Contributed Capital</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Grant Funding</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Retained Earnings</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Beginning Balance */}
            <TableRow className="font-semibold bg-blue-50">
              <TableCell>Beginning Balance</TableCell>
              <TableCell className="text-right">{formatCurrency(data.beginningBalance.contributed)}</TableCell>
              <TableCell className="text-right">{formatCurrency(data.beginningBalance.grants)}</TableCell>
              <TableCell className="text-right">{formatCurrency(data.beginningBalance.retained)}</TableCell>
              <TableCell className="text-right text-blue-600">{formatCurrency(data.beginningBalance.total)}</TableCell>
            </TableRow>

            {/* Changes During Period */}
            <TableRow className="bg-slate-50">
              <TableCell colSpan={5} className="font-semibold text-slate-700 pt-4">
                Changes During Period:
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="pl-8">Equity Contributions</TableCell>
              <TableCell className="text-right text-emerald-600">
                {data.changes.equityContributions !== 0 ? formatCurrency(data.changes.equityContributions) : "—"}
              </TableCell>
              <TableCell className="text-right">—</TableCell>
              <TableCell className="text-right">—</TableCell>
              <TableCell className="text-right text-emerald-600">
                {data.changes.equityContributions !== 0 ? formatCurrency(data.changes.equityContributions) : "—"}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="pl-8">Grant Income Recognized</TableCell>
              <TableCell className="text-right">—</TableCell>
              <TableCell className="text-right text-emerald-600">
                {data.changes.grantIncome !== 0 ? formatCurrency(data.changes.grantIncome) : "—"}
              </TableCell>
              <TableCell className="text-right">—</TableCell>
              <TableCell className="text-right text-emerald-600">
                {data.changes.grantIncome !== 0 ? formatCurrency(data.changes.grantIncome) : "—"}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="pl-8">Net Income for Period</TableCell>
              <TableCell className="text-right">—</TableCell>
              <TableCell className="text-right">—</TableCell>
              <TableCell className={`text-right ${data.changes.netIncome >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(data.changes.netIncome)}
              </TableCell>
              <TableCell className={`text-right ${data.changes.netIncome >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(data.changes.netIncome)}
              </TableCell>
            </TableRow>

            {data.changes.distributions !== 0 && (
              <TableRow>
                <TableCell className="pl-8">Distributions/Dividends</TableCell>
                <TableCell className="text-right">—</TableCell>
                <TableCell className="text-right">—</TableCell>
                <TableCell className="text-right text-red-600">({formatCurrency(data.changes.distributions)})</TableCell>
                <TableCell className="text-right text-red-600">({formatCurrency(data.changes.distributions)})</TableCell>
              </TableRow>
            )}

            {/* Ending Balance */}
            <TableRow className="font-bold bg-emerald-50 border-t-4 border-slate-300">
              <TableCell className="text-lg">Ending Balance</TableCell>
              <TableCell className="text-right">{formatCurrency(data.endingBalance.contributed)}</TableCell>
              <TableCell className="text-right">{formatCurrency(data.endingBalance.grants)}</TableCell>
              <TableCell className="text-right">{formatCurrency(data.endingBalance.retained)}</TableCell>
              <TableCell className="text-right text-lg text-emerald-600">
                {formatCurrency(data.endingBalance.total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}