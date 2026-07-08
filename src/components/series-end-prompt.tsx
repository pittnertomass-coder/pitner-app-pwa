import { SeriesLikeButton } from "@/components/like-button";

// Banner zobrazovaný na konci série (po 10 epizodách)
export function SeriesEndPrompt({
  category,
  initialCount,
  initialLiked,
}: {
  category: string;
  initialCount: number;
  initialLiked: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center mt-2"
      style={{
        background: "oklch(0.18 0.04 168 / 0.5)",
        border: "1px solid oklch(0.35 0.08 168 / 0.4)",
      }}
    >
      <p className="text-sm font-semibold" style={{ color: "oklch(0.85 0.05 168)" }}>
        Líbil se vám celý podcast?
      </p>
      <SeriesLikeButton
        category={category}
        initialCount={initialCount}
        initialLiked={initialLiked}
      />
    </div>
  );
}
