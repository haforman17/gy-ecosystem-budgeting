import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Users, UserPlus, Trash2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const roleColors = {
  Admin: "bg-red-100 text-red-700",
  "Project Manager": "bg-blue-100 text-blue-700",
  "Finance Viewer": "bg-slate-100 text-slate-600",
};

export default function UserManagementSection() {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Project Manager");
  const [inviting, setInviting] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ["settings-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings-users"] }); toast.success("User updated"); },
    onError: () => toast.error("Failed to update user"),
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, inviteRole === "Admin" ? "admin" : "user");
    toast.success(`Invite sent to ${inviteEmail}`);
    setInviteEmail("");
    setInviting(false);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-slate-500" />
          Permissions & Roles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invite */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
            <UserPlus className="h-4 w-4" /> Invite New User
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="Finance Viewer">Finance Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3">
            <Button onClick={handleInvite} disabled={!inviteEmail || inviting} className="bg-emerald-600 hover:bg-emerald-700">
              <UserPlus className="h-4 w-4 mr-2" />
              {inviting ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </div>

        {/* Current users */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
            <Shield className="h-4 w-4" /> Current Users
          </p>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
                    {u.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{u.full_name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={u.app_role || "Project Manager"}
                    onValueChange={(v) => updateUserMutation.mutate({ id: u.id, data: { app_role: v } })}
                  >
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Project Manager">Project Manager</SelectItem>
                      <SelectItem value="Finance Viewer">Finance Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex flex-col gap-1 text-xs text-slate-500 min-w-[120px]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={u.can_edit_budgets !== false}
                        onChange={(e) => updateUserMutation.mutate({ id: u.id, data: { can_edit_budgets: e.target.checked } })}
                        className="rounded"
                      />
                      Edit Budgets
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={u.can_edit_forecasts !== false}
                        onChange={(e) => updateUserMutation.mutate({ id: u.id, data: { can_edit_forecasts: e.target.checked } })}
                        className="rounded"
                      />
                      Edit Forecasts
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}