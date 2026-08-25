"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const projects = [
  {
    id: 1,
    title: "Global FinTech App",
    category: "UI/UX Design",
    description: "차세대 금융 경험을 위한 혁신적인 인터페이스 디자인.",
    colSpan: "col-span-1 md:col-span-2 md:row-span-2",
    theme: "dark",
    height: "h-[500px] md:h-[750px]",
  },
  {
    id: 2,
    title: "Eco Brand Identity",
    category: "Branding",
    description: "지속가능한 미래를 그리는 친환경 브랜드 아이덴티티.",
    colSpan: "col-span-1",
    theme: "light",
    height: "h-[450px]",
  },
  {
    id: 3,
    title: "Smart Home Dashboard",
    category: "Web & UI",
    description: "모든 디바이스를 한 곳에서 제어하는 대시보드.",
    colSpan: "col-span-1",
    theme: "light",
    height: "h-[450px]",
  },
  {
    id: 4,
    title: "Future Mobility",
    category: "Concept Design",
    description: "모빌리티의 새로운 패러다임을 제시하는 콘셉트 아트.",
    colSpan: "col-span-1 md:col-span-2",
    theme: "dark",
    height: "h-[500px] md:h-[600px]",
  }
];

export default function PortfolioGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    // 타이틀 등장 애니메이션
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.3 }
    );

    // 각 프로젝트 카드 스크롤 애니메이션 (Apple 벤토 그리드 스타일)
    itemsRef.current.forEach((item, i) => {
      if (!item) return;
      gsap.fromTo(
        item,
        { opacity: 0, y: 80, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          }
        }
      );
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-16 md:py-24">
      {/* 갤러리 타이틀 */}
      <div ref={titleRef} className="text-center mb-16 md:mb-24">
        <h2 className="text-[40px] md:text-[64px] font-semibold tracking-[-0.02em] text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
          우리가 완성한 <br className="md:hidden" />혁신적인 경험들.
        </h2>
        <p className="text-[19px] md:text-[24px] mt-4 tracking-[-0.01em] text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70">
          디테일에 집착하여 탄생한 최고의 포트폴리오.
        </p>
      </div>

      {/* 벤토 그리드 (Bento Grid) 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {projects.map((project, index) => {
          const isDark = project.theme === "dark";
          return (
            <div
              key={project.id}
              ref={el => { itemsRef.current[index] = el; }}
              className={`group relative rounded-[28px] md:rounded-[40px] overflow-hidden flex flex-col justify-start ${project.colSpan} ${project.height} ${isDark ? "bg-[#000000]" : "bg-[#F5F5F7]"}`}
            >
              {/* 프로젝트 텍스트 정보 */}
              <div className="relative z-20 p-8 md:p-12 text-center flex flex-col items-center">
                <span className={`text-[12px] md:text-[14px] font-semibold tracking-wide uppercase ${isDark ? "text-[#F5F5F7]/50" : "text-[#1D1D1F]/50"}`}>
                  {project.category}
                </span>
                <h3 className={`text-[28px] md:text-[40px] font-semibold tracking-tight mt-1 leading-tight ${isDark ? "text-[#F5F5F7]" : "text-[#1D1D1F]"}`}>
                  {project.title}
                </h3>
                <p className={`text-[17px] md:text-[19px] font-medium tracking-tight mt-3 max-w-[90%] md:max-w-[70%] ${isDark ? "text-[#F5F5F7]/80" : "text-[#1D1D1F]/80"}`}>
                  {project.description}
                </p>
              </div>

              {/* 하단 미디어 플레이스홀더 */}
              <div className="absolute inset-0 z-10 flex items-end justify-center pointer-events-none pb-0">
                <div className="relative w-[85%] h-[60%] rounded-t-[20px] bg-gradient-to-t from-gray-500/20 to-transparent flex items-center justify-center transform transition-transform duration-700 ease-apple group-hover:scale-105">
                  <span className={`text-xs md:text-sm uppercase tracking-widest ${isDark ? "text-white/20" : "text-black/20"}`}>
                    Project Mockup
                  </span>
                </div>
              </div>
              
              {/* 가독성 확보용 다크 오버레이 */}
              {isDark && <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent z-15 pointer-events-none" />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
