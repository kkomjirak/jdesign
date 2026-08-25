"use client";

import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useRef } from "react";

const categories = [
  { name: "All", href: "#all", icon: "🌐" },
  { name: "UI/UX", href: "#uiux", icon: "📱" },
  { name: "Branding", href: "#branding", icon: "✨" },
  { name: "Web", href: "#web", icon: "💻" },
  { name: "App", href: "#app", icon: "🚀" },
];

export default function PortfolioNav() {
  const navRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Apple Mac 페이지 특유의 상단 챕터 네비게이션 애니메이션
    gsap.from(navRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.1
    });
  }, { scope: navRef });

  return (
    <div ref={navRef} className="w-full bg-[#F5F5F7] dark:bg-[#111111] border-b border-[#1D1D1F]/10 dark:border-[#F5F5F7]/10 pt-[44px]">
      <div className="max-w-[980px] mx-auto px-4 py-3 flex items-center justify-center md:justify-start gap-8 md:gap-12 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <Link key={cat.name} href={cat.href} className="flex flex-col items-center gap-1 group min-w-max">
            <span className="text-[26px] md:text-[32px] group-hover:scale-110 transition-transform duration-300 ease-apple">
              {cat.icon}
            </span>
            <span className="text-[11px] md:text-[12px] font-medium tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] opacity-70 group-hover:opacity-100 transition-opacity">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
