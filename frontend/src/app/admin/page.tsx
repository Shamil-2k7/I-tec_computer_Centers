"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, ClipboardList, Monitor, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { formatCurrency, timeAgo } from "@/lib/utils";
import Link from "next/link";

interface DashboardData {
  stats: { totalStudents: number; totalCourses: number; totalEnrollments: number; activeSessions: number; revenue: number };
  enrollmentsByMonth: { _id: { year: number; month: number }; count: number }[];
  recentEnrollments: any[];
  recentStudents: any[];
  topCourses: any[];
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => (await api.get<{ data: DashboardData }>("/dashboard/admin")).data.data,
  });

  const chartData = data?.enrollmentsByMonth.map((m) => ({
    name: monthNames[m._id.month - 1],
    enrollments: m.count,
  }));

  const statCards = [
    { label: "Total Students", value: data?.stats.totalStudents, icon: Users, color: "text-accent bg-accent/15" },
    { label: "Total Courses", value: data?.stats.totalCourses, icon: BookOpen, color: "text-primary bg-primary/10" },
    { label: "Active Enrollments", value: data?.stats.totalEnrollments, icon: ClipboardList, color: "text-success bg-success/15" },
    { label: "Active Sessions", value: data?.stats.activeSessions, icon: Monitor, color: "text-destructive bg-destructive/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="h-6 w-6" /></div>
              <div>
                {isLoading ? <Skeleton className="h-7 w-12" /> : <p className="text-2xl font-display font-semibold">{s.value}</p>}
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className="sm:col-span-2 lg:col-span-4 xl:col-span-1">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center text-accent bg-accent/15"><DollarSign className="h-6 w-6" /></div>
            <div>
              {isLoading ? <Skeleton className="h-7 w-20" /> : <p className="text-2xl font-display font-semibold">{formatCurrency(data?.stats.revenue || 0)}</p>}
              <p className="text-xs text-muted-foreground">Estimated Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Enrollments (last 6 months)</CardTitle></CardHeader>
          <CardContent className="h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="enrollments" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Courses</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              : data?.topCourses.map((c: any) => (
                  <div key={c._id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{c.title}</span>
                    <Badge variant="outline">{c.totalEnrollments}</Badge>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Enrollments</CardTitle>
            <Link href="/admin/enrollments" className="text-xs text-accent hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              : data?.recentEnrollments.map((e: any) => (
                  <div key={e._id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{e.student?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{e.course?.title}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{timeAgo(e.createdAt)}</span>
                  </div>
                ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Students</CardTitle>
            <Link href="/admin/students" className="text-xs text-accent hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              : data?.recentStudents.map((s: any) => (
                  <div key={s._id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{timeAgo(s.createdAt)}</span>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
