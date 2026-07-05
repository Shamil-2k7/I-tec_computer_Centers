"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api, getErrorMessage } from "@/lib/api";
import { FAQItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/context/ToastContext";
import { Plus, Pencil, Trash2 } from "lucide-react";

const emptyForm = { question: "", answer: "", isActive: true };

export default function AdminFAQPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FAQItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FAQItem | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm({ defaultValues: emptyForm });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-faq"],
    queryFn: async () => (await api.get<{ data: FAQItem[] }>("/faq")).data.data,
  });

  const openCreate = () => { setEditing(null); reset(emptyForm); setDialogOpen(true); };
  const openEdit = (f: FAQItem) => { setEditing(f); reset({ question: f.question, answer: f.answer, isActive: f.isActive }); setDialogOpen(true); };

  const onSubmit = async (values: any) => {
    setSaving(true);
    try {
      if (editing) await api.put(`/faq/${editing._id}`, values);
      else await api.post("/faq", values);
      queryClient.invalidateQueries({ queryKey: ["admin-faq"] });
      toast("FAQ saved", "success");
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
      await api.delete(`/faq/${deleteTarget._id}`);
      queryClient.invalidateQueries({ queryKey: ["admin-faq"] });
      toast("FAQ removed", "success");
      setDeleteTarget(null);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-semibold">FAQ</h1><p className="text-sm text-muted-foreground">Manage frequently asked questions.</p></div>
        <Button variant="accent" onClick={openCreate}><Plus className="h-4 w-4" /> Add FAQ</Button>
      </div>

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          : data?.map((f) => (
              <div key={f._id} className="border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{f.question}</p>
                    <Badge variant={f.isActive ? "success" : "outline"}>{f.isActive ? "Active" : "Hidden"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{f.answer}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(f)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5"><Label>Question</Label><Input {...register("question", { required: true })} /></div>
            <div className="space-y-1.5"><Label>Answer</Label><Textarea rows={4} {...register("answer", { required: true })} /></div>
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
        title="Remove FAQ?"
        description="This question will be removed from the homepage."
        onConfirm={handleDelete}
        confirmText="Remove"
      />
    </div>
  );
}
