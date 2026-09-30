"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const hero = containerRef.current;
    const text = textRef.current;
    const media = mediaRef.current;
    if (!hero || !text || !media) return;

    const host = hero.parentElement;
    let hostWidth = host?.clientWidth ?? 0;
    let resizeFrame = 0;
    // Mobile ScrollTrigger can ignore small viewport resizes. Observe the real
    // block width so a pinned inline width cannot create a horizontal overflow.
    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = entry.contentRect.width;
      if (nextWidth === hostWidth) return;
      hostWidth = nextWidth;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    if (host) observer.observe(host);

    const preferences = gsap.matchMedia();
    preferences.add("(prefers-reduced-motion: no-preference)", () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top+=44",
          end: "+=120%",
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
          scrub: 1,
        },
      });
      // One timeline owns each transform: no competing entrance tween.
      timeline.to(text, { opacity: 0, y: -40, scale: 0.95, duration: 1, ease: "power2.out" }, 0);
      timeline.fromTo(media,
        { yPercent: 16, scale: 0.9, opacity: 0.75 },
        { yPercent: 0, scale: 1, opacity: 1, duration: 1, ease: "power2.out" },
        0,
      );
    });
    // Reverting also removes the pin spacer on navigation or preference changes.
    return () => {
      observer.disconnect();
      cancelAnimationFrame(resizeFrame);
      preferences.revert();
    };
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative isolate h-[calc(100svh-44px)] w-full bg-[#F5F5F7] overflow-hidden flex flex-col items-center justify-center">
      
      {/* Text Content */}
      <div ref={textRef} className="absolute top-[18%] flex flex-col items-center text-center z-20 w-full px-4">
        <h1 className="text-[32px] md:text-[56px] font-semibold tracking-[-0.02em] text-[#1D1D1F] leading-tight">
          iPhone 15 Pro
        </h1>
        <p className="text-[19px] md:text-[28px] font-normal tracking-[-0.01em] text-[#1D1D1F]/80 mt-2">
          티타늄. 그토록 견고한. 그토록 가벼운. 그토록 프로.
        </p>
      </div>

      {/* Product Image/Video Placeholder */}
      <div ref={mediaRef} className="absolute bottom-0 w-full max-w-[1024px] h-[55%] md:h-[65%] z-10 flex items-end justify-center px-4">
        {/* Placeholder (Width: 1024, Height: ~600) */}
        <div className="relative w-full h-full bg-white rounded-t-[5px] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-x border-[#E5E5EA] flex flex-col items-center justify-center">
           <span className="text-[#1D1D1F]/40 text-sm md:text-lg font-semibold tracking-widest uppercase">
              Product Media Area
           </span>
           <span className="text-[#1D1D1F]/30 text-xs mt-2">
              (Video / Image Placeholder - 1024 x 600)
           </span>
        </div>
      </div>
    </section>
  );
}
