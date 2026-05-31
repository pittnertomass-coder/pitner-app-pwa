"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-primary/60">Chyba aplikace</p>
      <h1 className="text-2xl font-bold">Něco se pokazilo</h1>
      <pre className="text-xs text-left bg-black/30 p-4 rounded-xl max-w-full overflow-auto text-red-400 max-h-64">
        {error.message}
        {error.digest ? `\n\nDigest: ${error.digest}` : ""}
        {error.stack ? `\n\n${error.stack}` : ""}
      </pre>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
      >
        Zkusit znovu
      </button>
    </div>
  );
}
