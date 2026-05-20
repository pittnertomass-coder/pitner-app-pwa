import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Radial teal glow za login kartou */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 60%, oklch(0.698 0.149 185 / 0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex justify-end p-4">
        <ThemeToggle size="sm" />
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm">
          {/* Teal linka nahoře */}
          <div className="h-0.5 w-12 rounded-full bg-primary mx-auto mb-6 opacity-80" />
          {children}
        </div>
      </div>
    </div>
  );
}
