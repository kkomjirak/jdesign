"use client";

import { useState } from "react";
import {
  ContactFormData,
  createMailtoLink,
  formatContactContent,
  CONTACT_RECEIVER_EMAIL,
} from "@/app/actions/contact";

const projectTypes = [
  "Product",
  "UX/UI",
];

const budgetRanges = [
  "1,000만원 미만",
  "1,000만원 - 3,000만원",
  "3,000만원 - 5,000만원",
  "5,000만원 이상",
];

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    company: "",
    message: "",
    selectedTypes: [],
    selectedBudget: "",
  });

  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [copyFeedback, setCopyFeedback] = useState("");

  const toggleProjectType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter((t) => t !== type)
        : [...prev.selectedTypes, type],
    }));
  };

  const setSelectedBudget = (budget: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedBudget: budget,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = createMailtoLink(formData);
    // Open system email client
    window.location.href = mailtoUrl;
    setStatus("success");
  };

  const handleCopyContent = () => {
    const formatted = formatContactContent(formData);
    navigator.clipboard.writeText(formatted).then(() => {
      setCopyFeedback("문의 내용이 클립보드에 복사되었습니다!");
      setTimeout(() => setCopyFeedback(""), 3000);
    });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(CONTACT_RECEIVER_EMAIL).then(() => {
      setCopyFeedback("이메일 주소(yoksk7@naver.com)가 복사되었습니다!");
      setTimeout(() => setCopyFeedback(""), 3000);
    });
  };

  return (
    <div className="w-full bg-white dark:bg-[#1C1C1E] rounded-[5px] p-6 md:p-10 shadow-sm border border-[#1D1D1F]/5 dark:border-white/10 transition-colors duration-300">
      <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
        프로젝트 문의하기
      </h3>
      <p className="text-sm text-[#1D1D1F]/60 dark:text-[#F5F5F7]/60 mb-8">
        어떤 프로젝트를 구상하고 계신가요? 아래 항목을 작성해 주시면 검토 후 답변드립니다.
      </p>

      {status === "success" ? (
        <div className="py-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#0066CC]/10 text-[#0066CC] rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
            이메일 프로그램이 연결되었습니다!
          </h4>
          <p className="text-sm text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 mt-2 max-w-md">
            기본 메일 앱에 작성하신 내용이 자동 입력되었습니다. 메일 앱에서 [보내기]를 누르시면 문의가 전달됩니다.
          </p>

          <div className="mt-6 p-5 rounded-[5px] bg-[#F2F2F7] dark:bg-[#252528] text-xs text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80 max-w-md w-full text-left space-y-3">
            <p className="font-semibold text-center text-[#1D1D1F] dark:text-[#F5F5F7]">
              💡 메일 앱이 자동으로 열리지 않으셨나요?
            </p>
            <p className="text-center text-[#1D1D1F]/60 dark:text-[#F5F5F7]/60">
              아래 버튼으로 문의 내용을 복사하거나 이메일 주소로 직접 발송해 주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyContent}
                className="flex-1 py-2.5 px-3 rounded-[5px] bg-[#0066CC] text-white font-medium text-center hover:bg-[#0055B3] transition-colors cursor-pointer"
              >
                문의 내용 복사하기
              </button>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex-1 py-2.5 px-3 rounded-[5px] bg-white dark:bg-[#1C1C1E] border border-[#1D1D1F]/15 dark:border-[#F5F5F7]/20 text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-center hover:border-[#0066CC] transition-colors cursor-pointer"
              >
                이메일 주소 복사
              </button>
            </div>
            {copyFeedback && (
              <p className="text-center text-[#0066CC] font-semibold text-xs animate-in fade-in pt-1">
                ✓ {copyFeedback}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              setStatus("idle");
              setFormData({
                name: "",
                email: "",
                company: "",
                message: "",
                selectedTypes: [],
                selectedBudget: "",
              });
            }}
            className="mt-8 px-6 py-2.5 rounded-[5px] bg-[#1D1D1F] text-white dark:bg-white dark:text-black text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            새 문의 작성하기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Types */}
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80 uppercase tracking-wider mb-3">
              1. 관심 서비스 분야 (중복 선택 가능)
            </label>
            <div className="flex flex-wrap gap-2.5">
              {projectTypes.map((type) => {
                const isSelected = formData.selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleProjectType(type)}
                    className={`px-4 py-2.5 rounded-[5px] text-xs md:text-sm font-medium transition-all duration-200 border flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#0066CC] text-white border-[#0066CC] shadow-md font-semibold ring-2 ring-[#0066CC]/30"
                        : "bg-[#F2F2F7] dark:bg-[#252528] text-[#1D1D1F] dark:text-[#F5F5F7] border-[#1D1D1F]/15 dark:border-[#F5F5F7]/20 hover:border-[#0066CC]/60 dark:hover:border-[#0066CC]/70 hover:bg-white dark:hover:bg-[#1C1C1E] shadow-2xs"
                    }`}
                  >
                    {isSelected && (
                      <span className="text-xs font-bold animate-in fade-in zoom-in duration-200">✓</span>
                    )}
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80 uppercase tracking-wider mb-3">
              2. 예상 예산 범위
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {budgetRanges.map((budget) => {
                const isSelected = formData.selectedBudget === budget;
                return (
                  <button
                    key={budget}
                    type="button"
                    onClick={() => setSelectedBudget(budget)}
                    className={`px-3 py-3 rounded-[5px] text-xs md:text-sm font-medium transition-all duration-200 border text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#0066CC] text-white border-[#0066CC] shadow-md font-semibold ring-2 ring-[#0066CC]/30"
                        : "bg-[#F2F2F7] dark:bg-[#252528] text-[#1D1D1F] dark:text-[#F5F5F7] border-[#1D1D1F]/15 dark:border-[#F5F5F7]/20 hover:border-[#0066CC]/60 dark:hover:border-[#0066CC]/70 hover:bg-white dark:hover:bg-[#1C1C1E] shadow-2xs"
                    }`}
                  >
                    {isSelected && (
                      <span className="text-xs font-bold animate-in fade-in zoom-in duration-200">✓</span>
                    )}
                    <span>{budget}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Email & Company Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80 uppercase tracking-wider mb-2">
                성함 / 담당자명 *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="홍길동"
                className="w-full px-4 py-3 rounded-[5px] bg-[#F2F2F7] dark:bg-[#252528] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#1D1D1F]/40 dark:placeholder-white/40 text-sm border border-[#1D1D1F]/15 dark:border-[#F5F5F7]/20 hover:border-[#0066CC]/60 dark:hover:border-[#0066CC]/70 focus:outline-none focus:border-[#0066CC] focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-[#0066CC]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80 uppercase tracking-wider mb-2">
                이메일 주소 *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full px-4 py-3 rounded-[5px] bg-[#F2F2F7] dark:bg-[#252528] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#1D1D1F]/40 dark:placeholder-white/40 text-sm border border-[#1D1D1F]/15 dark:border-[#F5F5F7]/20 hover:border-[#0066CC]/60 dark:hover:border-[#0066CC]/70 focus:outline-none focus:border-[#0066CC] focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-[#0066CC]/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80 uppercase tracking-wider mb-2">
              회사명 / 브랜드명
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="jiD design (선택사항)"
              className="w-full px-4 py-3 rounded-[5px] bg-[#F2F2F7] dark:bg-[#252528] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#1D1D1F]/40 dark:placeholder-white/40 text-sm border border-[#1D1D1F]/15 dark:border-[#F5F5F7]/20 hover:border-[#0066CC]/60 dark:hover:border-[#0066CC]/70 focus:outline-none focus:border-[#0066CC] focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-[#0066CC]/20 transition-all"
            />
          </div>

          {/* Message (Textarea) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80 uppercase tracking-wider">
                프로젝트 설명 및 상세 요청사항 *
              </label>
              <span className="text-[11px] text-[#1D1D1F]/50 dark:text-[#F5F5F7]/50">
                {formData.message.length}자
              </span>
            </div>
            <div className="relative">
              <textarea
                required
                rows={5}
                maxLength={2000}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="프로젝트의 목적, 주요 기능, 원하는 디자인 톤앤매너, 희망 일정 등을 자유롭게 작성해 주세요."
                className="w-full px-4 py-3.5 rounded-[5px] bg-[#F2F2F7] dark:bg-[#252528] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#1D1D1F]/40 dark:placeholder-white/40 text-sm leading-relaxed border border-[#1D1D1F]/15 dark:border-[#F5F5F7]/20 hover:border-[#0066CC]/60 dark:hover:border-[#0066CC]/70 focus:outline-none focus:border-[#0066CC] focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-[#0066CC]/20 transition-all min-h-[140px] resize-y"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-[5px] bg-[#0066CC] hover:bg-[#0055B3] text-white font-medium text-base tracking-tight transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>이메일로 문의 보내기 ➔</span>
          </button>
        </form>
      )}
    </div>
  );
}
