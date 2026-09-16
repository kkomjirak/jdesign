import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import portfolioData from "../../../../public/images/portfolio/portfolio_data.json";
import DetailGalleryView, { DetailImageMeta } from "@/components/portfolio/DetailGalleryView";
import { getAssetPath } from "@/lib/basePath";

interface PortfolioItem {
  id: string;
  folder: string;
  title: string;
  category: string;
  image: string;
  description?: string;
}

function getPngDimensions(filePath: string): { width: number; height: number } | null {
  try {
    const buffer = Buffer.alloc(24);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, buffer, 0, 24, 0);
    fs.closeSync(fd);
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }
  } catch (e) {
    // fallback
  }
  return null;
}

function getProjectDetailImages(folderName: string): DetailImageMeta[] {
  const dirPath = path.join(process.cwd(), "public", "images", "portfolio", folderName);
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath);

  const imageFiles = files
    .filter((f) => !f.startsWith(".") && !f.includes("thumbs") && /\.(png|jpe?g|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  return imageFiles.map((file) => {
    const fullPath = path.join(dirPath, file);
    const dims = getPngDimensions(fullPath) || { width: 1024, height: 768 };
    const ratio = Number((dims.width / dims.height).toFixed(2));
    return {
      src: `/images/portfolio/${folderName}/${file}`,
      filename: file,
      width: dims.width,
      height: dims.height,
      ratio,
    };
  });
}

export async function generateStaticParams() {
  return (portfolioData as PortfolioItem[]).map((item) => ({
    id: item.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = (portfolioData as PortfolioItem[]).find((p) => p.id === resolvedParams.id);
  if (!project) return { title: "Project Not Found - jiD design studio" };

  return {
    title: `${project.title} - jiD design studio`,
    description: `${project.title} 제품 디자인 포트폴리오 상세 페이지입니다.`,
  };
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const projects = portfolioData as PortfolioItem[];
  const currentIndex = projects.findIndex((p) => p.id === resolvedParams.id);

  if (currentIndex === -1) {
    notFound();
  }

  const project = projects[currentIndex];
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  const folderName = project.folder || project.id;
  const detailImages = getProjectDetailImages(folderName);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] dark:bg-[#111111] transition-colors duration-300 py-12 md:py-20 px-4 md:px-8">
      <div className="max-w-[1024px] mx-auto w-full">
        
        {/* Top Back Navigation */}
        <div className="mb-8 md:mb-12">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 hover:text-[#0066CC] dark:hover:text-[#0066CC] transition-colors"
          >
            <span>←</span>
            <span>포트폴리오 목록으로 돌아가기</span>
          </Link>
        </div>

        {/* Title Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0066CC]">
            {project.category || "Product Design"}
          </span>
          <h1 className="text-3xl md:text-5xl font-[300] tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mt-2 leading-tight font-product">
            {project.title}
          </h1>
          <p className="mt-4 text-sm md:text-base text-[#1D1D1F]/60 dark:text-[#F5F5F7]/60 max-w-xl mx-auto">
            {project.description || "jdesign의 디테일과 심미성이 담긴 산업/의료/제품 디자인 포트폴리오입니다."}
          </p>
        </div>

        {/* Main Product Thumbnail Display */}
        <div className="w-full max-w-[768px] mx-auto aspect-square rounded-[5px] overflow-hidden flex items-center justify-center bg-[#ffffff]">
          <img
            src={getAssetPath(project.image)}
            alt={project.title}
            className="w-full h-full object-contain bg-[#ffffff] rounded-[5px]"
          />
        </div>

        {/* Detail Images Showcase */}
        <DetailGalleryView images={detailImages} projectTitle={project.title} />

        {/* CTA Banner */}
        <div className="mt-16 md:mt-24 p-8 md:p-12 rounded-[5px] bg-white dark:bg-[#1C1C1E] border border-[#1D1D1F]/5 dark:border-white/10 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
          <h3 className="text-xl md:text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
            이 프로젝트에 대해 궁금하신가요?
          </h3>
          <p className="text-sm text-[#1D1D1F]/60 dark:text-[#F5F5F7]/60 max-w-md">
            유사한 디자인 프로젝트 구상이나 제품 개발 협업에 대해 편리하게 문의해 보세요.
          </p>
          <Link
            href="/contact"
            className="mt-2 px-8 py-3.5 rounded-full bg-[#0066CC] hover:bg-[#0055B3] text-white font-medium text-sm transition-all shadow-sm hover:shadow"
          >
            프로젝트 문의하기 ➔
          </Link>
        </div>

        {/* Bottom Prev / Next Navigation */}
        <div className="mt-12 pt-8 border-t border-[#1D1D1F]/10 dark:border-[#F5F5F7]/10 flex justify-between items-center text-sm font-medium">
          {prevProject ? (
            <Link
              href={`/portfolio/${prevProject.id}`}
              className="flex flex-col items-start group hover:text-[#0066CC] transition-colors"
            >
              <span className="text-xs text-[#1D1D1F]/40 dark:text-[#F5F5F7]/40 mb-1">← 이전 프로젝트</span>
              <span className="text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0066CC] transition-colors truncate max-w-[200px] md:max-w-[300px]">
                {prevProject.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {nextProject && (
            <Link
              href={`/portfolio/${nextProject.id}`}
              className="flex flex-col items-end text-right group hover:text-[#0066CC] transition-colors"
            >
              <span className="text-xs text-[#1D1D1F]/40 dark:text-[#F5F5F7]/40 mb-1">다음 프로젝트 →</span>
              <span className="text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0066CC] transition-colors truncate max-w-[200px] md:max-w-[300px]">
                {nextProject.title}
              </span>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
