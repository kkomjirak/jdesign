"use server";

import { Resend } from "resend";

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
  selectedTypes: string[];
  selectedBudget: string;
}

export async function sendContactEmail(data: ContactFormData) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: "RESEND_API_KEY가 설정되지 않았습니다. 프로젝트 루트의 .env.local 파일에 RESEND_API_KEY를 설정해 주세요.",
      };
    }

    const resend = new Resend(apiKey);
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || "sonstick@gmail.com";

    const { name, email, company, message, selectedTypes, selectedBudget } = data;

    const emailContent = `
📩 [jdesign studio - 새로운 문의가 접수되었습니다]

👤 1. 성함 / 담당자명: ${name}
📧 2. 이메일 주소: ${email}
🏢 3. 회사명 / 브랜드명: ${company && company.trim() !== "" ? company : "미입력"}

🛠️ 4. 관심 서비스 분야: ${selectedTypes.length > 0 ? selectedTypes.join(", ") : "선택 없음"}
💰 5. 예상 예산 범위: ${selectedBudget || "선택 없음"}

📝 6. 프로젝트 상세 설명 및 요청사항:
--------------------------------------------------
${message}
--------------------------------------------------
`;

    const { data: resData, error } = await resend.emails.send({
      from: "jdesign Studio <onboarding@resend.dev>",
      to: [receiverEmail],
      replyTo: email,
      subject: `[jdesign 문의] ${name}님의 프로젝트 문의입니다.`,
      text: emailContent,
    });

    if (error) {
      console.error("Resend API Send Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: resData?.id };
  } catch (err: unknown) {
    console.error("Server Action Exception:", err);
    const errorMessage = err instanceof Error ? err.message : "이메일 발송 중 예기치 못한 오류가 발생했습니다.";
    return { success: false, error: errorMessage };
  }
}
