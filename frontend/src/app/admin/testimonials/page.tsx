"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api, getErrorMessage } from "@/lib/api";
import { Testimonial } from "@/types";
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
import { Plus, Pencil, Trash2, Star } from "lucide-react";

const emptyForm = { name: "", designation: "", message: "", photo: "", rating: 5, isActive: true };

export default function AdminTestimonialsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm({ defaultValues: emptyForm });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => (await api.get<{ data: Testimonial[] }>("/testimonials")).data.data,
  });

  const openCreate = () => { setEditing(null); reset(emptyForm); setDialogOpen(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); reset({ name: t.name, designation: t.designation, message: t.message, photo: t.photo, rating: t.rating, isActive: t.isActive }); setDialogOpen(true); };

  const onSubmit = async (values: any) => {
    setSaving(true);
    try {
      if (editing) await api.put(`/testimonials/${editing._id}`, values);
      else await api.post("/testimonials", values);
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast("Testimonial saved", "success");
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
      await api.delete(`/testimonials/${deleteTarget._id}`);
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast("Testimonial removed", "success");
      setDeleteTarget(null);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-semibold">Testimonials</h1><p className="text-sm text-muted-foreground">Manage homepage testimonials.</p></div>
        <Button variant="accent" onClick={openCreate}><Plus className="h-4 w-4" /> Add Testimonial</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
          : data?.map((t) => (
              <Card key={t._id} className="p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{t.name}</p>
                  <Badge variant={t.isActive ? "success" : "outline"}>{t.isActive ? "Active" : "Hidden"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{t.designation}</p>
                <p className="text-xs line-clamp-3 flex-1 mb-2">&ldquo;{t.message}&rdquo;</p>
                <div className="flex mb-3">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />)}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteTarget(t)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </Card>
            ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5"><Label>Name</Label><Input {...register("name", { required: true })} /></div>
            <div className="space-y-1.5"><Label>Designation</Label><Input {...register("designation")} /></div>
            <div className="space-y-1.5"><Label>Message</Label><Textarea rows={3} {...register("message", { required: true })} /></div>
            <div className="space-y-1.5"><Label>Photo URL</Label><Input {...register("photo")} /></div>
            <div className="space-y-1.5"><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} {...register("rating", { valueAsNumber: true })} /></div>
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
        title="Remove testimonial?"
        description={`Testimonial from "${deleteTarget?.name}" will be removed.`}
        onConfirm={handleDelete}
        confirmText="Remove"
      />
    </div>
  );
}
