"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function Sidebar({ items, title }: { items: NavItem[]; title: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-border bg-card min-h-[calc(100vh-4rem)] py-6">
      <p className="px-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">{title}</p>
      <nav className="flex flex-col gap-1 px-3">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
