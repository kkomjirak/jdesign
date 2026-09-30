import fs from "node:fs";
import path from "node:path";
import Hero from "@/components/home/Hero";
import PromoGrid from "@/components/home/PromoGrid";
import portfolioData from "../../public/images/portfolio/portfolio_data.json";

const featuredIds = ["jd003", "jd005_a", "jd026", "jd030"];

export default function Home() {
  // Resolve assets at build time: never ship filesystem access to the browser.
  const projects = featuredIds.flatMap((id) => {
    const project = portfolioData.find((item) => item.id === id);
    if (!project) return [];
    const modelFile = path.join(process.cwd(), "public", "images", "portfolio", project.folder, `${project.folder}.glb`);
    return fs.existsSync(modelFile) ? [project] : [];
  });

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Hero />
      <div className="bg-[#FFFFFF] dark:bg-[#000000] transition-colors duration-300">
        <PromoGrid projects={projects} />
      </div>
    </div>
  );
}
