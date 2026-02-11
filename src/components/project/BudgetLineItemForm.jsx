import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function BudgetLineItemForm({ projectId, categoryId, lineItem, onClose }) {
  const [formData, setFormData] = useState({
    description: lineItem?.description || "",
    budget_amount: lineItem?.budget_amount || 0,
    category: lineItem?.category || "OTHER",
    date: lineItem?.date || new Date().toISOString().split('T')[0],
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (lineItem) {
        await base44.entities.LineItem.update(lineItem.id, data);
      } else {
        await base44.entities.LineItem.create({ 
          ...data, 
          project_id: projectId,
          budget_category_id: categoryId 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lineItems", projectId] });
      toast.success(lineItem ? "Line item updated" : "Line item created");
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lineItem ? "Edit Line Item" : "New Line Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="budget_amount">Budget Amount (£)</Label>
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
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
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