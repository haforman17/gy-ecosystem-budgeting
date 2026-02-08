import { Card, CardContent } from "@/components/ui/card";

export default function MetricCard({ icon: Icon, label, value, subtitle, trend, className = "" }) {
  return (
    <Card className={`relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Icon className="h-5 w-5 text-emerald-600" />
            </div>
          )}
        </div>
        {trend && (
          <div className={`mt-3 text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% from last month
          </div>
        )}
      </CardContent>
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-8 translate-x-8" />
    </Card>
  );
}