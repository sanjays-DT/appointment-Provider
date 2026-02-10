"use client";

import { useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { provider, isAuthenticated, isInitializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitializing) return;

    if (!isAuthenticated && !provider) {
      router.replace("/");
      return;
    }

    if (pathname === "/login" && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitializing, provider, pathname, router]);

  if (isInitializing) return null;
  if (!isAuthenticated && !provider) return null;

  return <>{children}</>;
}
