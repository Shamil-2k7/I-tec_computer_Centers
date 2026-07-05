"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api, getErrorMessage } from "@/lib/api";
import { Course, Section, Lesson, Video } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/context/ToastContext";
import { Plus, Pencil, Trash2, ChevronDown, PlayCircle, Lock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type StructureSection = Section & { lessons: (Lesson & { videos: Video[] })[] };

export default function CourseBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openLesson, setOpenLesson] = useState<string | null>(null);

  const [sectionDialog, setSectionDialog] = useState<{ open: boolean; editing?: Section }>({ open: false });
  const [lessonDialog, setLessonDialog] = useState<{ open: boolean; sectionId?: string; editing?: Lesson }>({ open: false });
  const [videoDialog, setVideoDialog] = useState<{ open: boolean; lessonId?: string; editing?: Video }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<{ type: "section" | "lesson" | "video"; id: string; label: string } | null>(null);

  const { data: courseData } = useQuery({
    queryKey: ["admin-course", id],
    queryFn: async () => (await api.get<{ data: Course }>(`/courses/${id}`)).data.data,
    enabled: false, // we fetch structure below by slug once we know it; simpler: fetch all courses list detail via slug lookup
  });

  // The public /courses/:slug endpoint returns full structure; but here we only have the id.
  // Fetch the course by id via the admin list (already cached) then reuse the slug-based structure endpoint.
  const { data: courseMeta, isLoading: loadingMeta } = useQuery({
    queryKey: ["course-meta", id],
    queryFn: async () => {
      const res = await api.get<{ data: Course[] }>("/courses", { params: { all: true, limit: 100 } });
      return res.data.data.find((c) => c._id === id) || null;
    },
  });

  const { data: structureData, isLoading: loadingStructure } = useQuery({
    queryKey: ["course-structure", courseMeta?.slug],
    queryFn: async () => (await api.get<{ data: { course: Course; structure: StructureSection[] } }>(`/courses/${courseMeta!.slug}`)).data.data,
    enabled: !!courseMeta?.slug,
  });

  const structure = structureData?.structure || [];
  const isLoading = loadingMeta || loadingStructure;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["course-structure", courseMeta?.slug] });
  };

  // ---- Section form ----
  const sectionForm = useForm({ defaultValues: { title: "" } });
  const openSectionDialog = (editing?: Section) => {
    sectionForm.reset({ title: editing?.title || "" });
    setSectionDialog({ open: true, editing });
  };
  const onSubmitSection = async (values: { title: string }) => {
    try {
      if (sectionDialog.editing) {
        await api.put(`/sections/${sectionDialog.editing._id}`, values);
      } else {
        await api.post("/sections", { ...values, course: id });
      }
      invalidate();
      setSectionDialog({ open: false });
      toast("Section saved", "success");
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  // ---- Lesson form ----
  const lessonForm = useForm({ defaultValues: { title: "", description: "" } });
  const openLessonDialog = (sectionId: string, editing?: Lesson) => {
    lessonForm.reset({ title: editing?.title || "", description: editing?.description || "" });
    setLessonDialog({ open: true, sectionId, editing });
  };
  const onSubmitLesson = async (values: { title: string; description: string }) => {
    try {
      if (lessonDialog.editing) {
        await api.put(`/lessons/${lessonDialog.editing._id}`, values);
      } else {
        await api.post("/lessons", { ...values, section: lessonDialog.sectionId });
      }
      invalidate();
      setLessonDialog({ open: false });
      toast("Lesson saved", "success");
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  // ---- Video form ----
  const videoForm = useForm({ defaultValues: { title: "", youtubeUrl: "", duration: "", accessType: "locked" } });
  const openVideoDialog = (lessonId: string, editing?: Video) => {
    videoForm.reset({
      title: editing?.title || "", youtubeUrl: editing?.youtubeUrl || "",
      duration: editing?.duration || "", accessType: editing?.accessType || "locked",
    });
    setVideoDialog({ open: true, lessonId, editing });
  };
  const onSubmitVideo = async (values: any) => {
    try {
      if (videoDialog.editing) {
        await api.put(`/videos/${videoDialog.editing._id}`, values);
      } else {
        await api.post("/videos", { ...values, lesson: videoDialog.lessonId });
      }
      invalidate();
      setVideoDialog({ open: false });
      toast("Video saved", "success");
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/${deleteTarget.type}s/${deleteTarget.id}`);
      invalidate();
      toast("Deleted", "success");
      setDeleteTarget(null);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/admin/courses" className="text-xs text-muted-foreground hover:text-foreground">&larr; Back to Courses</Link>
          <h1 className="font-display text-2xl font-semibold mt-1">{courseMeta?.title}</h1>
          <p className="text-sm text-muted-foreground">Manage sections, lessons, and videos.</p>
        </div>
        <Button variant="accent" onClick={() => openSectionDialog()}><Plus className="h-4 w-4" /> Add Section</Button>
      </div>

      <div className="space-y-3">
        {structure.length === 0 && (
          <p className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-lg">
            No sections yet. Add your first section to start building the curriculum.
          </p>
        )}
        {structure.map((section) => {
          const isOpen = openSection === section._id;
          return (
            <div key={section._id} className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-secondary/40">
                <button onClick={() => setOpenSection(isOpen ? null : section._id)} className="flex items-center gap-2 font-medium text-sm flex-1 text-left">
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                  {section.title}
                  <Badge variant="outline">{section.lessons.length} lessons</Badge>
                </button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openSectionDialog(section)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: "section", id: section._id, label: section.title })}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {isOpen && (
                <div className="p-4 space-y-4">
                  {section.lessons.map((lesson) => {
                    const lessonOpen = openLesson === lesson._id;
                    return (
                      <div key={lesson._id} className="border border-border rounded-md">
                        <div className="flex items-center justify-between px-3 py-2 bg-card">
                          <button onClick={() => setOpenLesson(lessonOpen ? null : lesson._id)} className="flex items-center gap-2 text-sm font-medium flex-1 text-left">
                            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", lessonOpen && "rotate-180")} />
                            {lesson.title}
                            <Badge variant="outline" className="text-[10px]">{lesson.videos.length} videos</Badge>
                          </button>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openLessonDialog(section._id, lesson)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: "lesson", id: lesson._id, label: lesson.title })}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        {lessonOpen && (
                          <div className="p-3 space-y-2">
                            {lesson.videos.map((video) => (
                              <div key={video._id} className="flex items-center gap-2 text-sm border border-border rounded-md px-3 py-2">
                                {video.accessType === "preview" ? <Eye className="h-4 w-4 text-accent shrink-0" /> : <Lock className="h-4 w-4 text-muted-foreground shrink-0" />}
                                <span className="flex-1 truncate">{video.title}</span>
                                {video.duration && <span className="text-xs text-muted-foreground">{video.duration}</span>}
                                <Button variant="ghost" size="icon" onClick={() => openVideoDialog(lesson._id, video)}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: "video", id: video._id, label: video.title })}>
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => openVideoDialog(lesson._id)}>
                              <PlayCircle className="h-4 w-4" /> Add Video
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <Button variant="outline" size="sm" onClick={() => openLessonDialog(section._id)}>
                    <Plus className="h-4 w-4" /> Add Lesson
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Section dialog */}
      <Dialog open={sectionDialog.open} onOpenChange={(o) => setSectionDialog({ open: o })}>
        <DialogContent>
          <DialogHeader><DialogTitle>{sectionDialog.editing ? "Edit Section" : "Add Section"}</DialogTitle></DialogHeader>
          <form onSubmit={sectionForm.handleSubmit(onSubmitSection)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Section title</Label>
              <Input {...sectionForm.register("title", { required: true })} placeholder="e.g. Getting Started" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSectionDialog({ open: false })}>Cancel</Button>
              <Button type="submit" variant="accent">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lesson dialog */}
      <Dialog open={lessonDialog.open} onOpenChange={(o) => setLessonDialog({ open: o })}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lessonDialog.editing ? "Edit Lesson" : "Add Lesson"}</DialogTitle></DialogHeader>
          <form onSubmit={lessonForm.handleSubmit(onSubmitLesson)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Lesson title</Label>
              <Input {...lessonForm.register("title", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input {...lessonForm.register("description")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLessonDialog({ open: false })}>Cancel</Button>
              <Button type="submit" variant="accent">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Video dialog */}
      <Dialog open={videoDialog.open} onOpenChange={(o) => setVideoDialog({ open: o })}>
        <DialogContent>
          <DialogHeader><DialogTitle>{videoDialog.editing ? "Edit Video" : "Add Video"}</DialogTitle></DialogHeader>
          <form onSubmit={videoForm.handleSubmit(onSubmitVideo)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Video title</Label>
              <Input {...videoForm.register("title", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>YouTube URL</Label>
              <Input {...videoForm.register("youtubeUrl", { required: true })} placeholder="https://youtube.com/watch?v=... or https://youtu.be/..." />
              <p className="text-xs text-muted-foreground">Paste any YouTube link — it's converted to an embeddable player automatically.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Duration</Label>
                <Input {...videoForm.register("duration")} placeholder="e.g. 12:34" />
              </div>
              <div className="space-y-1.5">
                <Label>Access</Label>
                <Select defaultValue={videoForm.watch("accessType")} onValueChange={(v) => videoForm.setValue("accessType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="locked">Locked (enrolled only)</SelectItem>
                    <SelectItem value="preview">Preview (public)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setVideoDialog({ open: false })}>Cancel</Button>
              <Button type="submit" variant="accent">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.label}"?`}
        description="This action cannot be undone, and will also delete any nested content beneath it."
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </div>
  );
}
