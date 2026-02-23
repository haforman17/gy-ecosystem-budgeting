import MetricCard from "../shared/MetricCard";
import { formatCurrency } from "../shared/CurrencyFormat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingDown, TrendingUp, PiggyBank, FileText, Droplets, Landmark } from "lucide-react";
import { format } from "date-fns";
import { getLabel } from "../shared/StatusBadge";

export default function OverviewTab({ lineItems, revenueStreams, fundingSources, transactions, workingYear }) {
  const totalBudget = lineItems.reduce((sum, li) => sum + (li.budget_amount || 0), 0);
  const totalActualSpend = transactions
    .filter((t) => t.transaction_type === "EXPENSE")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const variance = totalBudget - totalActualSpend;
  // Filter revenue streams by working year (vintage)
  const yearRevenueStreams = workingYear
    ? revenueStreams.filter(rs => !rs.vintage || rs.vintage === workingYear.toString())
    : revenueStreams;
  const revenueForecast = yearRevenueStreams.reduce(
    (sum, rs) => sum + ((rs.estimated_volume || 0) * (rs.estimated_price_per_unit || rs.price_per_unit || 0)),
    0
  );

  const recentTx = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  const txTypeColors = {
    EXPENSE: "text-red-600",
    REVENUE: "text-emerald-600",
    FUNDING_DRAWDOWN: "text-blue-600",
    DEBT_REPAYMENT: "text-amber-600",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Wallet} label="Total Budget" value={formatCurrency(totalBudget)} />
        <MetricCard icon={TrendingDown} label="Actual Spend" value={formatCurrency(totalActualSpend)} />
        <MetricCard
          icon={PiggyBank}
          label="Variance"
          value={formatCurrency(variance)}
          subtitle={variance >= 0 ? "Under budget" : "Over budget"}
        />
        <MetricCard icon={TrendingUp} label="Revenue Forecast" value={formatCurrency(revenueForecast)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{lineItems.length}</p>
              <p className="text-xs text-slate-400 font-medium">Line Items</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Droplets className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{revenueStreams.length}</p>
              <p className="text-xs text-slate-400 font-medium">Revenue Streams</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{fundingSources.length}</p>
              <p className="text-xs text-slate-400 font-medium">Funding Sources</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-800">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentTx.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-400">No transactions yet</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.5">
                      {getLabel(tx.transaction_type)}
                    </Badge>
                    <span className="text-sm text-slate-700">{tx.description}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400">
                      {tx.date ? format(new Date(tx.date), "dd MMM yyyy") : "—"}
                    </span>
                    <span className={`text-sm font-semibold ${txTypeColors[tx.transaction_type] || "text-slate-700"}`}>
                      {tx.transaction_type === "EXPENSE" || tx.transaction_type === "DEBT_REPAYMENT" ? "−" : "+"}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}