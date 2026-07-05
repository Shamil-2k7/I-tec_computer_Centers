"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FAQItem } from "@/types";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data } = useQuery({
    queryKey: ["faq"],
    queryFn: async () => (await api.get<{ data: FAQItem[] }>("/faq")).data.data,
  });

  return (
    <section id="faq" className="container py-14 max-w-3xl">
      <div className="text-center mb-10">
        <p className="ledger-rule inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-3 pb-2 mx-auto">FAQ</p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold">Frequently asked questions</h2>
      </div>
      <div className="space-y-3">
        {data?.map((item) => {
          const isOpen = openId === item._id;
          return (
            <div key={item._id} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : item._id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-sm hover:bg-secondary/50"
              >
                {item.question}
                <ChevronDown className={cn("h-4 w-4 transition-transform shrink-0 ml-2", isOpen && "rotate-180")} />
              </button>
              {isOpen && <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{item.answer}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
