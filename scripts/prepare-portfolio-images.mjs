import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

// Display derivatives only. Never overwrite any supplied original.
const root = path.join(process.cwd(), "public/images/portfolio");
const rows = [];
for (let number = 37; number <= 45; number++) {
  const id = `jd${String(number).padStart(3, "0")}`;
  const directory = path.join(root, id);
  const target = path.join(root, "optimized", id);
  await fs.mkdir(target, { recursive: true });
  for (const filename of (await fs.readdir(directory)).sort()) {
    if (filename.startsWith(".") || !/\.(png|jpe?g)$/i.test(filename)) continue;
    // Keep the eleven small sequence frames byte-for-byte at their exact URLs.
    if (id === "jd038" && /^jd038_(?:[2-9]|1[0-2])\.jpg$/.test(filename)) continue;
    const input = path.join(directory, filename);
    const output = path.join(target, `${path.parse(filename).name}.webp`);
    const original = await fs.readFile(input);
    const hash = crypto.createHash("sha256").update(original).digest("hex");
    const metadata = await sharp(input, { limitInputPixels: 250_000_000 }).metadata();
    const maximum = filename.includes("thumbs") ? 1024 : 2048;
    const result = await sharp(input, { limitInputPixels: 250_000_000 })
      .rotate().resize({ width: maximum, height: maximum, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90, effort: 5 }).toFile(output);
    if (crypto.createHash("sha256").update(await fs.readFile(input)).digest("hex") !== hash) throw new Error(`Source changed: ${input}`);
    rows.push({ source: path.relative(process.cwd(), input), output: path.relative(process.cwd(), output), sourceSha256: hash, sourceBytes: original.length, width: metadata.width, height: metadata.height, displayWidth: result.width, displayHeight: result.height, displayBytes: result.size });
  }
}
await fs.writeFile(path.join(root, "optimized", "manifest.json"), `${JSON.stringify(rows, null, 2)}\n`);
console.log(JSON.stringify({ images: rows.length, sourceBytes: rows.reduce((total, row) => total + row.sourceBytes, 0), displayBytes: rows.reduce((total, row) => total + row.displayBytes, 0), largestSourcePixels: Math.max(...rows.map((row) => row.width * row.height)) }));
