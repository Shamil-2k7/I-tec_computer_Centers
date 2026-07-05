"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { api, getErrorMessage } from "@/lib/api";
import { Enrollment, User, Course, PaginatedMeta } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/context/ToastContext";
import { Plus, Trash2, ArrowLeftRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminEnrollmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [enrollDialog, setEnrollDialog] = useState(false);
  const [transferTarget, setTransferTarget] = useState<Enrollment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Enrollment | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-enrollments", page],
    queryFn: async () => {
      const res = await api.get<{ data: Enrollment[]; meta: PaginatedMeta }>("/enrollments", { params: { page, limit: 15 } });
      return res.data;
    },
  });

  const { data: students } = useQuery({
    queryKey: ["all-students"],
    queryFn: async () => (await api.get<{ data: User[] }>("/users", { params: { role: "student", limit: 500 } })).data.data,
  });

  const { data: courses } = useQuery({
    queryKey: ["all-courses"],
    queryFn: async () => (await api.get<{ data: Course[] }>("/courses", { params: { all: true, limit: 500 } })).data.data,
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/enrollments/${deleteTarget._id}`);
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
      toast("Enrollment removed", "success");
      setDeleteTarget(null);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Enrollments</h1>
          <p className="text-sm text-muted-foreground">Enroll students in courses. Students cannot self-enroll.</p>
        </div>
        <Button variant="accent" onClick={() => setEnrollDialog(true)}><Plus className="h-4 w-4" /> Enroll Student(s)</Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3 font-medium">Student</th>
              <th className="p-3 font-medium">Course</th>
              <th className="p-3 font-medium">Enrolled</th>
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
              data.data.map((e) => {
                const student = e.student as User;
                const course = e.course as Course;
                return (
                  <tr key={e._id} className="border-t border-border">
                    <td className="p-3 font-medium">{student.name}</td>
                    <td className="p-3">{course.title}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(e.enrolledAt)}</td>
                    <td className="p-3"><Badge variant={e.status === "active" ? "success" : "outline"}>{e.status}</Badge></td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Transfer to another course" onClick={() => setTransferTarget(e)}>
                          <ArrowLeftRight className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Remove" onClick={() => setDeleteTarget(e)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No enrollments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}

      <EnrollDialog
        open={enrollDialog}
        onOpenChange={setEnrollDialog}
        students={students || []}
        courses={courses || []}
        onDone={() => queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] })}
      />

      <TransferDialog
        enrollment={transferTarget}
        onOpenChange={(o) => !o && setTransferTarget(null)}
        courses={courses || []}
        onDone={() => queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] })}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove enrollment?"
        description="The student will immediately lose access to this course."
        onConfirm={handleDelete}
        confirmText="Remove"
      />
    </div>
  );
}

function EnrollDialog({ open, onOpenChange, students, courses, onDone }: any) {
  const { toast } = useToast();
  const [tab, setTab] = useState("single");
  const [saving, setSaving] = useState(false);
  const singleForm = useForm({ defaultValues: { student: "", courses: [] as string[] } });
  const bulkForm = useForm({ defaultValues: { students: [] as string[], courses: [] as string[] } });

  const onSingleSubmit = async (values: any) => {
    setSaving(true);
    try {
      await api.post("/enrollments", values);
      toast("Student enrolled", "success");
      onDone();
      onOpenChange(false);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const onBulkSubmit = async (values: any) => {
    setSaving(true);
    try {
      await api.post("/enrollments/bulk", values);
      toast("Bulk enrollment complete", "success");
      onDone();
      onOpenChange(false);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Enroll Students</DialogTitle></DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="single">Single Student</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Enrollment</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <form onSubmit={singleForm.handleSubmit(onSingleSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Student</Label>
                <Controller
                  control={singleForm.control}
                  name="student"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger>
                      <SelectContent>
                        {students.map((s: User) => <SelectItem key={s._id} value={s._id}>{s.name} ({s.email})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Course(s) — hold Ctrl/Cmd to select multiple</Label>
                <select multiple className="w-full border border-input rounded-md p-2 text-sm bg-card h-32" {...singleForm.register("courses", { required: true })}>
                  {courses.map((c: Course) => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" variant="accent" disabled={saving}>{saving ? "Enrolling..." : "Enroll"}</Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="bulk">
            <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Students — hold Ctrl/Cmd to select multiple</Label>
                <select multiple className="w-full border border-input rounded-md p-2 text-sm bg-card h-32" {...bulkForm.register("students", { required: true })}>
                  {students.map((s: User) => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Courses — hold Ctrl/Cmd to select multiple</Label>
                <select multiple className="w-full border border-input rounded-md p-2 text-sm bg-card h-32" {...bulkForm.register("courses", { required: true })}>
                  {courses.map((c: Course) => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" variant="accent" disabled={saving}>{saving ? "Enrolling..." : "Enroll All"}</Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function TransferDialog({ enrollment, onOpenChange, courses, onDone }: {
  enrollment: Enrollment | null;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [newCourseId, setNewCourseId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleTransfer = async () => {
    if (!enrollment || !newCourseId) return;
    setSaving(true);
    try {
      await api.put("/enrollments/transfer", { enrollmentId: enrollment._id, newCourseId });
      toast("Student transferred", "success");
      onDone();
      onOpenChange(false);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!enrollment} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Transfer Student</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Move <strong>{(enrollment?.student as User)?.name}</strong> from{" "}
            <strong>{(enrollment?.course as Course)?.title}</strong> to a new course.
          </p>
          <div className="space-y-1.5">
            <Label>New course</Label>
            <Select onValueChange={setNewCourseId}>
              <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
              <SelectContent>
                {courses.map((c: Course) => <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="accent" disabled={!newCourseId || saving} onClick={handleTransfer}>{saving ? "Transferring..." : "Transfer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
