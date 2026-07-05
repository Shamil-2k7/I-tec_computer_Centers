"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: UserRole[] }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="container py-10 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
