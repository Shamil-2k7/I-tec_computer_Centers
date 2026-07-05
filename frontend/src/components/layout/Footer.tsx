"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Homepage } from "@/types";
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export function Footer() {
  const { data } = useQuery({
    queryKey: ["homepage"],
    queryFn: async () => (await api.get<{ data: Homepage }>("/homepage")).data.data,
  });

  const social = data?.socialLinks || {};

  return (
    <footer className="border-t border-border bg-secondary/40 mt-20">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold mb-3">
            <GraduationCap className="h-6 w-6 text-accent" />
            AKM LMS
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            {data?.aboutContent || "Practical, project-based courses taught by working professionals."}
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/courses" className="hover:text-foreground">All Courses</Link></li>
            <li><Link href="/#about" className="hover:text-foreground">About Us</Link></li>
            <li><Link href="/#testimonials" className="hover:text-foreground">Testimonials</Link></li>
            <li><Link href="/#faq" className="hover:text-foreground">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {data?.contactEmail && <li>{data.contactEmail}</li>}
            {data?.contactPhone && <li>{data.contactPhone}</li>}
            {data?.contactAddress && <li>{data.contactAddress}</li>}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Follow</h4>
          <div className="flex gap-3">
            {social.facebook && <a href={social.facebook} className="p-2 rounded-md hover:bg-secondary"><Facebook className="h-4 w-4" /></a>}
            {social.twitter && <a href={social.twitter} className="p-2 rounded-md hover:bg-secondary"><Twitter className="h-4 w-4" /></a>}
            {social.instagram && <a href={social.instagram} className="p-2 rounded-md hover:bg-secondary"><Instagram className="h-4 w-4" /></a>}
            {social.linkedin && <a href={social.linkedin} className="p-2 rounded-md hover:bg-secondary"><Linkedin className="h-4 w-4" /></a>}
            {social.youtube && <a href={social.youtube} className="p-2 rounded-md hover:bg-secondary"><Youtube className="h-4 w-4" /></a>}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        {data?.footerText || `© ${new Date().getFullYear()} AKM LMS. All rights reserved.`}
      </div>
    </footer>
  );
}
