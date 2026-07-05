"use client";

import { LayoutDashboard, BookOpen, User, Monitor } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/devices", label: "My Devices", icon: Monitor },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="min-h-screen flex flex-col">
        <Topbar breadcrumb="Student Dashboard" />
        <div className="flex flex-1">
          <Sidebar items={navItems} title="Student" />
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
