"use client";

import { useEffect, useRef, useState } from "react";
import { getAssetPath } from "@/lib/basePath";
import type { DetailImageMeta } from "./DetailGalleryView";

interface ImageSequenceViewProps {
  frames: DetailImageMeta[];
  projectTitle: string;
}

export default function ImageSequenceView({ frames, projectTitle }: ImageSequenceViewProps) {
  const regionRef = useRef<HTMLElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  // Stay paused until the client preference is known (including during hydration).
  const [reducedMotion, setReducedMotion] = useState(true);
  const [documentHidden, setDocumentHidden] = useState(true);
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const playing = ready && !failed && (userPlaying ?? !reducedMotion);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      setReducedMotion(media.matches);
      setUserPlaying(null);
    };
    const updateVisibility = () => setDocumentHidden(document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;
    const preloadObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNear(true);
        preloadObserver.disconnect();
      }
    }, { rootMargin: "240px" });
    const visibilityObserver = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    preloadObserver.observe(region);
    visibilityObserver.observe(region);
    return () => {
      preloadObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    // Decode the actual layered DOM images, not just detached preload copies.
    // Every rejection is handled; one bad frame freezes on the first good frame.
    Promise.all(frames.map(async (_, index) => {
      try {
        await imageRefs.current[index]!.decode();
        return true;
      } catch {
        return false;
      }
    })).then((decoded) => {
      if (cancelled) return;
      const firstAvailable = decoded.findIndex(Boolean);
      setFailed(decoded.some((success) => !success));
      setActive(Math.max(0, firstAvailable));
      setReady(firstAvailable !== -1);
    });
    return () => { cancelled = true; };
  }, [near, frames]);

  useEffect(() => {
    if (!playing || !visible || documentHidden) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % frames.length), 180);
    return () => window.clearInterval(timer);
  }, [playing, visible, documentHidden, frames.length]);

  if (frames.length === 0) return null;
  const first = frames[0];
  const aspectRatio = first.width > 0 && first.height > 0 ? first.width / first.height : first.ratio || 16 / 9;
  return (
    <section ref={regionRef} aria-label={`${projectTitle} 연속 이미지`} className="w-full mt-6 md:mt-8">
      <div style={{ position: "relative", width: "100%", aspectRatio, overflow: "hidden", borderRadius: 5, background: "#fff" }}>
        {frames.map((frame, index) => (
          <img
            key={frame.src}
            ref={(image) => { imageRefs.current[index] = image; }}
            src={near ? getAssetPath(frame.src) : undefined}
            alt={`${projectTitle} 연속 이미지 ${index + 1} / ${frames.length}`}
            aria-hidden={index !== active || !ready}
            style={{ display: ready && index === active ? "block" : "none", position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
          />
        ))}
        {!ready && !failed && <p className="absolute inset-0 flex items-center justify-center text-sm text-[#1D1D1F]/60">연속 이미지를 준비하고 있습니다.</p>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
        <button
          type="button"
          disabled={!ready || failed}
          onClick={() => setUserPlaying(!playing)}
          aria-label={playing ? "연속 이미지 일시정지" : "연속 이미지 재생"}
          style={{ minWidth: 44, minHeight: 44 }}
          className="px-4 rounded-[5px] border border-current/20 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {playing ? "일시정지" : "재생"}
        </button>
        <p aria-live="off" className="tabular-nums">프레임 {active + 1} / {frames.length}</p>
      </div>
      {failed && <p role="status" className="mt-2 text-sm text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70">연속 이미지 일부를 불러오지 못했습니다. 사용 가능한 첫 이미지를 표시합니다.</p>}
    </section>
  );
}