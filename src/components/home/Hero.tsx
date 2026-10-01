"use client";

import { useRef } from "react";
import Image from "next/image";
import { getAssetPath } from "@/lib/basePath";
import styles from "./Hero.module.css";
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
    preferences.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
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
        { yPercent: 0, scale: 0.9, opacity: 0.9 },
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
    <section ref={containerRef} className={`${styles.hero} relative isolate h-[calc(100svh-44px)] w-full bg-[#F5F5F7] overflow-hidden flex flex-col items-center`}>
      
      {/* Text Content */}
      <div ref={textRef} className="flex shrink-0 flex-col items-center text-center z-20 w-full px-4">
        <h1 className={`${styles.title} text-[32px] md:text-[56px] font-semibold tracking-[-0.02em] text-[#1D1D1F] leading-tight`}>
          필로포스-검안기
        </h1>
        <p className={`${styles.tagline} text-[17px] md:text-[28px] font-normal tracking-[-0.01em] text-[#1D1D1F]/80 mt-2`}>
          편안한 검안 경험을 위한 정제된 디자인.
        </p>
      </div>

      {/* Flow directly below the copy; top-align the portrait render without letterbox gaps. */}
      <div ref={mediaRef} className={`${styles.media} relative w-full max-w-[1024px] min-h-0 flex-1 z-10`}>
        <Image
          src={getAssetPath("/images/home/philophos-optometry.png")}
          alt="필로포스-검안기 제품 이미지"
          fill
          sizes="(max-width: 767px) 100vw, 1024px"
          preload
          className="object-contain object-top"
        />
      </div>
    </section>
  );
}
