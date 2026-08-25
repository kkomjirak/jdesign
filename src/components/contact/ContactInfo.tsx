"use client";

import { useState } from "react";

export default function ContactInfo() {
  const [copied, setCopied] = useState(false);
  const email = "yoksk7@naver.com";

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Email Card */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 md:p-8 shadow-sm border border-[#1D1D1F]/5 dark:border-white/10 transition-colors duration-300">
        <span className="text-xs font-semibold text-[#0066CC] uppercase tracking-wider">
          Direct Contact
        </span>
        <h4 className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-1">
          이메일 문의
        </h4>
        <p className="text-xs text-[#1D1D1F]/60 dark:text-[#F5F5F7]/60 mt-1 mb-4">
          프로젝트 문의 및 기타 협업 제안을 이메일로 빠르게 보내실 수 있습니다.
        </p>

        <div className="flex items-center justify-between bg-[#F2F2F7] dark:bg-[#252528] p-3.5 rounded-xl border border-[#1D1D1F]/15 dark:border-[#F5F5F7]/20 hover:border-[#0066CC]/60 dark:hover:border-[#0066CC]/70 transition-all">
          <span className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
            {email}
          </span>
          <button
            onClick={copyEmail}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1C1C1E] text-xs font-medium text-[#1D1D1F] dark:text-white border border-[#1D1D1F]/15 dark:border-[#F5F5F7]/20 hover:border-[#0066CC] hover:text-[#0066CC] shadow-2xs transition-all flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
          >
            {copied ? (
              <>
                <span className="text-emerald-500 font-semibold">복사됨!</span>
              </>
            ) : (
              <span>복사하기</span>
            )}
          </button>
        </div>
      </div>

      {/* Location & Hours Card */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 md:p-8 shadow-sm border border-[#1D1D1F]/5 dark:border-white/10 transition-colors duration-300">
        <span className="text-xs font-semibold text-[#0066CC] uppercase tracking-wider">
          Location
        </span>
        <h4 className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-1">
          위치 & 운영시간
        </h4>

        <div className="mt-4 space-y-3 text-sm text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80">
          <div className="flex items-start gap-3">
            <span className="text-lg">📍</span>
            <div>
              <p className="font-medium text-[#1D1D1F] dark:text-white">경기도 화성시 동탄영천로 131, 11층 1114호(영천동, 동탄코너원스마트타워)</p>
              <p className="text-xs text-[#1D1D1F]/50 dark:text-[#F5F5F7]/50 mt-0.5">Republic of Korea</p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2 border-t border-[#1D1D1F]/5 dark:border-white/5">
            <span className="text-lg">⏰</span>
            <div>
              <p className="font-medium text-[#1D1D1F] dark:text-white">월 - 금 : 10:00 AM - 07:00 PM</p>
              <p className="text-xs text-[#1D1D1F]/50 dark:text-[#F5F5F7]/50 mt-0.5">주말 및 공휴일 휴무 (이메일 상시 접수)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Channels */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 md:p-8 shadow-sm border border-[#1D1D1F]/5 dark:border-white/10 transition-colors duration-300">
        <span className="text-xs font-semibold text-[#0066CC] uppercase tracking-wider">
          Connect With Us
        </span>
        <h4 className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-1 mb-4">
          소셜 채널
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "Behance", url: "https://behance.net", desc: "Design Case Studies" },
            { name: "Dribbble", url: "https://dribbble.com", desc: "Visual Shot & WIP" },
            { name: "LinkedIn", url: "https://linkedin.com", desc: "Professional Profile" },
            { name: "Instagram", url: "https://instagram.com", desc: "Daily & Culture" },
          ].map((channel) => (
            <a
              key={channel.name}
              href={channel.url}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl bg-[#F2F2F7] dark:bg-[#252528] border border-[#1D1D1F]/15 dark:border-[#F5F5F7]/20 hover:border-[#0066CC]/60 dark:hover:border-[#0066CC]/70 transition-all group"
            >
              <p className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0066CC] dark:group-hover:text-[#0066CC] transition-colors">
                {channel.name} ↗
              </p>
              <p className="text-[11px] text-[#1D1D1F]/50 dark:text-[#F5F5F7]/50 mt-0.5">
                {channel.desc}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
