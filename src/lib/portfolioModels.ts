import fs from "node:fs";
import path from "node:path";

// Explicitly opt projects into the supplied web-ready assets. Never fall back to
// legacy portfolio GLBs: those originals may be edited independently.
const projectModelFiles: Readonly<Record<string, string>> = {
  jd001: "jd001_web.glb",
  jd003: "jd003_web.glb",
  jd005_a: "jd005_a_web.glb",
  jd005_b: "jd005_b_web.glb",
  jd006: "jd006_web.glb",
  jd008_b: "jd008_b_web.glb",
  jd008_c: "jd008_c_web.glb",
  jd020: "jd020_web.glb",
  jd026: "jd026_web.glb",
  jd027: "jd027_web.glb",
  jd030: "jd030_web.glb",
};

export function getProjectModelPath(folderName: string): string | null {
  if (!Object.hasOwn(projectModelFiles, folderName)) return null;
  const modelFile = projectModelFiles[folderName];
  const assetPath = path.join(process.cwd(), "public", "images", "glb", modelFile);
  return fs.existsSync(assetPath) ? `/images/glb/${modelFile}` : null;
}
