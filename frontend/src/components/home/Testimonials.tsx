"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Testimonial } from "@/types";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Quote } from "lucide-react";

export function Testimonials() {
  const { data, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => (await api.get<{ data: Testimonial[] }>("/testimonials")).data.data,
  });

  return (
    <section id="testimonials" className="bg-secondary/40 border-y border-border">
      <div className="container py-14">
        <div className="text-center mb-10">
          <p className="ledger-rule inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-3 pb-2 mx-auto">Testimonials</p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold">What our students say</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
            : data?.map((t) => (
                <Card key={t._id} className="p-6">
                  <Quote className="h-6 w-6 text-accent/50 mb-3" />
                  <p className="text-sm text-foreground mb-4 leading-relaxed">&ldquo;{t.message}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-display text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.designation}</p>
                    </div>
                    <div className="ml-auto flex">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
        </div>
      </div>
    </section>
  );
}
