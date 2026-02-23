import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, SlidersHorizontal, Users, Layers, Lock, FolderKey } from "lucide-react";
import ProjectAccessSection from "@/components/settings/ProjectAccessSection";
import ProfileSection from "@/components/settings/ProfileSection";
import PreferencesSection from "@/components/settings/PreferencesSection";
import UserManagementSection from "@/components/settings/UserManagementSection";
import BudgetPicklistSection from "@/components/settings/BudgetPicklistSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function SecuritySection() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lock className="h-4 w-4 text-slate-500" />
          Security
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-700 mb-1">Change Password</p>
          <p className="text-slate-500 text-xs mb-3">Password changes are managed through your account provider. Click below to initiate a password reset.</p>
          <Button variant="outline" size="sm" onClick={() => { toast.info("A password reset link would be sent to your email."); }}>
            Send Password Reset Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadUser = async () => {
    const me = await base44.auth.me();
    setUser(me);
    setIsAdmin(me?.role === "admin" || me?.app_role === "Admin");
  };

  useEffect(() => { loadUser(); }, []);

  if (!user) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading settings...</div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account, preferences, and project configuration</p>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="mb-6 bg-slate-100">
          <TabsTrigger value="account" className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Account
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Preferences
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users" className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Users & Roles
            </TabsTrigger>
          )}
          <TabsTrigger value="config" className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Project Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-5">
          <ProfileSection user={user} onUpdate={loadUser} />
          <SecuritySection />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesSection user={user} onUpdate={loadUser} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="users">
            <UserManagementSection />
          </TabsContent>
        )}

        <TabsContent value="config">
          <BudgetPicklistSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}