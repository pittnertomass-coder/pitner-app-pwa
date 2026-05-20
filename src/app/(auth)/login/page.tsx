"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleMagicLink() {
    if (!email) {
      toast.error("Zadej e-mail pro odeslání odkazu.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/dashboard` },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Magic link odeslán! Zkontroluj e-mail.");
    }
    setLoading(false);
  }

  return (
    <Card className="glass border-border/40 shadow-[0_0_40px_oklch(0.698_0.149_185/0.1)]">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Přihlášení</CardTitle>
        <CardDescription>Zadej e-mail a heslo nebo použij Magic Link</CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="tomas@example.cz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Heslo</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Přihlásit se
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">nebo</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleMagicLink}
            disabled={loading}
          >
            Přihlásit přes Magic Link
          </Button>
        </CardContent>
      </form>

      {process.env.NODE_ENV === "development" && (
        <div className="px-6 pb-4">
          <a href="/api/dev-bypass">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground/60 hover:text-muted-foreground gap-2 border border-dashed border-border/40"
            >
              <FlaskConical className="h-3 w-3" />
              Dev: přeskočit přihlášení
            </Button>
          </a>
        </div>
      )}

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Nemáš účet?{" "}
          <Link href="/registrace" className="font-medium text-foreground underline underline-offset-4">
            Registruj se
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
