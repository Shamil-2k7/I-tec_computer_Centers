"use client";

import {
  LayoutDashboard, BookOpen, Users, ClipboardList, Layout,
  UsersRound, MessageSquareQuote, HelpCircle, Settings, Monitor, User,
} from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/enrollments", label: "Enrollments", icon: ClipboardList },
  { href: "/admin/sessions", label: "Devices / Sessions", icon: Monitor },
  { href: "/admin/homepage", label: "Homepage CMS", icon: Layout },
  { href: "/admin/team", label: "Team", icon: UsersRound },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/profile", label: "Profile", icon: User },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen flex flex-col">
        <Topbar breadcrumb="Admin" />
        <div className="flex flex-1">
          <Sidebar items={navItems} title="Admin" />
          <main className="flex-1 p-6 md:p-8 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
