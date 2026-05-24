"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

export function KlinikaForm() {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("klinika_requests").insert({ message: text.trim() });
      toast.success("Odesláno! Tomáš se na to podívá.");
      setText("");
    } catch {
      toast.error("Nepodařilo se odeslat. Zkus to znovu.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="space-y-0.5">
        <h3 className="font-semibold text-sm">Chybí tu tvoje bolest?</h3>
        <p className="text-xs text-muted-foreground">
          Napiš nám co tě trápí — přidáme to do Kliniky.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Např. bolest kotníku, tuhé hrudní páteře..."
          className="flex-1 rounded-xl px-4 py-2.5 text-sm bg-background/40 border border-border/40 outline-none focus:border-primary/60 transition-colors placeholder:text-muted-foreground/50"
          maxLength={200}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-40"
          style={{ background: "#00D4A0" }}
        >
          <Send className="h-4 w-4 text-black" />
        </button>
      </form>
    </div>
  );
}
