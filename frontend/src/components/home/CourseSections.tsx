"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Course } from "@/types";
import { CourseCard } from "@/components/course/CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CourseSectionProps {
  title: string;
  eyebrow: string;
  courses?: Course[];
  isLoading: boolean;
}

function CourseSection({ title, eyebrow, courses, isLoading }: CourseSectionProps) {
  return (
    <section className="container py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="ledger-rule inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-3 pb-2">
            {eyebrow}
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold">{title}</h2>
        </div>
        <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
          <Link href="/courses">View all <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)
          : courses?.length
          ? courses.map((c) => <CourseCard key={c._id} course={c} />)
          : <p className="text-muted-foreground col-span-full text-center py-8">No courses yet — check back soon.</p>}
      </div>
    </section>
  );
}

export function HomepageCourseSections() {
  const { data, isLoading } = useQuery({
    queryKey: ["homepage-courses"],
    queryFn: async () =>
      (await api.get<{ data: { featured: Course[]; popular: Course[]; latest: Course[] } }>("/courses/homepage-sections")).data.data,
  });

  return (
    <>
      <CourseSection title="Featured Courses" eyebrow="Handpicked" courses={data?.featured} isLoading={isLoading} />
      <CourseSection title="Popular Courses" eyebrow="Most enrolled" courses={data?.popular} isLoading={isLoading} />
      <CourseSection title="Latest Courses" eyebrow="Just added" courses={data?.latest} isLoading={isLoading} />
    </>
  );
}
