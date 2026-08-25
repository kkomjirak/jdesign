"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import ThemeToggle from "@/components/common/ThemeToggle";

const navItems = [
  { name: "About Us", href: "/about" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Contact", href: "/contact" },
];

export default function GNB() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLUListElement>(null);

  useGSAP(() => {
    if (!mobileMenuRef.current || !menuItemsRef.current) return;

    if (isMobileMenuOpen) {
      gsap.to(mobileMenuRef.current, {
        height: "100vh",
        opacity: 1,
        duration: 0.5,
        ease: "power3.inOut",
        display: "block",
      });
      gsap.fromTo(
        menuItemsRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.04, ease: "power2.out", delay: 0.2 }
      );
    } else {
      gsap.to(mobileMenuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power3.inOut",
        onComplete: () => {
          if (mobileMenuRef.current) {
            gsap.set(mobileMenuRef.current, { display: "none" });
          }
        },
      });
    }
  }, [isMobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5F5F7]/80 dark:bg-[#000000]/80 backdrop-blur-md transition-colors duration-300">
      <nav className="mx-auto max-w-[1024px] px-4" aria-label="Global Navigation">
        <div className="flex h-[44px] items-center justify-between text-xs font-normal tracking-[-0.01em] text-[#1D1D1F] dark:text-[#F5F5F7]">
          
          <button
            className="md:hidden p-2 flex flex-col justify-center items-center gap-[4px] z-50 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMobileMenuOpen}
          >
            <div className={`w-[14px] h-[1px] bg-current transition-transform duration-300 ease-apple ${isMobileMenuOpen ? "rotate-45 translate-y-[2.5px]" : ""}`} />
            <div className={`w-[14px] h-[1px] bg-current transition-transform duration-300 ease-apple ${isMobileMenuOpen ? "-rotate-45 -translate-y-[2.5px]" : ""}`} />
          </button>

          <Link href="/" className="transition-opacity hover:opacity-70 z-50 relative flex items-center" aria-label="홈">
            {/* Light mode logo */}
            <img 
              src="/logo.png" 
              alt="jiD design studio" 
              className="dark:hidden h-7 md:h-8 w-auto object-contain"
            />
            {/* Dark mode logo */}
            <img 
              src="/logo_dark.png" 
              alt="jiD design studio" 
              className="hidden dark:block h-7 md:h-8 w-auto object-contain"
            />
          </Link>

          <ul className="hidden md:flex flex-1 justify-start gap-10 pl-12">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="py-3 transition-colors hover:text-black dark:hover:text-white opacity-80 hover:opacity-100 text-[13px]"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center z-50 relative">
            <ThemeToggle />
          </div>

        </div>
      </nav>

      <div 
        ref={mobileMenuRef}
        className="md:hidden absolute top-0 left-0 w-full bg-[#F5F5F7] dark:bg-[#000000] hidden z-40 pt-[44px]"
      >
        <div className="px-10 pt-4 pb-20 h-[calc(100vh-44px)] overflow-y-auto">
          <ul ref={menuItemsRef} className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.name} className="border-b border-[#1D1D1F]/10 dark:border-[#F5F5F7]/10 last:border-0">
                <Link
                  href={item.href}
                  className="block py-3 text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] opacity-90 hover:opacity-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
