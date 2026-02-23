import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, UserPlus, X, FolderOpen } from "lucide-react";

function ProjectCollaborators({ project, currentUser, allUsers }) {
  const queryClient = useQueryClient();
  const [emailInput, setEmailInput] = useState("");

  const collaboratorIds = project.collaborators || [];
  const collaboratorUsers = allUsers.filter(
    (u) => collaboratorIds.includes(u.id) || collaboratorIds.includes(u.email)
  );

  const updateCollaborators = useMutation({
    mutationFn: (newCollaborators) =>
      base44.entities.Project.update(project.id, { collaborators: newCollaborators }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects-owned"] });
      toast.success("Collaborators updated");
    },
    onError: () => toast.error("Failed to update collaborators"),
  });

  const addCollaborator = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;
    const found = allUsers.find((u) => u.email?.toLowerCase() === trimmed);
    if (!found) { toast.error("No user found with that email"); return; }
    if (found.id === currentUser?.id || found.email === currentUser?.email) { toast.error("You are already the owner"); return; }
    if (collaboratorIds.includes(found.id) || collaboratorIds.includes(found.email)) { toast.info("User is already a collaborator"); return; }
    updateCollaborators.mutate([...collaboratorIds, found.id]);
    setEmailInput("");
  };

  const removeCollaborator = (userId) => {
    updateCollaborators.mutate(collaboratorIds.filter((c) => c !== userId));
  };

  return (
    <div className="space-y-3">
      {/* Owner */}
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-sm">
        <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
          {currentUser?.full_name?.charAt(0) || "O"}
        </div>
        <div>
          <span className="font-medium text-slate-800">{currentUser?.full_name}</span>
          <span className="text-xs text-emerald-600 ml-2">Owner</span>
        </div>
      </div>

      {/* Collaborators */}
      {collaboratorUsers.map((u) => (
        <div key={u.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
              {u.full_name?.charAt(0) || "?"}
            </div>
            <div>
              <span className="font-medium text-slate-800">{u.full_name}</span>
              <span className="text-xs text-slate-400 ml-2">{u.email}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:text-red-500"
            onClick={() => removeCollaborator(u.id)}
            disabled={updateCollaborators.isPending}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      {/* Add */}
      <div className="flex gap-2 pt-1">
        <Input
          placeholder="Collaborator email address"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCollaborator(); } }}
          className="flex-1 text-sm"
        />
        <Button
          size="sm"
          onClick={addCollaborator}
          disabled={!emailInput.trim() || updateCollaborators.isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <UserPlus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}

export default function ProjectAccessSection({ user }) {
  const { data: allProjects = [] } = useQuery({
    queryKey: ["projects-owned"],
    queryFn: () => base44.entities.Project.list("-created_date"),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const ownedProjects = allProjects.filter(
    (p) => p.owner_id === user?.id || p.created_by === user?.email
  );

  if (ownedProjects.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FolderOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">You don't own any projects yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">Manage who has access to your projects.</p>
      {ownedProjects.map((project) => (
        <Card key={project.id}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users className="h-4 w-4 text-slate-500" />
              {project.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectCollaborators project={project} currentUser={user} allUsers={allUsers} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}