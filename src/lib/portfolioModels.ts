import fs from "node:fs";
import path from "node:path";

export function getProjectModelPath(folderName: string): string | null {
  const dirPath = path.join(process.cwd(), "public", "images", "portfolio", folderName);
  if (!fs.existsSync(dirPath)) return null;
  const files = fs.readdirSync(dirPath).filter((file) =>
    !file.startsWith(".") && /\.glb$/i.test(file) && !/(?:^|[_ .-])(?:bak|backup)(?:[_ .-]|$)/i.test(file)
  ).sort();
  const glbFile = files.includes(`${folderName}.glb`) ? `${folderName}.glb` : files[0];
  if (!glbFile) return null;
  return `/images/portfolio/${folderName}/${glbFile}`;
}
