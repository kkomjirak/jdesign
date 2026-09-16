export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
  selectedTypes: string[];
  selectedBudget: string;
}

export const CONTACT_RECEIVER_EMAIL = "yoksk7@naver.com";

export function formatContactContent(data: ContactFormData): string {
  const { name, email, company, message, selectedTypes, selectedBudget } = data;
  return `📩 [jdesign studio - 프로젝트 문의 내용]

👤 1. 성함 / 담당자명: ${name}
📧 2. 이메일 주소: ${email}
🏢 3. 회사명 / 브랜드명: ${company && company.trim() !== "" ? company : "미입력"}

🛠️ 4. 관심 서비스 분야: ${selectedTypes.length > 0 ? selectedTypes.join(", ") : "선택 없음"}
💰 5. 예상 예산 범위: ${selectedBudget || "선택 없음"}

📝 6. 프로젝트 상세 설명 및 요청사항:
--------------------------------------------------
${message}
--------------------------------------------------`;
}

export function createMailtoLink(data: ContactFormData): string {
  const subject = `[jdesign 문의] ${data.name}님의 프로젝트 문의입니다.`;
  const body = formatContactContent(data);
  return `mailto:${CONTACT_RECEIVER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
