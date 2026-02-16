import MetricCard from "../shared/MetricCard";
import { formatCurrency } from "../shared/CurrencyFormat";
import { FolderTree, Wallet, TrendingUp, PiggyBank } from "lucide-react";

export default function DashboardMetrics({ projects, lineItems, revenueStreams, fundingSources, transactions }) {
  const totalBudget = lineItems.reduce((sum, li) => sum + (li.budget_amount || 0), 0);
  const totalActualSpend = transactions
    .filter((t) => t.transaction_type === "EXPENSE")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalRevenueForecast = revenueStreams.reduce(
    (sum, rs) => sum + ((rs.estimated_volume || 0) * (rs.estimated_price_per_unit || rs.price_per_unit || 0)),
    0
  );
  const totalFundingDrawn = transactions
    .filter((t) => t.transaction_type === "FUNDING_DRAWDOWN")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const cashPosition = totalFundingDrawn - totalActualSpend;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={FolderTree}
        label="Total Projects"
        value={projects.length}
        subtitle={`${projects.filter((p) => p.status === "ACTIVE").length} active`}
      />
      <MetricCard
        icon={Wallet}
        label="Total Budget"
        value={formatCurrency(totalBudget)}
        subtitle={`${formatCurrency(totalActualSpend)} spent`}
      />
      <MetricCard
        icon={TrendingUp}
        label="Revenue Forecast"
        value={formatCurrency(totalRevenueForecast)}
        subtitle={`${revenueStreams.length} streams`}
      />
      <MetricCard
        icon={PiggyBank}
        label="Cash Position"
        value={formatCurrency(cashPosition)}
        subtitle={`${formatCurrency(totalFundingDrawn)} drawn`}
      />
    </div>
  );
}