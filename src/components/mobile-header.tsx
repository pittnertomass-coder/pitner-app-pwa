"use client";

import { useAuthStore } from "@/store/auth-store";
import { LogoMark } from "@/components/logo-mark";

export function MobileHeader() {
  const { profile } = useAuthStore();

  return (
    <header className="flex items-center gap-3 glass border-b border-border px-4 py-3 sticky top-0 z-40">
      <LogoMark size={30} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/70 leading-none">
          Pitner Pohyb
        </p>
        {profile?.full_name && (
          <p className="text-sm font-semibold leading-tight truncate">{profile.full_name}</p>
        )}
      </div>
    </header>
  );
}
