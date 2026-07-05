"use client";

import Link from "next/link";
import { GraduationCap, LogOut, User as UserIcon, Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export function Topbar({ breadcrumb }: { breadcrumb: string }) {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("akm_lms_theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("akm_lms_theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold">
          <GraduationCap className="h-5 w-5 text-accent" />
          <span className="hidden sm:inline">AKM LMS</span>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground">{breadcrumb}</span>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-secondary" aria-label="Toggle theme">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary">
            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-semibold text-accent">
              {user?.name?.charAt(0) || "U"}
            </div>
            <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={user?.role === "admin" ? "/admin/profile" : "/dashboard/profile"} className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-2 text-destructive">
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
