"use client";

import { useState } from "react";

const faqs = [
  {
    question: "프로젝트 진행 예상 기간은 어느 정도 소요되나요?",
    answer:
      "프로젝트의 규모와 포함되는 작업 범위(UI/UX 디자인, 브랜드 아이덴티티, 개발 등)에 따라 다릅니다. 일반적인 브랜딩 & UI/UX 프로젝트는 3주~6주, 대형 웹/앱 프로젝트는 8주 이상 소요됩니다.",
  },
  {
    question: "디자인 외에 프론트엔드 웹/앱 개발까지 포함하여 진행 가능한가요?",
    answer:
      "네, 가능합니다. jdesign studio는 Next.js, React, React Native 및 최신 인터랙션 모션(GSAP, Three.js)을 활용한 완성도 높은 프론트엔드 개발 서비스까지 통합 제공하고 있습니다.",
  },
  {
    question: "견적 및 계약 산정 기준은 어떻게 되나요?",
    answer:
      "작업 항목의 난이도, 화면 수, 인터랙션 구현 수준, 필요한 투입 인력 및 일정에 따라 투명하게 산정됩니다. 프로젝트 문의 제출 후 세부 인터뷰를 거쳐 정확한 제안서와 견적서를 작성해 드립니다.",
  },
  {
    question: "기존에 구축된 서비스의 리디자인 또는 부분 개선 작업도 진행하나요?",
    answer:
      "네, 기존 서비스의 UX/UI 분석 및 사용성 개선(Heuristic Evaluation), 브랜드 리뉴얼, 디자인 시스템 구축 등 부분적인 개선 및 고도화 작업도 적극 수행합니다.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full mt-16 md:mt-24">
      <div className="text-center mb-10">
        <h3 className="text-2xl md:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
          자주 묻는 질문 (FAQ)
        </h3>
        <p className="text-sm text-[#1D1D1F]/60 dark:text-[#F5F5F7]/60 mt-2">
          협업 전 궁금하신 사항을 미리 확인해 보세요.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-white dark:bg-[#1C1C1E] rounded-[5px] border border-[#1D1D1F]/5 dark:border-white/10 overflow-hidden transition-colors duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-5 text-left flex justify-between items-center gap-4 text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0066CC] dark:hover:text-[#0066CC] transition-colors"
              >
                <span>{faq.question}</span>
                <span
                  className={`text-xl transform transition-transform duration-300 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  ↓
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 leading-relaxed border-t border-[#1D1D1F]/5 dark:border-white/5 mt-1">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
