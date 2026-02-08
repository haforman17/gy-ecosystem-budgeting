import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function ComplianceItemForm({ open, onOpenChange, item, projects, fundingSources, onSuccess }) {
  const [formData, setFormData] = useState({
    project_id: "",
    funding_source_id: "",
    item_type: "GRANT_REPORT",
    title: "",
    description: "",
    due_date: "",
    priority: "MEDIUM",
    assigned_to: "",
    notes: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        project_id: item.project_id || "",
        funding_source_id: item.funding_source_id || "",
        item_type: item.item_type || "GRANT_REPORT",
        title: item.title || "",
        description: item.description || "",
        due_date: item.due_date || "",
        priority: item.priority || "MEDIUM",
        assigned_to: item.assigned_to || "",
        notes: item.notes || "",
      });
    } else {
      setFormData({
        project_id: "",
        funding_source_id: "",
        item_type: "GRANT_REPORT",
        title: "",
        description: "",
        due_date: "",
        priority: "MEDIUM",
        assigned_to: "",
        notes: "",
      });
    }
  }, [item]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (item) {
        return base44.entities.ComplianceItem.update(item.id, data);
      } else {
        return base44.entities.ComplianceItem.create(data);
      }
    },
    onSuccess: () => {
      toast.success(item ? "Compliance item updated" : "Compliance item created");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to save compliance item");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.project_id || !formData.title || !formData.due_date) {
      toast.error("Please fill in all required fields");
      return;
    }
    saveMutation.mutate(formData);
  };

  const projectFundingSources = fundingSources.filter(
    fs => fs.project_id === formData.project_id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Compliance Item" : "Add Compliance Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project_id">Project *</Label>
            <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_type">Item Type *</Label>
            <Select value={formData.item_type} onValueChange={(value) => setFormData({ ...formData, item_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GRANT_REPORT">Grant Report</SelectItem>
                <SelectItem value="DEBT_COVENANT">Debt Covenant</SelectItem>
                <SelectItem value="VERIFICATION_DEADLINE">Verification Deadline</SelectItem>
                <SelectItem value="REGULATORY_FILING">Regulatory Filing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {projectFundingSources.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="funding_source_id">Related Funding Source (Optional)</Label>
              <Select 
                value={formData.funding_source_id} 
                onValueChange={(value) => setFormData({ ...formData, funding_source_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select funding source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {projectFundingSources.map((fs) => (
                    <SelectItem key={fs.id} value={fs.id}>
                      {fs.funder_name} - {fs.funding_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Q1 Grant Report Submission"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this compliance item"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Internal notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : item ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}