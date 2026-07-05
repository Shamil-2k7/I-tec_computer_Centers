"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Enrollment, Course } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, TrendingUp, CheckCircle2 } from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => (await api.get<{ data: (Enrollment & { course: Course; progress: number })[] }>("/enrollments/my")).data.data,
  });

  const totalCourses = data?.length || 0;
  const completed = data?.filter((e) => e.isCompleted).length || 0;
  const inProgress = totalCourses - completed;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Here&apos;s where you left off.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-accent/15 flex items-center justify-center"><BookOpen className="h-6 w-6 text-accent" /></div>
            <div><p className="text-2xl font-display font-semibold">{totalCourses}</p><p className="text-xs text-muted-foreground">Enrolled Courses</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="h-6 w-6" /></div>
            <div><p className="text-2xl font-display font-semibold">{inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/15 flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-success" /></div>
            <div><p className="text-2xl font-display font-semibold">{completed}</p><p className="text-xs text-muted-foreground">Completed</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Continue Learning</CardTitle>
          <Button asChild variant="ghost" size="sm"><Link href="/dashboard/courses">View all</Link></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          ) : data?.length ? (
            data.slice(0, 4).map((e) => (
              <Link key={e._id} href={`/dashboard/learn/${e.course.slug}`} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-secondary/40 transition-colors">
                <div className="h-14 w-20 rounded-md bg-muted shrink-0 overflow-hidden">
                  {e.course.thumbnail && <img src={e.course.thumbnail} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{e.course.title}</p>
                  <div className="h-1.5 w-full max-w-xs rounded-full bg-muted overflow-hidden mt-2">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${e.progress || 0}%` }} />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{e.progress || 0}%</span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">
              You&apos;re not enrolled in any courses yet. Contact an admin to get access.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
