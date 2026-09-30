# Project conventions

## Icons
- Store icons in the App Router convention paths, but declare all three in `layout.tsx` metadata with base-path-safe URLs. In Next.js 16.3, setting only `icons.shortcut` suppresses automatic PNG/Apple metadata; the production export also omits the automatic ICO link when PNG icons are present. Explicit `shortcut`, `icon`, and `apple` declarations keep all three linked. The ICO URL uses `?v=jid` to refresh the previous icon cache.
- Icons use the supplied circular dark-gray jiD logo. Keep its proportions and original colors. The supplied raster was 101 × 101 px; prefer a higher-resolution original for future larger icons.
- Convert images to RGBA before writing PNG-compressed ICO frames with Pillow. RGB ICO frames fail in Next.js 16.3/Turbopack with `The PNG is not in RGBA format!`.
- Build with `NEXT_PUBLIC_BASE_PATH=/jdesign` and verify exported icon links and served bytes. `tests/e2e/favicon.spec.ts` checks homepage, About, and Contact icon metadata and asset responses.
