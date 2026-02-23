import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Layers, Plus, X } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_TIER1 = ["Habitat Conversion Costs", "Operating Costs", "Other"];
const DEFAULT_TIER2 = {
  "Habitat Conversion Costs": ["Land Purchase", "Site Preparation", "Planting & Seeding", "Infrastructure"],
  "Operating Costs": ["Monitoring & Reporting", "Management & Maintenance", "Administration", "Insurance"],
  "Other": ["Contingency", "Miscellaneous"],
};
const DEFAULT_TIER3 = ["Labour", "Materials", "Contracted Services", "Equipment", "Travel"];

const LS_KEY = "budget_picklists";

function loadPicklists() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { tier1: DEFAULT_TIER1, tier2: DEFAULT_TIER2, tier3: DEFAULT_TIER3 };
}

function TagInput({ values, onChange, placeholder }) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setInput("");
  };

  const remove = (val) => onChange(values.filter((v) => v !== val));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="flex items-center gap-1 pr-1">
            {v}
            <button onClick={() => remove(v)} className="hover:text-red-500 ml-1">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default function BudgetPicklistSection() {
  const [picklists, setPicklists] = useState(loadPicklists);
  const [selectedTier1, setSelectedTier1] = useState(picklists.tier1[0] || "");

  const save = (updated) => {
    setPicklists(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    toast.success("Picklists saved");
  };

  const updateTier1 = (vals) => {
    const updated = { ...picklists, tier1: vals };
    // keep tier2 map intact
    setSelectedTier1(vals[0] || "");
    save(updated);
  };

  const updateTier2ForSelected = (vals) => {
    const updated = { ...picklists, tier2: { ...picklists.tier2, [selectedTier1]: vals } };
    save(updated);
  };

  const updateTier3 = (vals) => save({ ...picklists, tier3: vals });

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-4 w-4 text-slate-500" />
          Budget Builder Picklists
        </CardTitle>
        <p className="text-sm text-slate-500">Configure the dropdown values available in the Budget Builder for each tier.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tier 1 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Tier 1 Categories</label>
          <TagInput
            values={picklists.tier1}
            onChange={updateTier1}
            placeholder="Add Tier 1 category..."
          />
        </div>

        {/* Tier 2 — contextual on tier1 */}
        {picklists.tier1.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-700">Tier 2 Categories</label>
              <span className="text-xs text-slate-400">— for:</span>
              <div className="flex flex-wrap gap-1.5">
                {picklists.tier1.map((t1) => (
                  <button
                    key={t1}
                    onClick={() => setSelectedTier1(t1)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedTier1 === t1
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"
                    }`}
                  >
                    {t1}
                  </button>
                ))}
              </div>
            </div>
            {selectedTier1 && (
              <TagInput
                values={picklists.tier2[selectedTier1] || []}
                onChange={updateTier2ForSelected}
                placeholder={`Add Tier 2 under "${selectedTier1}"...`}
              />
            )}
          </div>
        )}

        {/* Tier 3 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Tier 3 Categories <span className="text-xs font-normal text-slate-400">(global)</span></label>
          <TagInput
            values={picklists.tier3}
            onChange={updateTier3}
            placeholder="Add Tier 3 category..."
          />
        </div>
      </CardContent>
    </Card>
  );
}