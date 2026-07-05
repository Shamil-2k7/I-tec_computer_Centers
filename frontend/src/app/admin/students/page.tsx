"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api, getErrorMessage } from "@/lib/api";
import { User, PaginatedMeta } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/context/ToastContext";
import { Plus, Pencil, Trash2, Ban, CheckCircle2, Search, Monitor } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminStudentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: "", email: "", password: "", phone: "" } });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-students", page, search],
    queryFn: async () => {
      const res = await api.get<{ data: User[]; meta: PaginatedMeta }>("/users", {
        params: { role: "student", page, limit: 10, search: search || undefined },
      });
      return res.data;
    },
  });

  const openCreate = () => { setEditing(null); reset({ name: "", email: "", password: "", phone: "" }); setDialogOpen(true); };
  const openEdit = (u: User) => { setEditing(u); reset({ name: u.name, email: u.email, password: "", phone: u.phone || "" }); setDialogOpen(true); };

  const onSubmit = async (values: any) => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/users/${editing._id}`, { name: values.name, email: values.email, phone: values.phone });
        toast("Student updated", "success");
      } else {
        await api.post("/users", { ...values, role: "student" });
        toast("Student created", "success");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      setDialogOpen(false);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: User) => {
    try {
      await api.put(`/users/${u._id}/toggle-active`);
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      toast(u.isActive ? "Student deactivated" : "Student activated", "success");
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      toast("Student deleted", "success");
      setDeleteTarget(null);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">Manage student accounts and access.</p>
        </div>
        <Button variant="accent" onClick={openCreate}><Plus className="h-4 w-4" /> New Student</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search students..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Joined</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="p-3"><Skeleton className="h-8 w-full" /></td></tr>
              ))
            ) : data?.data.length ? (
              data.data.map((u) => (
                <tr key={u._id} className="border-t border-border">
                  <td className="p-3 font-medium">
                    <Link href={`/admin/students/${u._id}`} className="hover:text-accent">{u.name}</Link>
                  </td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="p-3"><Badge variant={u.isActive ? "success" : "outline"}>{u.isActive ? "Active" : "Deactivated"}</Badge></td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="View devices" asChild>
                        <Link href={`/admin/sessions?userId=${u._id}`}><Monitor className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" title={u.isActive ? "Deactivate" : "Activate"} onClick={() => toggleActive(u)}>
                        {u.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeleteTarget(u)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Student" : "New Student"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5"><Label>Full name</Label><Input {...register("name", { required: true })} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" {...register("email", { required: true })} /></div>
            {!editing && (
              <div className="space-y-1.5"><Label>Password</Label><Input type="password" {...register("password", { required: true, minLength: 6 })} /></div>
            )}
            <div className="space-y-1.5"><Label>Phone</Label><Input {...register("phone")} /></div>
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
        title="Delete student?"
        description={`This will permanently remove "${deleteTarget?.name}" along with their enrollments, sessions, and progress.`}
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </div>
  );
}
