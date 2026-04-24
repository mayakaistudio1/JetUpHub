import fs from "fs";
import path from "path";
import { objectStorageClient } from "../server/replit_integrations/object_storage";

const PRIVATE_DIR = process.env.PRIVATE_OBJECT_DIR;
if (!PRIVATE_DIR) {
  console.error("PRIVATE_OBJECT_DIR not set");
  process.exit(1);
}

const parts = PRIVATE_DIR.replace(/^\/+/, "").split("/");
const bucketName = parts[0];
const prefix = parts.slice(1).join("/");

const FILES: Array<{ src: string; dest: string }> = [
  { src: "attached_assets/DE0B6EF4-FCA2-5DD3-4C8E-FDA46438F73A_1776874556734.mp4", dest: "presentation/de/intro.mp4" },
  { src: "attached_assets/JetUP_Deep-Dive_-_Investor_&_Technik_(v2)_1080p_(1)_1776872570843.mp4", dest: "presentation/de/investor.mp4" },
  { src: "attached_assets/JetUP_Deep-Dive_-_Marketing-Plan_&_Wachstum_(v2)_1080p_(1)_1776872566090.mp4", dest: "presentation/de/partner.mp4" },
  { src: "attached_assets/JetUP_Deep-Dive_-_Die_Komplettlösung_(v2)_1080p_(1)_1776872531263.mp4", dest: "presentation/de/both.mp4" },
  { src: "attached_assets/JetUP_Interactive_-_Intro_-_ru_1776976263754.mp4", dest: "presentation/ru/intro.mp4" },
  { src: "attached_assets/48F93933-C765-9A7C-F90F-AFB41F33F80B_1776978945551.mp4", dest: "presentation/ru/investor.mp4" },
  { src: "attached_assets/штеукфсешму_-_Marketing-ru_1776976426006.mp4", dest: "presentation/ru/partner.mp4" },
  { src: "attached_assets/JetUP_Deep-Dive_-_kombination_-_ru_1080p_1776976368097.mp4", dest: "presentation/ru/both.mp4" },
  { src: "attached_assets/en-videos/intro.mp4", dest: "presentation/en/intro.mp4" },
  { src: "attached_assets/en-videos/investor.mp4", dest: "presentation/en/investor.mp4" },
  { src: "attached_assets/en-videos/partner.mp4", dest: "presentation/en/partner.mp4" },
  { src: "attached_assets/en-videos/both.mp4", dest: "presentation/en/both.mp4" },
];

async function main() {
  const bucket = objectStorageClient.bucket(bucketName);
  for (const { src, dest } of FILES) {
    const objectName = `${prefix}/${dest}`;
    const buffer = fs.readFileSync(src);
    const sizeMb = (buffer.length / 1024 / 1024).toFixed(1);
    console.log(`Uploading ${src} (${sizeMb} MB) -> ${bucketName}/${objectName}`);
    await bucket.file(objectName).save(buffer, {
      contentType: "video/mp4",
      metadata: { cacheControl: "public, max-age=86400" },
      resumable: false,
    });
    console.log(`  ✓ done`);
  }
  console.log("All uploads complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
