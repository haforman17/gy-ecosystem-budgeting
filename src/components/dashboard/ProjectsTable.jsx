import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, getLabel } from "../shared/StatusBadge";
import { formatCurrency } from "../shared/CurrencyFormat";
import { ChevronRight } from "lucide-react";

export default function ProjectsTable({ projects, lineItems, transactions }) {
  const getProjectBudget = (projectId) =>
    lineItems.filter((li) => li.project_id === projectId).reduce((sum, li) => sum + (li.budget_amount || 0), 0);

  const getProjectSpend = (projectId) =>
    transactions
      .filter((t) => t.project_id === projectId && t.transaction_type === "EXPENSE")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-800">All Projects</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/60">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Budget</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Spent</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">% Used</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const budget = getProjectBudget(project.id);
                const spend = getProjectSpend(project.id);
                const pct = budget > 0 ? Math.round((spend / budget) * 100) : 0;
                return (
                  <TableRow key={project.id} className="group hover:bg-slate-50/50 cursor-pointer">
                    <TableCell>
                      <Link
                        to={createPageUrl(`ProjectDetail?id=${project.id}`)}
                        className="font-medium text-slate-800 group-hover:text-emerald-700 transition-colors"
                      >
                        {project.name}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">{project.location}</p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600">{getLabel(project.project_type)}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={project.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-700 text-sm">
                      {formatCurrency(budget)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-700 text-sm">
                      {formatCurrency(spend)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct > 90 ? "bg-red-400" : pct > 70 ? "bg-amber-400" : "bg-emerald-400"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 font-medium w-8 text-right">{pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}