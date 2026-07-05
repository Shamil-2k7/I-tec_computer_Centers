"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api, getErrorMessage } from "@/lib/api";
import { TeamMember } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/context/ToastContext";
import { Plus, Pencil, Trash2 } from "lucide-react";

const emptyForm = { name: "", role: "", bio: "", photo: "", isActive: true };

export default function AdminTeamPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm({ defaultValues: emptyForm });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-team"],
    queryFn: async () => (await api.get<{ data: TeamMember[] }>("/team")).data.data,
  });

  const openCreate = () => { setEditing(null); reset(emptyForm); setDialogOpen(true); };
  const openEdit = (m: TeamMember) => { setEditing(m); reset({ name: m.name, role: m.role, bio: m.bio, photo: m.photo, isActive: m.isActive }); setDialogOpen(true); };

  const onSubmit = async (values: any) => {
    setSaving(true);
    try {
      if (editing) await api.put(`/team/${editing._id}`, values);
      else await api.post("/team", values);
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      toast("Team member saved", "success");
      setDialogOpen(false);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/team/${deleteTarget._id}`);
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      toast("Team member removed", "success");
      setDeleteTarget(null);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-semibold">Team</h1><p className="text-sm text-muted-foreground">Manage the "Our Team" homepage section.</p></div>
        <Button variant="accent" onClick={openCreate}><Plus className="h-4 w-4" /> Add Member</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
          : data?.map((m) => (
              <Card key={m._id} className="p-4 flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-display">{m.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.role}</p>
                  </div>
                  <Badge variant={m.isActive ? "success" : "outline"}>{m.isActive ? "Active" : "Hidden"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3">{m.bio}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteTarget(m)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </Card>
            ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Team Member" : "Add Team Member"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5"><Label>Name</Label><Input {...register("name", { required: true })} /></div>
            <div className="space-y-1.5"><Label>Role</Label><Input {...register("role", { required: true })} /></div>
            <div className="space-y-1.5"><Label>Bio</Label><Textarea rows={3} {...register("bio")} /></div>
            <div className="space-y-1.5"><Label>Photo URL</Label><Input {...register("photo")} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="accent" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove team member?"
        description={`"${deleteTarget?.name}" will be removed from the homepage.`}
        onConfirm={handleDelete}
        confirmText="Remove"
      />
    </div>
  );
}
