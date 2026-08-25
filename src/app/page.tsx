import Hero from "@/components/home/Hero";
import PromoGrid from "@/components/home/PromoGrid";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7]">
      {/* 1. Hero Section (Scroll-jacking) */}
      <Hero />
      
      {/* 2. Promo Grid Section */}
      <div className="bg-[#FFFFFF] dark:bg-[#000000] transition-colors duration-300">
        <PromoGrid />
      </div>
    </div>
  );
}
