"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api, getErrorMessage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/context/ToastContext";

interface Settings {
  siteName: string; siteLogo: string; favicon: string;
  maintenanceMode: boolean; maxDevicesPerStudent: number; currency: string;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => (await api.get<{ data: Settings }>("/settings")).data.data,
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm<Settings>({ defaultValues: {} as Settings });

  useEffect(() => { if (data) reset(data); }, [data, reset]);

  const onSubmit = async (values: Settings) => {
    setSaving(true);
    try {
      await api.put("/settings", values);
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast("Settings updated", "success");
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Global platform configuration.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Site name</Label><Input {...register("siteName")} /></div>
          <div className="space-y-1.5"><Label>Site logo URL</Label><Input {...register("siteLogo")} /></div>
          <div className="space-y-1.5"><Label>Favicon URL</Label><Input {...register("favicon")} /></div>
          <div className="space-y-1.5"><Label>Currency</Label><Input {...register("currency")} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Access Control</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Max devices per student</Label>
            <Input type="number" min={1} max={10} {...register("maxDevicesPerStudent", { valueAsNumber: true })} />
            <p className="text-xs text-muted-foreground">
              Note: changing this updates the setting record; the enforced limit used by the API is read from the
              <code className="mx-1 px-1 rounded bg-muted">MAX_DEVICES_PER_STUDENT</code> environment variable on the backend.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Maintenance mode</Label>
              <p className="text-xs text-muted-foreground">Temporarily disable public access to the site.</p>
            </div>
            <Switch checked={watch("maintenanceMode")} onCheckedChange={(v) => setValue("maintenanceMode", v)} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" variant="accent" disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
    </form>
  );
}
