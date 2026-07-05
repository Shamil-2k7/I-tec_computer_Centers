"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Homepage } from "@/types";
import { Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import { useState } from "react";

export function Contact() {
  const { data } = useQuery({
    queryKey: ["homepage"],
    queryFn: async () => (await api.get<{ data: Homepage }>("/homepage")).data.data,
  });
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast("Thanks! We'll get back to you soon.", "success");
      (e.target as HTMLFormElement).reset();
    }, 600);
  };

  return (
    <section id="contact" className="container py-14 grid md:grid-cols-2 gap-12">
      <div>
        <p className="ledger-rule inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-3 pb-2">Get in touch</p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">We'd love to hear from you</h2>
        <div className="space-y-4 text-sm">
          {data?.contactEmail && <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-accent" /> {data.contactEmail}</p>}
          {data?.contactPhone && <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-accent" /> {data.contactPhone}</p>}
          {data?.contactAddress && <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-accent" /> {data.contactAddress}</p>}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input placeholder="Your name" required />
        <Input type="email" placeholder="Your email" required />
        <Textarea placeholder="Your message" rows={5} required />
        <Button type="submit" variant="accent" disabled={submitting} className="w-full">
          {submitting ? "Sending..." : "Send message"}
        </Button>
      </form>
    </section>
  );
}
