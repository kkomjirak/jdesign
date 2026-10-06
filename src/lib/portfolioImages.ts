import fs from "node:fs";
import path from "node:path";
import type { DetailImageMeta } from "@/components/portfolio/DetailGalleryView";

function imageDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length >= 24 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer.length >= 30 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    const type = buffer.toString("ascii", 12, 16);
    if (type === "VP8X") return { width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1 };
    if (type === "VP8 ") return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    if (type === "VP8L") return {
      width: 1 + buffer[21] + ((buffer[22] & 0x3f) << 8),
      height: 1 + (buffer[22] >> 6) + (buffer[23] << 2) + ((buffer[24] & 0x0f) << 10),
    };
  }
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 4 <= buffer.length) {
      if (buffer[offset] !== 0xff) break;
      while (buffer[offset] === 0xff) offset++;
      const marker = buffer[offset++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > buffer.length) break;
      const length = buffer.readUInt16BE(offset);
      if (length < 2 || offset + length > buffer.length) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker) && length >= 7) {
        return { width: buffer.readUInt16BE(offset + 5), height: buffer.readUInt16BE(offset + 3) };
      }
      offset += length;
    }
  }
  return null;
}

function readDimensions(filePath: string) {
  let descriptor: number | undefined;
  try {
    descriptor = fs.openSync(filePath, "r");
    // Headers only: avoid reading large originals into each static-build worker.
    const buffer = Buffer.alloc(128 * 1024);
    const bytesRead = fs.readSync(descriptor, buffer, 0, buffer.length, 0);
    const dimensions = imageDimensions(buffer.subarray(0, bytesRead));
    if (dimensions && dimensions.width > 0 && dimensions.height > 0) return dimensions;
  } catch {
    // A missing/unsupported header retains the gallery's existing safe fallback.
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
  return { width: 1024, height: 768 };
}

export function getProjectDetailImages(folderName: string): DetailImageMeta[] {
  if (!/^jd\d{3}(?:_[a-z]+)?$/.test(folderName)) return [];
  const directory = path.join(process.cwd(), "public/images/portfolio", folderName);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter((file) => !file.startsWith(".") && !file.includes("thumbs") && /\.(png|jpe?g|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((filename) => {
      const derivative = `/images/portfolio/optimized/${folderName}/${path.parse(filename).name}.webp`;
      const src = fs.existsSync(path.join(process.cwd(), "public", derivative)) ? derivative : `/images/portfolio/${folderName}/${filename}`;
      const dimensions = readDimensions(path.join(process.cwd(), "public", src));
      return { src, filename, ...dimensions, ratio: Number((dimensions.width / dimensions.height).toFixed(2)) };
    });
}
