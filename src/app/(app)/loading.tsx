export default function Loading() {
  return (
    <div className="min-h-full px-5 py-8 md:px-10 md:py-10 max-w-xl mx-auto flex flex-col gap-8">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded-full bg-primary/10 animate-pulse" />
        <div className="h-10 w-40 rounded-xl bg-foreground/8 animate-pulse" />
        <div className="h-4 w-48 rounded-full bg-foreground/5 animate-pulse" />
      </div>
      <div className="h-24 rounded-2xl bg-foreground/5 animate-pulse" />
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-foreground/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
