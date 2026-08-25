"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import FAQSection from "@/components/contact/FAQSection";

export default function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Header Entrance Animation
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    // Form & Info entrance animation
    gsap.fromTo(
      [formRef.current, infoRef.current],
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.2 }
    );
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="flex flex-col min-h-screen bg-[#F5F5F7] dark:bg-[#111111] transition-colors duration-300 py-16 md:py-24 px-4 md:px-8"
    >
      <div className="max-w-[1200px] mx-auto w-full">
        {/* Page Header */}
        <div ref={headerRef} className="text-center mb-12 md:mb-16">
          <span className="text-xs md:text-sm font-semibold tracking-wider text-[#0066CC] uppercase">
            Let&apos;s Build Something Great Together
          </span>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mt-3 leading-tight">
            Contact Us
          </h1>
          <p className="mt-4 text-base md:text-xl text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 max-w-xl mx-auto leading-relaxed">
            비주얼 아이덴티티부터 디지털 제품 인터랙션까지,<br />
            jdesign studio와 함께 당신의 비전을 완성해보세요.
          </p>
        </div>

        {/* Form & Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div ref={formRef} className="lg:col-span-7">
            <ContactForm />
          </div>
          <div ref={infoRef} className="lg:col-span-5">
            <ContactInfo />
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </div>
  );
}
