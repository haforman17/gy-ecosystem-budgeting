import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function BudgetLineItemForm({ projectId, categoryId, lineItem, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: lineItem?.name || "",
    description: lineItem?.description || "",
    budget_amount: lineItem?.budget_amount || 0,
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (lineItem) {
        return base44.entities.BudgetLineItem.update(lineItem.id, data);
      } else {
        return base44.entities.BudgetLineItem.create({
          ...data,
          project_id: projectId,
          category_id: categoryId,
        });
      }
    },
    onSuccess: () => {
      toast.success(lineItem ? "Line item updated" : "Line item created");
      queryClient.invalidateQueries({ queryKey: ["budgetLineItems"] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lineItem ? "Edit Line Item" : "New Line Item"}</DialogTitle>
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

          <div>
            <Label htmlFor="budget_amount">Budget Amount (£)</Label>
            <Input
              id="budget_amount"
              type="number"
              step="0.01"
              value={formData.budget_amount}
              onChange={(e) => setFormData({ ...formData, budget_amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}