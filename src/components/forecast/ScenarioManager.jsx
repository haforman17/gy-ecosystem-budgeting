import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Copy, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export default function ScenarioManager({ 
  scenarios, 
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
    if (!scenarioName.trim()) {
      toast.error("Please enter a scenario name");
      return;
    }
    onSaveScenario(scenarioName.trim());
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
      {scenarios.length > 0 && (
        <Select value={currentScenarioId || ""} onValueChange={onSelectScenario}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select scenario" />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button size="sm" onClick={() => setShowSaveDialog(true)}>
        <Save className="h-4 w-4 mr-2" />
        {currentScenarioId ? "Update Scenario" : "Save as Scenario"}
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
                ? "Update the current scenario with your changes" 
                : "Enter a name for your forecast scenario"}
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Scenario name (e.g., Base Case, Conservative, Optimistic)"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveNew()}
          />
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