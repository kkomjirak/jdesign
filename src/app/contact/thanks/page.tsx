import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_RECEIVER_EMAIL } from "@/app/actions/contact";

export const metadata: Metadata = {
  title: "문의 전송 후 안내 | JiD",
  robots: { index: false, follow: true },
};

export default function ContactThanksPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#111111] py-24 px-4 md:px-8">
      <section className="max-w-[800px] mx-auto rounded-[5px] bg-white dark:bg-[#1C1C1E] p-6 md:p-10 shadow-sm border border-[#1D1D1F]/5 dark:border-white/10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
          문의 전송 후 안내
        </h1>
        <div className="mt-6 space-y-4 text-sm md:text-base leading-relaxed text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70">
          <p>문의해 주셔서 감사합니다. FormSubmit에서 CAPTCHA 확인과 전송 절차를 마쳤다면 문의 내용이 이메일로 전달되도록 처리됩니다.</p>
          <p>이 페이지는 메일함 도착을 확인하는 수신 확인증이 아닙니다. 실제 수신 여부는 여기서 확인할 수 없습니다.</p>
          <p>
            전송 과정에서 오류가 있었거나 답변을 받지 못하셨다면{" "}
            <a href={`mailto:${CONTACT_RECEIVER_EMAIL}`} className="text-[#0066CC] underline">{CONTACT_RECEIVER_EMAIL}</a>로 직접 문의해 주세요.
          </p>
        </div>
        <Link href="/contact/" className="inline-block mt-8 px-6 py-3 rounded-[5px] bg-[#0066CC] hover:bg-[#0055B3] text-white text-sm font-medium transition-colors">
          새 문의 작성하기
        </Link>
      </section>
    </div>
  );
}
