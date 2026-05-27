"use client";

import Image from "next/image";

export function MobileHeader() {
  return (
    <header className="flex items-center glass border-b border-border px-4 py-3 sticky top-0 z-40">
      <Image
        src="/brand/HLAVNI LOGO 1111 mint_result.webp"
        alt="Narovnej"
        width={110}
        height={110}
        className="h-14 w-auto"
        priority
      />
    </header>
  );
}
