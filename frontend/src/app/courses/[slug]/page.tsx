"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Course, Section, Lesson, Video } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { ChevronDown, PlayCircle, Lock, Clock, BarChart3, Globe, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type StructureSection = Section & { lessons: (Lesson & { videos: Video[] })[] };

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const res = await api.get<{ data: { course: Course; structure: StructureSection[]; isEnrolled: boolean } }>(`/courses/${slug}`);
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container py-12 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Footer />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Navbar />
        <div className="container py-24 text-center text-muted-foreground">Course not found.</div>
        <Footer />
      </>
    );
  }

  const { course, structure, isEnrolled } = data;
  const totalVideos = structure.reduce((sum, s) => sum + s.lessons.reduce((s2, l) => s2 + l.videos.length, 0), 0);

  return (
    <>
      <Navbar />
      <main>
        <div className="border-b border-border bg-secondary/30">
          <div className="container py-12 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex gap-2 mb-4">
                <Badge variant="outline" className="capitalize">{course.category}</Badge>
                <Badge variant="outline" className="capitalize">{course.difficulty}</Badge>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold mb-4">{course.title}</h1>
              <p className="text-muted-foreground mb-6">{course.description}</p>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                {course.duration && <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {course.duration}</span>}
                <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> {totalVideos} videos</span>
                <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> {course.language}</span>
              </div>
            </div>

            <Card className="p-6 h-fit">
              <div className="aspect-video rounded-md bg-muted mb-4 overflow-hidden">
                {activeVideo ? (
                  <iframe src={activeVideo.embedUrl} className="w-full h-full" allowFullScreen title={activeVideo.title} />
                ) : course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display text-3xl text-primary/20">
                    {course.title.charAt(0)}
                  </div>
                )}
              </div>
              <p className="text-2xl font-display font-semibold mb-4">
                {course.isFree ? "Free" : formatCurrency(course.price)}
              </p>
              {isEnrolled ? (
                <Button asChild variant="accent" className="w-full">
                  <Link href={`/dashboard/learn/${course.slug}`}>Continue Learning</Link>
                </Button>
              ) : user?.role === "student" ? (
                <div className="text-sm text-center text-muted-foreground border border-border rounded-md p-3">
                  You&apos;re not enrolled yet. Contact an admin to get access.
                </div>
              ) : (
                <Button asChild variant="accent" className="w-full">
                  <Link href="/register">Sign up to request access</Link>
                </Button>
              )}
            </Card>
          </div>
        </div>

        <div className="container py-12 grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-10">
            {course.learningOutcomes?.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold mb-4">What you&apos;ll learn</h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" /> {o}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2 className="font-display text-xl font-semibold mb-4">Curriculum</h2>
              <div className="space-y-3">
                {structure.map((section) => {
                  const isOpen = openSection === section._id;
                  return (
                    <div key={section._id} className="border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setOpenSection(isOpen ? null : section._id)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left font-medium bg-secondary/30 hover:bg-secondary/50"
                      >
                        <span>{section.title}</span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{section.lessons.length} lessons</span>
                          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                        </div>
                      </button>
                      {isOpen && (
                        <div className="divide-y divide-border">
                          {section.lessons.map((lesson) => (
                            <div key={lesson._id} className="px-5 py-3">
                              <p className="text-sm font-medium mb-2">{lesson.title}</p>
                              <div className="space-y-1">
                                {lesson.videos.map((video) => (
                                  <button
                                    key={video._id}
                                    disabled={video.accessType === "locked" && !isEnrolled}
                                    onClick={() => video.accessType === "preview" || isEnrolled ? setActiveVideo(video) : undefined}
                                    className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {video.accessType === "preview" || isEnrolled ? (
                                      <PlayCircle className="h-4 w-4 text-accent" />
                                    ) : (
                                      <Lock className="h-4 w-4" />
                                    )}
                                    <span className="flex-1 text-left">{video.title}</span>
                                    {video.duration && <span className="text-xs">{video.duration}</span>}
                                    {video.accessType === "preview" && <Badge variant="outline" className="text-[10px]">Preview</Badge>}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {course.requirements?.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold mb-4">Requirements</h2>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {course.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </section>
            )}
          </div>

          <aside>
            {course.instructor && (
              <Card className="p-6">
                <h3 className="font-display font-semibold mb-3">Instructor</h3>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-display">
                    {course.instructor.name.charAt(0)}
                  </div>
                  <p className="text-sm font-medium">{course.instructor.name}</p>
                </div>
              </Card>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
