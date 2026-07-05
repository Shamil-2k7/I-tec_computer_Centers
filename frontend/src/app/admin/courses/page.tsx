"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api, getErrorMessage } from "@/lib/api";
import { Course, PaginatedMeta } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/context/ToastContext";
import { Plus, Pencil, Trash2, Eye, EyeOff, Settings2, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CourseForm {
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  isFree: boolean;
  difficulty: string;
  category: string;
  language: string;
  duration: string;
}

const emptyForm: CourseForm = {
  title: "", description: "", thumbnail: "", price: 0, isFree: false,
  difficulty: "beginner", category: "General", language: "English", duration: "",
};

export default function AdminCoursesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm<CourseForm>({ defaultValues: emptyForm });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses", page, search],
    queryFn: async () => {
      const res = await api.get<{ data: Course[]; meta: PaginatedMeta }>("/courses", {
        params: { all: true, page, limit: 10, search: search || undefined },
      });
      return res.data;
    },
  });

  const openCreate = () => {
    setEditing(null);
    reset(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditing(course);
    reset({
      title: course.title, description: course.description, thumbnail: course.thumbnail,
      price: course.price, isFree: course.isFree, difficulty: course.difficulty,
      category: course.category, language: course.language, duration: course.duration,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: CourseForm) => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/courses/${editing._id}`, values);
        toast("Course updated", "success");
      } else {
        await api.post("/courses", values);
        toast("Course created", "success");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setDialogOpen(false);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (course: Course) => {
    try {
      await api.put(`/courses/${course._id}/publish`);
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast(course.isPublished ? "Course unpublished" : "Course published", "success");
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/courses/${deleteTarget._id}`);
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast("Course deleted", "success");
      setDeleteTarget(null);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  const isFree = watch("isFree");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Courses</h1>
          <p className="text-sm text-muted-foreground">Create and manage your course catalog.</p>
        </div>
        <Button variant="accent" onClick={openCreate}><Plus className="h-4 w-4" /> New Course</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search courses..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3 font-medium">Course</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Enrollments</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="p-3"><Skeleton className="h-8 w-full" /></td></tr>
              ))
            ) : data?.data.length ? (
              data.data.map((course) => (
                <tr key={course._id} className="border-t border-border">
                  <td className="p-3 font-medium max-w-xs truncate">{course.title}</td>
                  <td className="p-3 capitalize">{course.category}</td>
                  <td className="p-3">{course.isFree ? "Free" : formatCurrency(course.price)}</td>
                  <td className="p-3">{course.totalEnrollments}</td>
                  <td className="p-3">
                    <Badge variant={course.isPublished ? "success" : "outline"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Manage curriculum" asChild>
                        <Link href={`/admin/courses/${course._id}`}><Settings2 className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(course)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title={course.isPublished ? "Unpublish" : "Publish"} onClick={() => togglePublish(course)}>
                        {course.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeleteTarget(course)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No courses yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Course" : "Create Course"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input {...register("title", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} {...register("description", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Thumbnail URL</Label>
              <Input {...register("thumbnail")} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input {...register("category")} />
              </div>
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Input {...register("language")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select defaultValue={watch("difficulty")} onValueChange={(v) => setValue("difficulty", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Duration</Label>
                <Input {...register("duration")} placeholder="e.g. 6 hours" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isFree" className="h-4 w-4" {...register("isFree")} />
              <Label htmlFor="isFree">This is a free course</Label>
            </div>
            {!isFree && (
              <div className="space-y-1.5">
                <Label>Price (USD)</Label>
                <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="accent" disabled={saving}>{saving ? "Saving..." : "Save Course"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete course?"
        description={`This will permanently delete "${deleteTarget?.title}" and all its sections, lessons, videos, enrollments, and progress records.`}
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </div>
  );
}
