"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  size?: "sm" | "md";
  className?: string;
}

export function ThemeToggle({ size = "md", className }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className={cn(size === "sm" ? "h-8 w-8" : "h-10 w-10", className)} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        "text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Světlý režim" : "Tmavý režim"}
    >
      {isDark ? (
        <Sun className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      ) : (
        <Moon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      )}
    </Button>
  );
}
