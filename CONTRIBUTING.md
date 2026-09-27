# Contributing to Letterbook

Thanks for helping! Bug reports, ideas and pull requests are all welcome.

## Getting started

```bash
npm install
npm run dev
```

Before opening a pull request, run `npm run build`. It typechecks the project and makes a
production build, and it's what CI runs.

## Where things live

| Path | What it is |
| --- | --- |
| `src/components/` | Screens and UI. Shared building blocks are in `ui.tsx`. |
| `src/state/library.tsx` | Reading data (diary, lists, watchlist, profile) and its actions. |
| `src/state/ui.tsx` | Overlay stack, toasts and confirm dialogs. |
| `src/lib/openLibrary.ts` | Open Library search, trending, covers and caching. |
| `src/lib/storyCard.ts` | The Instagram Story image renderer. |
| `src/lib/auth.ts` | On-device accounts. |
| `android/` | Capacitor Android shell. |

## Guidelines

- Keep the look quiet and consistent: dark slate (`#14181c`), hairline borders
  (`#2c3440`), the three accents (orange `#FF8000`, green `#00E054`, blue `#40BCF4`),
  and small-caps section headers.
- Everything must work on a 360px-wide phone and on desktop.
- Don't add trackers or analytics.
- Letterbook is inspired by Letterboxd but is not affiliated with it. Don't use
  Letterboxd's logo, name or assets inside the app beyond the credit line.

## Good first contributions

- A sync backend (for example Supabase or PocketBase) so accounts work across devices.
- Real follows and a real activity feed.
- Translations.
- Better tablet layouts.
