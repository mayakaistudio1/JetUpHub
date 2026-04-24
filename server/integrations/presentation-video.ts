import type { Express, Request, Response } from "express";
import { objectStorageClient } from "../replit_integrations/object_storage";
import { PRESENTATION_GRAPH, type PresentationLang } from "@shared/presentationGraph";

const PRIVATE_DIR = process.env.PRIVATE_OBJECT_DIR || "";

function parseBucketAndPrefix(): { bucketName: string; prefix: string } {
  if (!PRIVATE_DIR) throw new Error("PRIVATE_OBJECT_DIR not set");
  const parts = PRIVATE_DIR.replace(/^\/+/, "").split("/");
  return { bucketName: parts[0], prefix: parts.slice(1).join("/") };
}

function resolveSceneObjectName(sceneId: string, lang: PresentationLang): string | null {
  const scene = PRESENTATION_GRAPH[sceneId];
  if (!scene) return null;
  const key = scene.videoKey[lang] || scene.videoKey.de;
  if (!key) return null;
  const { prefix } = parseBucketAndPrefix();
  return `${prefix}/presentation/${lang in scene.videoKey ? lang : "de"}/${key}.mp4`;
}

export function registerPresentationVideoRoutes(app: Express) {
  app.get("/api/presentation/scene/:id/video", async (req: Request, res: Response) => {
    try {
      const sceneId = req.params.id;
      const langParam = (req.query.lang as string) || "de";
      const lang: PresentationLang = (["de", "ru", "en"] as const).includes(langParam as PresentationLang)
        ? (langParam as PresentationLang)
        : "de";

      const objectName = resolveSceneObjectName(sceneId, lang);
      if (!objectName) {
        return res.status(404).json({ error: "Scene not found" });
      }
      const { bucketName } = parseBucketAndPrefix();
      const file = objectStorageClient.bucket(bucketName).file(objectName);
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ error: "Video not found" });
      }

      const [metadata] = await file.getMetadata();
      const totalSize = Number(metadata.size || 0);
      const range = req.headers.range;

      res.set({
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=86400",
        "Accept-Ranges": "bytes",
      });

      if (range && totalSize > 0) {
        const match = /bytes=(\d*)-(\d*)/.exec(range);
        if (match) {
          const start = match[1] ? parseInt(match[1], 10) : 0;
          const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;
          if (start >= totalSize || end >= totalSize || start > end) {
            res.status(416).set("Content-Range", `bytes */${totalSize}`).end();
            return;
          }
          res.status(206).set({
            "Content-Range": `bytes ${start}-${end}/${totalSize}`,
            "Content-Length": end - start + 1,
          });
          const stream = file.createReadStream({ start, end });
          stream.on("error", (err) => {
            console.error("[presentation] stream error:", err);
            if (!res.headersSent) res.status(500).end();
          });
          stream.pipe(res);
          return;
        }
      }

      res.set("Content-Length", String(totalSize));
      const stream = file.createReadStream();
      stream.on("error", (err) => {
        console.error("[presentation] stream error:", err);
        if (!res.headersSent) res.status(500).end();
      });
      stream.pipe(res);
    } catch (err) {
      console.error("[presentation] route error:", err);
      if (!res.headersSent) res.status(500).json({ error: "Internal error" });
    }
  });
}
