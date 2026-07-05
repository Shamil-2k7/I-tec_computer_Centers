"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Enrollment, Course } from "@/types";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function MyCoursesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => (await api.get<{ data: (Enrollment & { course: Course; progress: number; isCompleted: boolean })[] }>("/enrollments/my")).data.data,
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">My Courses</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
          : data?.length
          ? data.map((e) => (
              <Link key={e._id} href={`/dashboard/learn/${e.course.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="aspect-video bg-muted overflow-hidden">
                    {e.course.thumbnail && <img src={e.course.thumbnail} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold mb-2 line-clamp-2">{e.course.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${e.progress || 0}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{e.progress || 0}%</span>
                    </div>
                    {e.isCompleted && <Badge variant="success">Completed</Badge>}
                  </div>
                </Card>
              </Link>
            ))
          : <p className="col-span-full text-center text-muted-foreground py-16">No enrollments yet.</p>}
      </div>
    </div>
  );
}
