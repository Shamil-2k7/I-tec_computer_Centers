"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/#about", label: "About" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { user } = useAuth();

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
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <GraduationCap className="h-6 w-6 text-accent" />
          AKM LMS
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-secondary" aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <Button asChild size="sm">
              <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild variant="accent" size="sm">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block text-sm font-medium" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            {user ? (
              <Button asChild size="sm" className="w-full">
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild variant="accent" size="sm" className="flex-1">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
