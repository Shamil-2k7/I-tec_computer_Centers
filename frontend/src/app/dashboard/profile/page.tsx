"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { api, getErrorMessage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const profileForm = useForm({ defaultValues: { name: user?.name || "", phone: user?.phone || "" } });
  const pwForm = useForm({ defaultValues: { currentPassword: "", newPassword: "" } });

  const onSaveProfile = async (values: any) => {
    setSaving(true);
    try {
      await api.put("/users/profile", values);
      await refreshUser();
      toast("Profile updated", "success");
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (values: any) => {
    setChangingPw(true);
    try {
      await api.put("/auth/change-password", values);
      pwForm.reset();
      toast("Password changed successfully", "success");
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-semibold">Profile</h1>

      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input {...profileForm.register("name")} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input {...profileForm.register("phone")} />
            </div>
            <Button type="submit" variant="accent" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={pwForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current password</Label>
              <Input type="password" {...pwForm.register("currentPassword", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>New password</Label>
              <Input type="password" {...pwForm.register("newPassword", { required: true, minLength: 6 })} />
            </div>
            <Button type="submit" variant="outline" disabled={changingPw}>{changingPw ? "Updating..." : "Change password"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
