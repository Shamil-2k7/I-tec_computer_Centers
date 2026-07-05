"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/lib/api";
import { Session } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/context/ToastContext";
import { Monitor, Smartphone, LogOut } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function DevicesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmAll, setConfirmAll] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["my-sessions"],
    queryFn: async () => (await api.get<{ data: Session[] }>("/sessions/me")).data.data,
  });

  const removeSession = async (id: string) => {
    try {
      await api.delete(`/sessions/me/${id}`);
      queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
      toast("Device logged out", "success");
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  const removeAll = async () => {
    try {
      await api.delete("/sessions/me");
      queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
      toast("Logged out of all devices", "success");
      setConfirmAll(false);
      window.location.href = "/login";
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">My Devices</h1>
          <p className="text-sm text-muted-foreground">You can be logged in from up to 2 devices at a time.</p>
        </div>
        {!!data?.length && (
          <Button variant="destructive" size="sm" onClick={() => setConfirmAll(true)}>Log out all</Button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : data?.length ? (
          data.map((session) => (
            <Card key={session._id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  {session.device === "mobile" ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{session.browser} · {session.os}</p>
                  <p className="text-xs text-muted-foreground">
                    IP {session.ip} · Last active {timeAgo(session.lastActivity)}
                  </p>
                </div>
                <Badge variant="success">Active</Badge>
                <Button variant="ghost" size="icon" onClick={() => removeSession(session._id)} title="Log out this device">
                  <LogOut className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">No active devices found.</p>
        )}
      </div>

      <ConfirmDialog
        open={confirmAll}
        onOpenChange={setConfirmAll}
        title="Log out of all devices?"
        description="This will end your session on every device, including this one. You'll need to log in again."
        onConfirm={removeAll}
        confirmText="Log out all"
      />
    </div>
  );
}
