import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NavSidebar, MobileNav } from "@/components/nav-sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { AuthProvider } from "@/components/auth-provider";
import { VideoSheet } from "@/components/video-sheet";
import { AudioSheet } from "@/components/audio-sheet";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Dev bypass – přeskočí Supabase auth pro lokální testování
  const isDev = process.env.NODE_ENV === "development";
  const cookieStore = await cookies();
  const devSkip = isDev && cookieStore.get("dev_skip_auth")?.value === "1";

  if (!devSkip) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
  }

  return (
    <AuthProvider devMode={devSkip}>
      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:flex md:shrink-0">
          <NavSidebar />
        </div>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="md:hidden">
            <MobileHeader />
          </div>
          {children}
        </main>

        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>

      <VideoSheet />
      <AudioSheet />
    </AuthProvider>
  );
}
