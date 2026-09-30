"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { getAssetPath } from "@/lib/basePath";

import portfolioData from "../../../public/images/portfolio/portfolio_data.json";

const featuredIds = ["jd001", "jd002", "jd003", "jd004_a"];
const promos = portfolioData
  .filter((project) => featuredIds.includes(project.id))
  .map((project) => ({
    ...project,
    subtitle: `${project.category} Design`,
    theme: "light",
  }));

export default function PromoGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    if (!containerRef.current) return;

    // 카드가 뷰포트에 나타날 때 위로 부드럽게 페이드인 (ScrollTrigger)
    cardsRef.current.forEach((card, index) => {
      if (!card) return;
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%", // 카드의 상단이 뷰포트의 85% 지점에 도달할 때 시작
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="w-full max-w-[1440px] mx-auto px-4 py-4 md:py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map((promo, index) => {
          const isDark = promo.theme === "dark";
          return (
            <div
              key={promo.id}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className={`group relative h-[500px] md:h-[580px] w-full overflow-hidden flex flex-col items-center justify-start pt-12 cursor-pointer ${
                isDark ? "bg-[#000000]" : "bg-[#F5F5F7]"
              }`}
            >
              {/* Text Content */}
              <div className="relative z-20 flex flex-col items-center text-center px-6">
                <h2 className="text-[32px] md:text-[40px] font-semibold tracking-tight text-[#1D1D1F]">
                  {promo.title}
                </h2>
                <p className="text-sm md:text-lg mt-3 font-normal max-w-[80%] text-[#1D1D1F] opacity-90">
                  {promo.subtitle}
                </p>
              </div>

              {/* 상품 이미지 */}
              <div className="absolute inset-0 z-0 bg-[#F5F5F7]">
                <img 
                  src={getAssetPath(promo.image)} 
                  alt={promo.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
