"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { User, Course, Progress } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface DetailData {
  user: User;
  enrollments: { _id: string; course: Course; status: string; enrolledAt: string }[];
  progress: Progress[];
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-student", id],
    queryFn: async () => (await api.get<{ data: DetailData }>(`/users/${id}`)).data.data,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!data) return <p className="text-muted-foreground">Student not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/students" className="text-xs text-muted-foreground hover:text-foreground">&larr; Back to Students</Link>
        <h1 className="font-display text-2xl font-semibold mt-1">{data.user.name}</h1>
        <p className="text-sm text-muted-foreground">{data.user.email} · Joined {formatDate(data.user.createdAt)}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Enrollments</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No enrollments yet.</p>
          ) : (
            data.enrollments.map((e) => {
              const p = data.progress.find((pr) => pr.course === e.course._id);
              return (
                <div key={e._id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{e.course.title}</p>
                    <p className="text-xs text-muted-foreground">Enrolled {formatDate(e.enrolledAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{p?.percentage || 0}% complete</span>
                    <Badge variant={e.status === "active" ? "success" : "outline"}>{e.status}</Badge>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
