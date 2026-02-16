import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Copy, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export default function ScenarioManager({ 
  scenarios = [], 
  currentScenarioId, 
  onSelectScenario, 
  onSaveScenario, 
  onDuplicateScenario,
  onDeleteScenario 
}) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioToDelete, setScenarioToDelete] = useState(null);

  const handleSaveNew = () => {
    if (!currentScenarioId && !scenarioName.trim()) {
      toast.error("Please enter a scenario name");
      return;
    }
    
    const name = currentScenarioId 
      ? (scenarios.find(s => s.id === currentScenarioId)?.scenario_name || scenarioName.trim())
      : scenarioName.trim();
    
    onSaveScenario(name);
    setScenarioName("");
    setShowSaveDialog(false);
  };

  const handleDuplicate = () => {
    if (!currentScenarioId) {
      toast.error("Please select a scenario to duplicate");
      return;
    }
    const currentScenario = scenarios.find(s => s.id === currentScenarioId);
    if (currentScenario) {
      onDuplicateScenario(currentScenario);
    }
  };

  const handleDelete = () => {
    if (scenarioToDelete) {
      onDeleteScenario(scenarioToDelete);
      setShowDeleteDialog(false);
      setScenarioToDelete(null);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={currentScenarioId || "none"} onValueChange={(val) => onSelectScenario(val === "none" ? null : val)}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="No scenario selected" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-slate-500 italic">No scenario (default forecast)</span>
          </SelectItem>
          {scenarios.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              <div className="flex flex-col">
                <span>{s.scenario_name || s.name}</span>
                {s.updated_date && (
                  <span className="text-xs text-slate-400">
                    Modified: {new Date(s.updated_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button size="sm" onClick={() => setShowSaveDialog(true)}>
        <Save className="h-4 w-4 mr-2" />
        {currentScenarioId ? "Update" : "Save Scenario"}
      </Button>

      {currentScenarioId && (
        <>
          <Button size="sm" variant="outline" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-red-500 hover:text-red-600"
            onClick={() => {
              setScenarioToDelete(currentScenarioId);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </>
      )}

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentScenarioId ? "Update Scenario" : "Save New Scenario"}</DialogTitle>
            <DialogDescription>
              {currentScenarioId 
                ? `Update "${scenarios.find(s => s.id === currentScenarioId)?.scenario_name}" with your current changes` 
                : "Enter a name for your forecast scenario"}
            </DialogDescription>
          </DialogHeader>
          {!currentScenarioId && (
            <Input
              placeholder="Scenario name (e.g., Base Case, Conservative, Optimistic)"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveNew()}
            />
          )}
          {currentScenarioId && (
            <p className="text-sm text-slate-600">
              This will update the existing scenario with your current forecast values.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNew}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scenario</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scenario? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}