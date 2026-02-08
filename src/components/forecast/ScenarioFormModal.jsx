import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ScenarioFormModal({ open, onOpenChange, projectId, scenario }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(
    scenario || {
      scenario_name: "",
      description: "",
      assumptions: {
        carbon_price: 25,
        bng_habitat_price: 42000,
        bng_hedgerow_price: 28000,
        watercourse_price: 35000,
        nfm_price: 15000,
        price_escalation_rate: 0.03,
        maintenance_cost_increase: 0.02,
        establishment_success_rate: 0.95,
        annual_mortality_rate: 0.01,
        discount_rate: 0.05,
      },
    }
  );

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (scenario?.id) {
        return base44.entities.ForecastScenario.update(scenario.id, data);
      }
      return base44.entities.ForecastScenario.create({ ...data, project_id: projectId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forecastScenarios"] });
      toast.success(scenario ? "Scenario updated" : "Scenario created");
      onOpenChange(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{scenario ? "Edit Scenario" : "New Forecast Scenario"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Scenario Name *</Label>
            <Input
              value={formData.scenario_name}
              onChange={(e) => setFormData({ ...formData, scenario_name: e.target.value })}
              placeholder="e.g., Base Case, Optimistic, Conservative"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the key assumptions of this scenario"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Carbon Price (£/tCO2e)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.assumptions.carbon_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assumptions: { ...formData.assumptions, carbon_price: parseFloat(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <Label>BNG Habitat (£/unit)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.assumptions.bng_habitat_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assumptions: { ...formData.assumptions, bng_habitat_price: parseFloat(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <Label>BNG Hedgerow (£/unit)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.assumptions.bng_hedgerow_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assumptions: { ...formData.assumptions, bng_hedgerow_price: parseFloat(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <Label>Watercourse (£/unit)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.assumptions.watercourse_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assumptions: { ...formData.assumptions, watercourse_price: parseFloat(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <Label>Price Escalation (%)</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.assumptions.price_escalation_rate * 100}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assumptions: { ...formData.assumptions, price_escalation_rate: parseFloat(e.target.value) / 100 },
                  })
                }
              />
            </div>
            <div>
              <Label>Maintenance Cost Increase (%)</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.assumptions.maintenance_cost_increase * 100}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assumptions: {
                      ...formData.assumptions,
                      maintenance_cost_increase: parseFloat(e.target.value) / 100,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : scenario ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}