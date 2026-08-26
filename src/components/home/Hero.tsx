"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !textRef.current || !mediaRef.current) return;

    // Scroll-jacking 효과: 섹션을 고정(pin)시키고, 스크롤에 따라 텍스트와 미디어 애니메이션 처리
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top", // 컨테이너 상단이 뷰포트 상단에 닿을 때 시작
        end: "+=120%",    // 뷰포트 높이의 120%만큼 스크롤하는 동안 애니메이션 진행
        pin: true,        // 컨테이너 화면에 고정
        scrub: 1,         // 부드러운 스크러빙 (1초 지연으로 부드럽게 따라옴)
      },
    });

    // 1. 스크롤 다운 시: 텍스트가 위로 올라가며 페이드 아웃 & 살짝 축소
    tl.to(textRef.current, {
      opacity: 0,
      y: -50,
      scale: 0.95,
      duration: 1,
      ease: "power2.out",
    }, 0); // 타임라인 시작(0) 시점에 동시 실행

    // 2. 스크롤 다운 시: 제품 미디어가 하단에서 올라오며 확대 (Transform, Opacity만 사용)
    tl.fromTo(
      mediaRef.current,
      {
        y: "20%",
        scale: 0.85,
        opacity: 0.6,
      },
      {
        y: "0%",
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      },
      0 // 텍스트 애니메이션과 동시 실행
    );

    // 컴포넌트 최초 마운트 시 등장 애니메이션 (스크롤과 무관)
    gsap.fromTo(
      textRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.3 }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative h-screen w-full bg-[#F5F5F7] overflow-hidden flex flex-col items-center justify-center">
      
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
