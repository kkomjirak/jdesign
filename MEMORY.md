# Project conventions

## Icons
- Store icons in the App Router convention paths, but declare all three in `layout.tsx` metadata with base-path-safe URLs. In Next.js 16.3, setting only `icons.shortcut` suppresses automatic PNG/Apple metadata; the production export also omits the automatic ICO link when PNG icons are present. Explicit `shortcut`, `icon`, and `apple` declarations keep all three linked. The ICO URL uses `?v=jid` to refresh the previous icon cache.
- Icons use the supplied circular dark-gray jiD logo. Keep its proportions and original colors. The supplied raster was 101 × 101 px; prefer a higher-resolution original for future larger icons.
- Convert images to RGBA before writing PNG-compressed ICO frames with Pillow. RGB ICO frames fail in Next.js 16.3/Turbopack with `The PNG is not in RGBA format!`.
- Build with `NEXT_PUBLIC_BASE_PATH=/jdesign` and verify exported icon links and served bytes. `tests/e2e/favicon.spec.ts` checks homepage, About, and Contact icon metadata and asset responses.

## Home projects and scroll layout
- Home selections are `jd003`, `jd005_a`, `jd026`, and `jd030`; `src/app/page.tsx` checks their matching GLB files at build time and passes only the selected portfolio data to `PromoGrid`.
- Home cards use thumbnails and link to the interactive detail viewer rather than opening four WebGL contexts or downloading four large models on the homepage.
- Keep the hero's parent in block flow and explicitly enable GSAP `pinSpacing`. GSAP defaults to no pin spacing when the parent uses `display: flex`, making following cards overlap a pinned hero.
- Use isolated stacking contexts and `100svh` minus the fixed 44px navigation height. Refresh ScrollTrigger when the actual parent width changes; small mobile resizes can otherwise retain a stale pinned inline width and create horizontal overflow.
- Use `gsap.matchMedia` with the no-reduced-motion query and revert on unmount/preference changes. One timeline owns hero text transforms to avoid competing entrance/scroll tweens.
- `home-promos.spec.ts` and `home-scroll.spec.ts` cover selected cards, pinning/release, reverse scroll, responsive resizes, and reduced-motion changes.

## 3D viewer
- Preserve source GLBs. Frame only visible mesh geometry with renderable materials. `jd006` contains alpha-zero helper parts that inflated the original camera bounds; uniform file scaling cannot fix auto-fit. `modelViewerBounds.ts` excludes fully transparent/hidden parts before centering and fitting.
- Model discovery prefers the exact folder-name GLB, skips hidden/backup candidates, then uses a sorted fallback. Discovery runs only during static generation.
- Lazy-load on viewport intersection; pause drawing offscreen/hidden, preserve the loaded scene, guard late callbacks, and dispose OrbitControls, shared GPU resources, and decoded image bitmaps on unmount.
- `npm run test:models` runs desktop and touch-enabled mobile Chromium serially with SwiftShader. Real draw calls, alpha/color framebuffer samples, edge checks, screenshots, loading/fallback controls, delayed navigation cleanup, and touch drag/pinch provide proof beyond asset HTTP status.
- `npm run test:e2e` is the separate general UI suite. Pass `E2E_BASE_URL` and `NEXT_PUBLIC_BASE_PATH=/jdesign` to validate a static export or deployed site. Use independent output directories if suites run concurrently; Playwright cleans its output directory, including child directories.
- In cross-browser tests, scroll lazy media/the full viewer into view rather than only its heading. Confirm React is interactive through a real reversible state transition before filling SSR-controlled fields; network silence alone is not a hydration guarantee.
