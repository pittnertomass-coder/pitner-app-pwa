"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Route, Stethoscope, Headphones, Wind, LogOut, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Přehled", icon: LayoutDashboard },
  { href: "/cesta", label: "Cesta", icon: Route },
  { href: "/klinika", label: "Klinika", icon: Stethoscope },
  { href: "/poslech", label: "Poslech", icon: Headphones },
  { href: "/nastroje", label: "Nástroje", icon: Wind },
];

export function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, reset } = useAuthStore();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    reset();
    toast.success("Odhlášen.");
    router.push("/login");
  }

  return (
    <aside className="flex h-full w-64 flex-col glass border-r border-border px-3 py-2">
      {/* Logo / branding */}
      <div className="mb-3 flex flex-col items-center justify-center w-full pt-1">
        <Image
          src="/brand/HLAVNI LOGO 1111 mint_result.webp"
          alt="Narovnej"
          width={200}
          height={200}
          className="w-full h-auto px-4"
          priority
        />
      </div>

      {/* Navigace */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/15 text-primary glow-teal"
                  : "text-muted-foreground hover:bg-primary/8 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active && "text-primary")} />
              {label}
              {active && (
                <span className="ml-auto w-1 h-4 rounded-full bg-primary opacity-80" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Spodní sekce */}
      <div className="space-y-1 pt-3 border-t border-border/60">
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-xs text-muted-foreground/70 font-medium">Vzhled</span>
          <ThemeToggle size="sm" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Odhlásit se
        </Button>
      </div>
    </aside>
  );
}

function MobileThemeButton() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-muted-foreground transition-colors active:text-primary"
    >
      {mounted
        ? isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
        : <div className="h-5 w-5" />}
      Vzhled
    </button>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border glass"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-all duration-200 relative",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
            )}
            <Icon className={cn("h-5 w-5 transition-transform duration-200", active && "scale-110")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
