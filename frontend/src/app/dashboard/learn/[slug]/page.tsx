"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/lib/api";
import { Course, Section, Lesson, Video, Progress } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/context/ToastContext";
import { CheckCircle2, Circle, ChevronDown, Bookmark, BookmarkCheck, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type StructureSection = Section & { lessons: (Lesson & { videos: Video[] })[] };

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function CoursePlayerPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [openSection, setOpenSection] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const playerRef = useRef<any>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["course-learn", slug],
    queryFn: async () => {
      const res = await api.get<{ data: { course: Course; structure: StructureSection[]; isEnrolled: boolean } }>(`/courses/${slug}`);
      if (!res.data.data.isEnrolled) throw new Error("Not enrolled");
      return res.data.data;
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["progress", data?.course._id],
    queryFn: async () => (await api.get<{ data: Progress }>(`/progress/${data!.course._id}`)).data.data,
    enabled: !!data?.course._id,
  });

  const allVideos = data?.structure.flatMap((s) => s.lessons.flatMap((l) => l.videos)) || [];

  // Set the initial active video: resume last watched, or first video
  useEffect(() => {
    if (!activeVideo && allVideos.length > 0) {
      const lastId = progress?.lastWatchedVideo;
      const found = lastId ? allVideos.find((v) => v._id === lastId) : null;
      const target = found || allVideos[0];
      setActiveVideo(target);
      const section = data?.structure.find((s) => s.lessons.some((l) => l.videos.some((v) => v._id === target._id)));
      if (section) setOpenSection(section._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allVideos.length, progress]);

  const isVideoComplete = (id: string) => progress?.completedVideos.includes(id);
  const isBookmarked = (lessonId: string) => progress?.bookmarkedLessons.includes(lessonId);

  // Load YouTube IFrame API once
  useEffect(() => {
    if (window.YT) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }, []);

  const initPlayer = useCallback((videoId: string, startSeconds: number) => {
    if (!window.YT || !window.YT.Player || !iframeContainerRef.current) return;

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player(iframeContainerRef.current, {
      videoId,
      playerVars: { start: Math.floor(startSeconds || 0), enablejsapi: 1, rel: 0 },
      events: {
        onReady: () => {
          if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
          saveIntervalRef.current = setInterval(() => {
            if (playerRef.current?.getCurrentTime && activeVideo && data) {
              const position = Math.floor(playerRef.current.getCurrentTime());
              api.put("/progress/resume", { courseId: data.course._id, videoId: activeVideo._id, position }).catch(() => {});
            }
          }, 8000);
        },
      },
    });
  }, [activeVideo, data]);

  useEffect(() => {
    if (!activeVideo) return;
    const idMatch = activeVideo.embedUrl.match(/embed\/([a-zA-Z0-9_-]{11})/);
    const videoId = idMatch ? idMatch[1] : "";
    if (!videoId) return;

    const startPos = progress?.lastWatchedVideo === activeVideo._id ? progress.lastWatchedPosition : 0;

    const tryInit = () => {
      if (window.YT && window.YT.Player) {
        initPlayer(videoId, startPos);
      } else {
        window.onYouTubeIframeAPIReady = () => initPlayer(videoId, startPos);
      }
    };
    tryInit();

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVideo?._id]);

  const handleSelectVideo = (video: Video) => {
    setActiveVideo(video);
  };

  const handleMarkComplete = async () => {
    if (!activeVideo || !data) return;
    try {
      await api.post("/progress/video-complete", { courseId: data.course._id, videoId: activeVideo._id });
      await queryClient.invalidateQueries({ queryKey: ["progress", data.course._id] });
      toast("Marked as complete", "success");

      const idx = allVideos.findIndex((v) => v._id === activeVideo._id);
      const next = allVideos[idx + 1];
      if (next) setActiveVideo(next);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  const handleToggleBookmark = async (lessonId: string) => {
    if (!data) return;
    try {
      await api.put("/progress/bookmark", { courseId: data.course._id, lessonId });
      queryClient.invalidateQueries({ queryKey: ["progress", data.course._id] });
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  if (isLoading) {
    return <div className="container py-12"><Skeleton className="h-96 w-full" /></div>;
  }

  if (!data) {
    return (
      <div className="container py-24 text-center">
        <p className="text-muted-foreground mb-4">You don&apos;t have access to this course.</p>
        <Button asChild variant="outline"><Link href="/dashboard/courses">Back to My Courses</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b border-border px-6 py-3 flex items-center justify-between bg-card">
        <Link href="/dashboard/courses" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to My Courses
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: `${progress?.percentage || 0}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{progress?.percentage || 0}% complete</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 p-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <div ref={iframeContainerRef} className="w-full h-full" />
          </div>
          {activeVideo && (
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-xl font-semibold mb-1">{activeVideo.title}</h1>
                <p className="text-sm text-muted-foreground">{data.course.title}</p>
              </div>
              <Button
                variant={isVideoComplete(activeVideo._id) ? "secondary" : "accent"}
                onClick={handleMarkComplete}
                disabled={isVideoComplete(activeVideo._id)}
              >
                {isVideoComplete(activeVideo._id) ? (
                  <><CheckCircle2 className="h-4 w-4" /> Completed</>
                ) : (
                  "Mark as Complete"
                )}
              </Button>
            </div>
          )}
        </div>

        <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-semibold">Course Content</h2>
          </div>
          {data.structure.map((section) => {
            const isOpen = openSection === section._id;
            return (
              <div key={section._id} className="border-b border-border">
                <button
                  onClick={() => setOpenSection(isOpen ? null : section._id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-secondary/50"
                >
                  {section.title}
                  <ChevronDown className={cn("h-4 w-4 transition-transform shrink-0", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div>
                    {section.lessons.map((lesson) => (
                      <div key={lesson._id} className="px-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{lesson.title}</p>
                          <button onClick={() => handleToggleBookmark(lesson._id)}>
                            {isBookmarked(lesson._id) ? (
                              <BookmarkCheck className="h-3.5 w-3.5 text-accent" />
                            ) : (
                              <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                        {lesson.videos.map((video) => (
                          <button
                            key={video._id}
                            onClick={() => handleSelectVideo(video)}
                            className={cn(
                              "w-full flex items-center gap-2 text-sm py-1.5 px-2 rounded-md text-left",
                              activeVideo?._id === video._id ? "bg-accent/15 text-accent font-medium" : "hover:bg-secondary/50"
                            )}
                          >
                            {isVideoComplete(video._id) ? (
                              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <span className="flex-1 truncate">{video.title}</span>
                            {video.duration && <span className="text-xs text-muted-foreground shrink-0">{video.duration}</span>}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </aside>
      </div>
    </div>
  );
}
