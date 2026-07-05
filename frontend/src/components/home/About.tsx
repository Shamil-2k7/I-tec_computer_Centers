"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Homepage } from "@/types";

export function About() {
  const { data } = useQuery({
    queryKey: ["homepage"],
    queryFn: async () => (await api.get<{ data: Homepage }>("/homepage")).data.data,
  });

  return (
    <section id="about" className="container py-14 grid md:grid-cols-2 gap-12 items-center">
      <div className="aspect-[4/3] rounded-2xl bg-secondary border border-border overflow-hidden order-2 md:order-1">
        {data?.aboutImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.aboutImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-4xl text-primary/20">AKM</span>
          </div>
        )}
      </div>
      <div className="order-1 md:order-2">
        <p className="ledger-rule inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-4 pb-2">
          Who we are
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">
          {data?.aboutTitle || "About Us"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {data?.aboutContent || "We build practical, project-based courses taught by working professionals."}
        </p>
      </div>
    </section>
  );
}
