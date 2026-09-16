"use client";

import { useState } from "react";
import { getAssetPath } from "@/lib/basePath";

export interface DetailImageMeta {
  src: string;
  filename: string;
  width: number;
  height: number;
  ratio: number;
}

interface DetailGalleryViewProps {
  images: DetailImageMeta[];
  projectTitle: string;
}

interface ImageGroup {
  type: "grid_2" | "full";
  items: DetailImageMeta[];
}

// Group images into layout blocks (2-column side-by-side or 1-column full width)
function buildLayoutGroups(images: DetailImageMeta[]): ImageGroup[] {
  const groups: ImageGroup[] = [];
  let i = 0;
  const n = images.length;

  while (i < n) {
    const curr = images[i];
    if (i + 1 < n) {
      const nxt = images[i + 1];
      const bothTall = curr.ratio < 1.15 && nxt.ratio < 1.15;
      const bothWide = curr.ratio >= 1.2 && nxt.ratio >= 1.2;
      const bothSimilar = Math.abs(curr.ratio - nxt.ratio) < 0.35;

      if (bothTall || bothWide || bothSimilar) {
        groups.push({
          type: "grid_2",
          items: [curr, nxt],
        });
        i += 2;
        continue;
      }
    }

    groups.push({
      type: "full",
      items: [curr],
    });
    i += 1;
  }

  return groups;
}

export default function DetailGalleryView({ images, projectTitle }: DetailGalleryViewProps) {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return null;
  }

  const groups = buildLayoutGroups(images);

  const openModal = (src: string) => {
    const idx = images.findIndex((img) => img.src === src);
    if (idx !== -1) setActiveModalIndex(idx);
  };

  const closeModal = () => setActiveModalIndex(null);

  const prevModal = () => {
    if (activeModalIndex === null) return;
    setActiveModalIndex((activeModalIndex - 1 + images.length) % images.length);
  };

  const nextModal = () => {
    if (activeModalIndex === null) return;
    setActiveModalIndex((activeModalIndex + 1) % images.length);
  };

  return (
    <div className="w-full mt-16 md:mt-24">
      {/* Visual Section Header */}
      <div className="flex flex-col items-center text-center mb-10 md:mb-14 pt-10 border-t border-[#1D1D1F]/10 dark:border-[#F5F5F7]/10">
        <h2 className="text-2xl md:text-4xl font-[300] tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] font-product">
          프로젝트 상세 시안
        </h2>
        <p className="mt-2 text-xs md:text-sm text-[#1D1D1F]/60 dark:text-[#F5F5F7]/60">
          총 {images.length}개의 상세 디자인 시안이 등록되어 있습니다. (이미지 클릭 시 크게 보기)
        </p>
      </div>

      {/* Dynamic Gallery Groups */}
      <div className="space-y-6 md:space-y-8">
        {groups.map((group, groupIdx) => {
          if (group.type === "grid_2") {
            return (
              <div key={groupIdx} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
                {group.items.map((img) => (
                  <div
                    key={img.src}
                    onClick={() => openModal(img.src)}
                    className="group relative w-full rounded-[5px] overflow-hidden flex items-center justify-center cursor-pointer bg-[#ffffff]"
                  >
                    <img
                      src={getAssetPath(img.src)}
                      alt={`${projectTitle} 상세 이미지`}
                      className="w-full h-auto object-contain rounded-[5px] transition-transform duration-500 group-hover:scale-[1.01] bg-[#ffffff]"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            );
          }

          // Full width single image
          const singleImg = group.items[0];
          return (
            <div
              key={groupIdx}
              onClick={() => openModal(singleImg.src)}
              className="group relative w-full rounded-[5px] overflow-hidden flex items-center justify-center cursor-pointer bg-[#ffffff]"
            >
              <img
                src={getAssetPath(singleImg.src)}
                alt={`${projectTitle} 상세 이미지`}
                className="w-full h-auto object-contain rounded-[5px] transition-transform duration-500 group-hover:scale-[1.01] bg-[#ffffff]"
                loading="lazy"
              />
            </div>
          );
        })}
      </div>

      {/* Full-screen Lightbox Modal */}
      {activeModalIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 transition-opacity duration-300"
          onClick={closeModal}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md transition-colors"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevModal();
                }}
                className="absolute left-4 md:left-8 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-colors"
                aria-label="이전 이미지"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextModal();
                }}
                className="absolute right-4 md:right-8 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-colors"
                aria-label="다음 이미지"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Container */}
          <div
            className="relative max-w-[95vw] max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getAssetPath(images[activeModalIndex].src)}
              alt={`${projectTitle} 상세 확대 시안`}
              className="max-w-full max-h-[82vh] object-contain rounded-[5px] shadow-2xl bg-[#ffffff]"
            />
            <div className="mt-3 text-xs md:text-sm text-white/60 font-medium tracking-wide">
              {activeModalIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
