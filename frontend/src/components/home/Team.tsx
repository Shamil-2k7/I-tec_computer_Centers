"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TeamMember } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Linkedin, Twitter, Github } from "lucide-react";

export function Team() {
  const { data, isLoading } = useQuery({
    queryKey: ["team"],
    queryFn: async () => (await api.get<{ data: TeamMember[] }>("/team")).data.data,
  });

  return (
    <section className="container py-14">
      <div className="text-center mb-10">
        <p className="ledger-rule inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-3 pb-2 mx-auto">Our Team</p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold">The people behind the curriculum</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)
          : data?.map((member) => (
              <div key={member._id} className="text-center">
                <div className="aspect-square rounded-xl bg-secondary border border-border mb-3 overflow-hidden">
                  {member.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display text-3xl text-primary/20">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-sm">{member.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">{member.role}</p>
                <div className="flex justify-center gap-2">
                  {member.socialLinks?.linkedin && <a href={member.socialLinks.linkedin}><Linkedin className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" /></a>}
                  {member.socialLinks?.twitter && <a href={member.socialLinks.twitter}><Twitter className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" /></a>}
                  {member.socialLinks?.github && <a href={member.socialLinks.github}><Github className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" /></a>}
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
