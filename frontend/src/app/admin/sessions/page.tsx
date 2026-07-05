"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/lib/api";
import { Session, User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/context/ToastContext";
import { LogOut, Monitor, Smartphone } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default function AdminSessionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const userId = params.get("userId");
  const [removeTarget, setRemoveTarget] = useState<Session | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-sessions", userId],
    queryFn: async () => {
      const url = userId ? `/sessions/user/${userId}` : "/sessions";
      const res = await api.get<{ data: Session[] }>(url, { params: userId ? {} : { active: true } });
      return res.data.data;
    },
  });

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await api.delete(`/sessions/${removeTarget._id}`);
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
      toast("Session removed", "success");
      setRemoveTarget(null);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Devices & Sessions</h1>
        <p className="text-sm text-muted-foreground">
          {userId ? "Viewing devices for a specific student." : "All active sessions across the platform."} Each student is limited to 2 devices.
        </p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3 font-medium">User</th>
              <th className="p-3 font-medium">Device</th>
              <th className="p-3 font-medium">IP</th>
              <th className="p-3 font-medium">Last Active</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="p-3"><Skeleton className="h-8 w-full" /></td></tr>
              ))
            ) : data?.length ? (
              data.map((s) => (
                <tr key={s._id} className="border-t border-border">
                  <td className="p-3 font-medium">{typeof s.user === "object" ? (s.user as User).name : "—"}</td>
                  <td className="p-3 flex items-center gap-2">
                    {s.device === "mobile" ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                    {s.browser} · {s.os}
                  </td>
                  <td className="p-3 text-muted-foreground">{s.ip}</td>
                  <td className="p-3 text-muted-foreground">{timeAgo(s.lastActivity)}</td>
                  <td className="p-3"><Badge variant={s.isActive ? "success" : "outline"}>{s.isActive ? "Active" : "Ended"}</Badge></td>
                  <td className="p-3 text-right">
                    {s.isActive && (
                      <Button variant="ghost" size="icon" title="Force logout" onClick={() => setRemoveTarget(s)}>
                        <LogOut className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No sessions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Force logout this device?"
        description="The user will be immediately signed out of this session and will need to log in again."
        onConfirm={handleRemove}
        confirmText="Log out device"
      />
    </div>
  );
}
