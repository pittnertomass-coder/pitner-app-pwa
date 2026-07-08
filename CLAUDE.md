# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

# Pravidla komunikace

Uživatel není profesionální programátor. Komunikuj věcně, stručně a srozumitelně.

## Gentlemanská pravidla

1. **ŽÁDNÝ ŽARGON** — Nepoužívej složité technické termíny (refaktorování, asynchronní, dependency injection apod.). Pokud je termín nezbytný, okamžitě ho lidsky vysvětli na jednoduchém příkladu.
2. **STRUČNOST A VĚCNOST** — Odpovídej bez omáčky, zdvořilostních frází a dlouhých úvodů. Jdi rovnou k věci.
3. **KROK ZA KROKEM** — Pokud je potřeba něco udělat (spustit příkaz, upravit soubor), napiš to jako jasný, očíslovaný seznam.
4. **KÓD JE ČISTÝ A KOMENTOVANÝ** — Do samotného kódu piš komentáře přímo v češtině, aby uživatel chápal, co která část dělá.

## Struktura odpovědi

- Co jsme udělali / Co se změnilo (1–2 věty).
- Kód nebo úprava (v přehledném bloku).
- Co má uživatel udělat dál / Jak to otestovat (krátký návod).

---

# Příkazy

```bash
npm run dev      # spustí vývojový server na http://localhost:3000
npm run build    # sestaví produkční verzi (odhalí TypeScript chyby)
npm run start    # spustí produkční verzi lokálně
```

Není nakonfigurovaný žádný linter ani testovací framework.

---

# Architektura

## Co to je

PWA členská sekce pro `app.narovnej` — uzavřená část pro platící členy, oddělená od marketingového WordPress webu.

## Routování (`src/app/`)

Dvě route skupiny:

- **`(auth)/`** — veřejné stránky: `/login`, `/registrace`
- **`(app)/`** — chráněná část, vyžaduje přihlášení:
  - `/dashboard` — přehled
  - `/cesta` — tréninková cesta po týdnech
  - `/klinika` — fyzio klinika (výběr problému přes mapu těla)
  - `/poslech` — audio kurzy
  - `/nastroje` — pomocné nástroje (dech, apod.)

## Ochrana stránek (middleware)

`middleware.ts` → `src/lib/supabase/middleware.ts` — každý request projde Supabase auth kontrolou. Nepřihlášený uživatel je přesměrován na `/login`.

**Dev bypass** — pro lokální vývoj bez Supabase:
- Navštiv `http://localhost:3000/api/dev-bypass` → nastaví cookie → přeskočí auth
- Nebo nastav `OPEN_ACCESS=1` v `.env.local`
- Mock dat a profilu je v `src/lib/dev-mock.ts`

## Globální stav (Zustand stores v `src/store/`)

| Store | Co drží |
|---|---|
| `auth-store` | přihlášený uživatel + profil (včetně `is_premium`) |
| `video-store` | aktuálně otevřené video + progress |
| `player-store` | stav audio přehrávače |
| `audio-sheet-store` | otevření/zavření audio panelu |
| `progress-store` | progress tréninků |

## Přehrávače

Video a audio se otevírají jako "sheet" panel (vysouvá se zdola) — `VideoSheet` a `AudioSheet` jsou globálně mountnuté v `(app)/layout.tsx`. Stránka pouze zavolá store akci (`openVideo()` / `openTrack()`), sheet se postará o vše ostatní.

## Supabase

- **Server komponenty** → `src/lib/supabase/server.ts` (`createClient()`)
- **Client komponenty** → `src/lib/supabase/client.ts` (`createClient()`)
- **Admin operace** (webhook) → přímý `createClient()` se `SUPABASE_SERVICE_ROLE_KEY`
- Typy databáze: `src/types/database.ts`

**RLS pravidlo:** Obsah (`trainings`, `audio_tracks`) je dostupný jen uživatelům s `is_premium = true` v tabulce `profiles`. Pole `is_premium` smí měnit **pouze** Stripe webhook přes service role klíč — nikdy přes klientský kód.

## Platby (Stripe)

`src/app/api/stripe/webhook/route.ts` — příjme event od Stripe, ověří podpis, a:
- `checkout.session.completed` → nastaví `is_premium = true`
- `customer.subscription.deleted` → nastaví `is_premium = false`

## UI

- **Komponenty:** shadcn/ui (`src/components/ui/`) + vlastní komponenty v `src/components/`
- **Styly:** Tailwind CSS v4
- **Ikony:** Lucide React
- **Notifikace:** Sonner (`toast.success()`, `toast.error()`)
- **Motiv:** dark/light přes `next-themes`, ThemeProvider v root layoutu
