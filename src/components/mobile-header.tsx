"use client";

import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";

export function MobileHeader() {
  const { profile } = useAuthStore();

  return (
    <header className="flex items-center gap-3 glass border-b border-border px-4 py-3 sticky top-0 z-40">
      <Image
        src="/brand/logo hlavní 33_result.webp"
        alt="Narovnej"
        width={110}
        height={110}
        className="h-11 w-auto"
        priority
      />
      <div className="flex-1 min-w-0">
        {profile?.full_name && (
          <p className="text-sm font-semibold leading-tight truncate">{profile.full_name}</p>
        )}
      </div>
    </header>
  );
}
