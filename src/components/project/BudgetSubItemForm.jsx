import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const TIER_1_OPTIONS = [
  "Habitat Conversion Costs",
  "Operating Costs",
  "Other"
];

const TIER_2_OPTIONS = {
  "Habitat Conversion Costs": [
    "Broadleaf Woodland creation",
    "Broadleaf Woodland improvement",
    "Floodplain Grassland creation",
    "Freshwater creation",
    "Hedgerow creation",
    "Scrub creation",
    "Grassland creation",
    "Grassland improvement",
    "Wetlands creation",
    "Wetlands improvement",
    "Conversion cost contingency"
  ],
  "Operating Costs": [
    "Set up costs",
    "Conversion payments",
    "Habitat condition payments",
    "CIC management costs",
    "MRV costs",
    "Maintenance costs",
    "Legal support",
    "Accounting/Audit support",
    "Stakeholder engagement",
    "Ongoing marketing",
    "Insurance",
    "ELR governance costs",
    "Transaction fees"
  ],
  "Other": ["Other"]
};

export default function BudgetSubItemForm({ lineItemId, subItem, onClose }) {
  const [formData, setFormData] = useState({
    tier_1_category: subItem?.tier_1_category || "",
    tier_2_category: subItem?.tier_2_category || "",
    tier_3_category: subItem?.tier_3_category || "",
    cost_type: subItem?.cost_type || "",
    name: subItem?.name || "",
    description: subItem?.description || "",
    budget_amount: subItem?.budget_amount || 0,
    month: subItem?.month || "",
    year: subItem?.year || new Date().getFullYear().toString(),
  });

  const queryClient = useQueryClient();

  // Reset tier 2 when tier 1 changes
  useEffect(() => {
    if (formData.tier_1_category && !TIER_2_OPTIONS[formData.tier_1_category]?.includes(formData.tier_2_category)) {
      setFormData(prev => ({ ...prev, tier_2_category: "" }));
    }
  }, [formData.tier_1_category]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (subItem) {
        await base44.entities.SubItem.update(subItem.id, data);
      } else {
        await base44.entities.SubItem.create({ 
          ...data, 
          line_item_id: lineItemId 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subItems"] });
      toast.success(subItem ? "Sub-item updated" : "Sub-item created");
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const tier2Options = formData.tier_1_category ? TIER_2_OPTIONS[formData.tier_1_category] : [];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{subItem ? "Edit Sub-item" : "New Sub-item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cost_type">Cost Type *</Label>
            <Select
              value={formData.cost_type}
              onValueChange={(value) => setFormData({ ...formData, cost_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cost type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OP_COSTS">Operating Costs</SelectItem>
                <SelectItem value="COGS">Cost of Goods Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tier_1_category">Tier 1 Category *</Label>
              <Select
                value={formData.tier_1_category}
                onValueChange={(value) => setFormData({ ...formData, tier_1_category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {TIER_1_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tier_2_category">Tier 2 Category</Label>
              <Select
                value={formData.tier_2_category}
                onValueChange={(value) => setFormData({ ...formData, tier_2_category: value })}
                disabled={!formData.tier_1_category}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.tier_1_category ? "Select..." : "Select Tier 1 first"} />
                </SelectTrigger>
                <SelectContent>
                  {tier2Options.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tier_3_category">Tier 3 Category</Label>
              <Input
                id="tier_3_category"
                value={formData.tier_3_category}
                onChange={(e) => setFormData({ ...formData, tier_3_category: e.target.value })}
                placeholder="Free text"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="budget_amount">Budget Amount (£) *</Label>
              <Input
                id="budget_amount"
                type="number"
                step="0.01"
                value={formData.budget_amount}
                onChange={(e) => setFormData({ ...formData, budget_amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="month">Month</Label>
              <Select
                value={formData.month}
                onValueChange={(value) => setFormData({ ...formData, month: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="January">January</SelectItem>
                  <SelectItem value="February">February</SelectItem>
                  <SelectItem value="March">March</SelectItem>
                  <SelectItem value="April">April</SelectItem>
                  <SelectItem value="May">May</SelectItem>
                  <SelectItem value="June">June</SelectItem>
                  <SelectItem value="July">July</SelectItem>
                  <SelectItem value="August">August</SelectItem>
                  <SelectItem value="September">September</SelectItem>
                  <SelectItem value="October">October</SelectItem>
                  <SelectItem value="November">November</SelectItem>
                  <SelectItem value="December">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year">Year *</Label>
              <Select
                value={formData.year}
                onValueChange={(value) => setFormData({ ...formData, year: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 16 }, (_, i) => 2020 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}