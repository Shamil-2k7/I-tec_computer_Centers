"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Course, PaginatedMeta } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseCard } from "@/components/course/CourseCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search } from "lucide-react";

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["courses", search, sort, page],
    queryFn: async () => {
      const res = await api.get<{ data: Course[]; meta: PaginatedMeta }>("/courses", {
        params: { search: search || undefined, sort, page, limit: 9 },
      });
      return res.data;
    },
  });

  return (
    <>
      <Navbar />
      <main className="container py-12 min-h-[60vh]">
        <div className="mb-10 text-center">
          <p className="ledger-rule inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-3 pb-2">Catalog</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-4">All Courses</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Browse our full catalog of self-paced, project-based courses.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)
            : data?.data.length
            ? data.data.map((c) => <CourseCard key={c._id} course={c} />)
            : <p className="col-span-full text-center text-muted-foreground py-16">No courses match your search.</p>}
        </div>

        {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
      </main>
      <Footer />
    </>
  );
}
