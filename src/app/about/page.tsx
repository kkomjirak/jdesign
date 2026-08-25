export const metadata = {
  title: "About Us - jiD design studio",
  description: "About jiD design studio",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] dark:bg-[#111111]">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
          About Us
        </h1>
        <p className="mt-6 text-lg text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 max-w-xl leading-relaxed">
          이곳은 About Us 페이지입니다.<br />
          추후 회사 소개 내용이나 연혁 등으로 채워질 예비 공간입니다.
        </p>
      </div>
    </div>
  );
}
