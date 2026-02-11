import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function BudgetSubItemForm({ lineItemId, subItem, onClose }) {
  const [formData, setFormData] = useState({
    name: subItem?.name || "",
    description: subItem?.description || "",
    budget_amount: subItem?.budget_amount || 0,
    quantity: subItem?.quantity || 0,
    unit: subItem?.unit || "",
    unit_cost: subItem?.unit_cost || 0,
  });

  const queryClient = useQueryClient();

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
    
    // Calculate budget_amount from quantity and unit_cost if provided
    const finalData = { ...formData };
    if (formData.quantity && formData.unit_cost) {
      finalData.budget_amount = formData.quantity * formData.unit_cost;
    }
    
    saveMutation.mutate(finalData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subItem ? "Edit Sub-item" : "New Sub-item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., hours, items"
              />
            </div>
            <div>
              <Label htmlFor="unit_cost">Unit Cost (£)</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="budget_amount">Total Budget Amount (£)</Label>
            <Input
              id="budget_amount"
              type="number"
              step="0.01"
              value={formData.quantity && formData.unit_cost ? formData.quantity * formData.unit_cost : formData.budget_amount}
              onChange={(e) => setFormData({ ...formData, budget_amount: parseFloat(e.target.value) || 0 })}
              required
            />
            {formData.quantity && formData.unit_cost && (
              <p className="text-xs text-slate-500 mt-1">
                Auto-calculated: {formData.quantity} × £{formData.unit_cost} = £{(formData.quantity * formData.unit_cost).toFixed(2)}
              </p>
            )}
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