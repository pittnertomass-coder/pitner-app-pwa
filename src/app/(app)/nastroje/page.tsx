import { Wind } from "lucide-react";
import { BreathingCircle } from "@/components/breathing-circle";

export default function NastrojePage() {
  return (
    <div className="min-h-full px-5 py-8 md:px-10 md:py-10 max-w-xl mx-auto flex flex-col gap-8">

      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60">
          Nástroje
        </p>
        <h1 className="text-4xl font-bold tracking-tight leading-tight flex items-center gap-3">
          <Wind className="h-8 w-8 text-primary" />
          Dýchání
        </h1>
        <p className="text-muted-foreground text-sm pt-0.5">
          Řízené dýchání pro různé situace
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        <BreathingCircle />
      </div>

    </div>
  );
}
