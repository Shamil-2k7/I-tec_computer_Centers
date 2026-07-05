"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Homepage } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const { data } = useQuery({
    queryKey: ["homepage"],
    queryFn: async () => (await api.get<{ data: Homepage }>("/homepage")).data.data,
  });

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10 opacity-[0.04]">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-in">
          <p className="ledger-rule inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-6 pb-2">
            AKM Learning Management System
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] mb-6">
            {data?.heroTitle || "Learn Without Limits"}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            {data?.heroSubtitle || "Master new skills with expert-led, self-paced courses."}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" variant="accent">
              <Link href={data?.heroCtaLink || "/courses"}>
                {data?.heroCtaText || "Browse Courses"} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">Create an account</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] rounded-2xl border border-border bg-card shadow-xl overflow-hidden relative">
            {data?.heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.heroImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
                <div className="text-center px-8">
                  <div className="font-display text-5xl font-semibold text-primary/20 mb-2">01 / 12</div>
                  <p className="text-sm text-muted-foreground">Lesson progress, tracked automatically</p>
                </div>
              </div>
            )}
          </div>
          {/* Signature element: a floating "progress ledger" card */}
          <div className="absolute -bottom-6 -left-6 hidden sm:block rounded-xl border border-border bg-card shadow-lg px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">Course completion</p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-28 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-3/4 rounded-full bg-accent" />
              </div>
              <span className="text-sm font-semibold">75%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
