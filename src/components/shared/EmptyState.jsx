import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export default function EmptyState({ icon: Icon = Leaf, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-emerald-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}