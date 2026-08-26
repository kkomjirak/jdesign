"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import Link from "next/link";

import portfolioData from "../../../public/images/portfolio/portfolio_data.json";

interface PortfolioItem {
  id: string;
  folder: string;
  title: string;
  category: string;
  image: string;
  description?: string;
}

const allProducts: PortfolioItem[] = portfolioData as PortfolioItem[];

const tabs = ["모든 프로젝트", "Product", "UX/UI"];

const getTabCount = (tabName: string) => {
  if (tabName === "모든 프로젝트") return allProducts.length;
  return allProducts.filter((product) => product.category === tabName).length;
};

export default function PortfolioGrid() {
  const [activeTab, setActiveTab] = useState("모든 프로젝트");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const gridRef = useRef<HTMLDivElement>(null);

  // 탭 필터링
  const filteredProducts = allProducts.filter((product) =>
    activeTab === "모든 프로젝트" ? true : product.category === activeTab
  );

  // 페이징 계산
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 탭이나 페이지 변경 시 카드 애니메이션
  useGSAP(() => {
    if (!gridRef.current) return;
    
    gsap.fromTo(
      gridRef.current.children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.03, ease: "power2.out" }
    );
  }, [activeTab, currentPage]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // 탭 변경 시 1페이지로 리셋
  };

  return (
    <section className="w-full bg-[#F5F5F7] dark:bg-[#111111] py-16 md:py-24 px-4 md:px-8 min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        
        {/* 상단 탭 메뉴 */}
        <div className="flex justify-center mb-12">
          <div className="bg-[#E5E5EA] dark:bg-[#2C2C2E] p-1 rounded-full flex gap-1">
            {tabs.map((tab) => {
              const count = getTabCount(tab);
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-5 py-2 rounded-full text-[14px] font-medium transition-colors duration-300 ${
                    activeTab === tab
                      ? "bg-[#1D1D1F] text-white dark:bg-white dark:text-black"
                      : "text-[#1D1D1F] hover:bg-gray-300 dark:text-[#F5F5F7] dark:hover:bg-gray-600"
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 4열 그리드 (가로 간격 24px, 세로 간격 48px) */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-[24px] gap-y-[48px]">
          {currentProducts.map((product) => (
            <Link 
              key={product.id} 
              href={`/portfolio/${product.id}`}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              
              {/* 상단 이미지 카드 (테두리 제거, 5px radius, white 배경) */}
              <div className="w-full aspect-square rounded-[5px] overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.02] bg-[#ffffff]">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-full object-contain bg-[#ffffff] rounded-[5px]"
                />
              </div>

              {/* 텍스트 영역 (타이틀만 표시) */}
              <h3 className="mt-3.5 text-[21px] font-[300] text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight group-hover:text-[#0066CC] transition-colors duration-300 font-product">
                {product.title}
              </h3>
              
            </Link>
          ))}
        </div>

        {/* 페이징 컨트롤 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-20">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#1D1D1F] dark:text-white disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              이전
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentPage === idx + 1
                      ? "bg-[#1D1D1F] text-white dark:bg-white dark:text-black"
                      : "text-[#1D1D1F] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-800"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.max(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#1D1D1F] dark:text-white disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
