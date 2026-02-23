import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { User, Save } from "lucide-react";

export default function ProfileSection({ user, onUpdate }) {
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    job_title: user?.job_title || "",
    department: user?.department || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      full_name: user?.full_name || "",
      email: user?.email || "",
      job_title: user?.job_title || "",
      department: user?.department || "",
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ job_title: form.job_title, department: form.department });
    toast.success("Profile updated");
    setSaving(false);
    onUpdate?.();
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4 text-slate-500" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={form.full_name} disabled className="bg-slate-50 text-slate-500" />
            <p className="text-xs text-slate-400">Managed by your account provider</p>
          </div>
          <div className="space-y-1.5">
            <Label>Email Address</Label>
            <Input value={form.email} disabled className="bg-slate-50 text-slate-500" />
            <p className="text-xs text-slate-400">Managed by your account provider</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job_title">Job Title</Label>
            <Input
              id="job_title"
              value={form.job_title}
              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              placeholder="e.g. Project Manager"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. Conservation"
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}