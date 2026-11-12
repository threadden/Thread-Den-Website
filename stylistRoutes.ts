/**
 * AI Stylist – Customer Miniature + Virtual Try-On routes
 * ------------------------------------------------------
 * 1. POST /api/stylist/create-miniature
 *      Customer photo  ──►  Gemini image model  ──►  collectible chibi figurine of THAT customer
 *      (style matched to the reference doll in /public/assets/aistudio/image_aa6d36c7.png)
 *
 * 2. POST /api/stylist/try-on
 *      Customer miniature + product photo + chosen colour/size  ──►  the same miniature wearing the article
 *
 * 3. POST /api/stylist/analyze-fit
 *      Looks at the dressed miniature (when available) and gives an honest "does it suit you" verdict.
 *
 * IMAGE ENGINES (picked automatically, or force with IMAGE_PROVIDER=cloudflare | gemini):
 *  - Cloudflare Workers AI, FLUX.2 Klein  (FREE: ~80 images/day, no credit card)
 *      needs CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN. Model: CLOUDFLARE_IMAGE_MODEL
 *      (default @cf/black-forest-labs/flux-2-klein-4b; flux-2-klein-9b = better quality, ~6 free/day)
 *  - Google Gemini image models (PAID, best likeness) – needs GEMINI_API_KEY with billing.
 *      GEMINI_IMAGE_MODEL overrides the model; falls back through IMAGE_MODEL_FALLBACKS.
 * The text parts (feature reading, fit verdict) use Gemini text models, which have a free tier.
 */
import type { Express, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { Jimp } from "jimp";
import fs from "fs";
import path from "path";

type GetClient = () => GoogleGenAI | null;

const IMAGE_MODEL_FALLBACKS = ["gemini-3.1-flash-image", "gemini-nano-banana-2.1", "gemini-3-pro-image"];
const TEXT_MODELS = Array.from(
  new Set([process.env.GEMINI_TEXT_MODEL?.trim(), "gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"].filter(Boolean) as string[])
);

function extractJson(text: string): any {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Model did not return JSON");
  }
}

async function geminiJson(client: GoogleGenAI, parts: any[]): Promise<any> {
  let lastErr: any;
  for (const model of TEXT_MODELS) {
    try {
      const r = await client.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: { responseMimeType: "application/json" },
      });
      if (!r.text) throw new Error("empty response");
      const out = extractJson(r.text);
      lastRuns.text = { ok: true, engine: "gemini", model, at: new Date().toISOString() };
      return out;
    } catch (e: any) {
      lastErr = e;
      const msg = cleanGeminiError(e);
      lastRuns.text = { ok: false, engine: "gemini", model, error: msg, at: new Date().toISOString() };
      console.warn(`[stylist] text model ${model} failed:`, msg);
      // Billing / free-tier / key problems affect every model: stop trying.
      if (/free tier|billing|API key|permission|project/i.test(msg)) break;
    }
  }
  throw lastErr;
}

/** Free vision+text model on Cloudflare Workers AI (default Llama 4 Scout). */
async function cloudflareJson(parts: any[]): Promise<any> {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  const base = process.env.CLOUDFLARE_API_BASE?.trim() || "https://api.cloudflare.com/client/v4";
  const model = process.env.CLOUDFLARE_TEXT_MODEL?.trim() || "@cf/meta/llama-4-scout-17b-16e-instruct";
  const content: any[] = [];
  for (const p of parts) {
    if (p.text) content.push({ type: "text", text: p.text });
    else if (p.inlineData) {
      const jpeg = await shrinkForFlux(p.inlineData, 640);
      content.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${jpeg.toString("base64")}` } });
    }
  }
  const resp = await fetch(`${base}/accounts/${account}/ai/run/${model}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: "You are a precise assistant. Reply with a single valid JSON object and nothing else." },
        { role: "user", content },
      ],
      max_tokens: 700,
      temperature: 0.3,
    }),
  });
  const body: any = await resp.json().catch(() => ({}));
  if (!resp.ok || body?.success === false) {
    const msg = body?.errors?.[0]?.message || `HTTP ${resp.status}`;
    lastRuns.text = { ok: false, engine: "cloudflare", model, error: msg, at: new Date().toISOString() };
    throw new Error(`Cloudflare text model failed: ${msg}`);
  }
  const r = body?.result?.response;
  const out = typeof r === "object" && r !== null ? r : extractJson(String(r ?? ""));
  lastRuns.text = { ok: true, engine: "cloudflare", model, at: new Date().toISOString() };
  return out;
}

/** Text/vision JSON call. Uses Cloudflare first when it is the image engine, otherwise Gemini; falls back to the other. */
async function generateJson(client: GoogleGenAI | null, parts: any[]): Promise<any> {
  const engines: ("gemini" | "cloudflare")[] =
    imageProvider() === "cloudflare" ? ["cloudflare", "gemini"] : ["gemini", "cloudflare"];
  let lastErr: any = new Error("No AI configured for text");
  for (const engine of engines) {
    try {
      if (engine === "cloudflare" && cloudflareConfigured()) return await cloudflareJson(parts);
      if (engine === "gemini" && client) return await geminiJson(client, parts);
    } catch (e) {
      lastErr = e;
      console.warn(`[stylist] ${engine} text failed:`, (e as any)?.message || e);
    }
  }
  throw lastErr;
}
const MAX_REMOTE_IMAGE_BYTES = 8 * 1024 * 1024;

function imageModels(): string[] {
  const preferred = process.env.GEMINI_IMAGE_MODEL?.trim();
  return Array.from(new Set([preferred, ...IMAGE_MODEL_FALLBACKS].filter(Boolean) as string[]));
}

interface InlineImage {
  mimeType: string;
  data: string; // base64
}

/* ------------------------------------------------------------------ */
/* Image loading helpers                                               */
/* ------------------------------------------------------------------ */

function parseDataUrl(value: string): InlineImage | null {
  const m = value.match(/^data:(image\/[A-Za-z0-9.+-]+);base64,(.+)$/s);
  return m ? { mimeType: m[1], data: m[2] } : null;
}

function mimeFromExt(file: string): string {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

/**
 * Loads an image given as a data URL, a site-relative asset path (/src/assets/..., /assets/...),
 * or an absolute http(s) URL (e.g. product photos on a CDN).
 */
async function loadImage(source: string | undefined, rootDir: string): Promise<InlineImage | null> {
  if (!source || typeof source !== "string") return null;

  if (source.startsWith("data:")) return parseDataUrl(source);

  if (source.startsWith("/")) {
    // Only serve files from the two public asset folders; never arbitrary paths.
    const clean = path.normalize(decodeURIComponent(source.split("?")[0])).replace(/^([/\\])+/, "");
    const candidates = [path.join(rootDir, "public", clean), path.join(rootDir, clean)];
    const allowedRoots = [path.join(rootDir, "public"), path.join(rootDir, "src", "assets")];
    for (const file of candidates) {
      const resolved = path.resolve(file);
      if (!allowedRoots.some((r) => resolved.startsWith(r + path.sep))) continue;
      if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
        return { mimeType: mimeFromExt(resolved), data: fs.readFileSync(resolved).toString("base64") };
      }
    }
    return null;
  }

  if (/^https?:\/\//i.test(source)) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const resp = await fetch(source, { signal: controller.signal });
      if (!resp.ok) return null;
      const type = (resp.headers.get("content-type") || "").split(";")[0].trim();
      if (!type.startsWith("image/")) return null;
      const buf = Buffer.from(await resp.arrayBuffer());
      if (buf.byteLength > MAX_REMOTE_IMAGE_BYTES) return null;
      return { mimeType: type, data: buf.toString("base64") };
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Gemini image generation                                             */
/* ------------------------------------------------------------------ */

type Part = { text: string } | { inlineData: InlineImage };

class ImageGenError extends Error {
  constructor(message: string, public readonly code: "no_key" | "blocked" | "no_image" | "api_error") {
    super(message);
  }
}

function cleanGeminiError(err: any): string {
  let msg: string = err?.message || String(err);
  try {
    const parsed = JSON.parse(msg);
    if (parsed?.error?.message) msg = parsed.error.message;
  } catch {
    /* not JSON */
  }
  return msg;
}

function isModelMissing(msg: string): boolean {
  return /not found|is not supported|unknown model|does not exist|404/i.test(msg);
}

async function generateImage(
  client: GoogleGenAI | null,
  parts: Part[],
  aspectRatio = "3:4"
): Promise<{ dataUrl: string; model: string }> {
  if (!client) {
    throw new ImageGenError("Gemini API key is not configured on the server.", "no_key");
  }

  let lastError = "";
  for (const model of imageModels()) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: { aspectRatio },
        },
      });

      const candidate = response.candidates?.[0];
      const imgPart = candidate?.content?.parts?.find((p: any) => p.inlineData?.data);
      if (imgPart?.inlineData?.data) {
        const mime = imgPart.inlineData.mimeType || "image/png";
        return { dataUrl: `data:${mime};base64,${imgPart.inlineData.data}`, model };
      }

      const reason = candidate?.finishReason || response.promptFeedback?.blockReason;
      if (reason && /SAFETY|BLOCK|PROHIBITED|IMAGE_SAFETY/i.test(String(reason))) {
        throw new ImageGenError(
          "The image model declined this photo. Try a different, clearly lit front-facing photo.",
          "blocked"
        );
      }
      lastError = response.text || "The model did not return an image.";
      // A real model answered without an image: retrying other models rarely helps, stop here.
      throw new ImageGenError(lastError, "no_image");
    } catch (err: any) {
      if (err instanceof ImageGenError) throw err;
      lastError = cleanGeminiError(err);
      if (isModelMissing(lastError)) {
        console.warn(`[stylist] image model "${model}" unavailable, trying next…`);
        continue;
      }
      throw new ImageGenError(lastError, "api_error");
    }
  }
  throw new ImageGenError(lastError || "No image model available.", "api_error");
}

/* ------------------------------------------------------------------ */
/* Cloudflare Workers AI – FLUX.2 Klein (free daily allowance)         */
/* ------------------------------------------------------------------ */

function cloudflareConfigured(): boolean {
  return Boolean(process.env.CLOUDFLARE_ACCOUNT_ID?.trim() && process.env.CLOUDFLARE_API_TOKEN?.trim());
}

function imageProvider(): "cloudflare" | "gemini" {
  const forced = (process.env.IMAGE_PROVIDER || "").trim().toLowerCase();
  if (forced === "cloudflare" || forced === "gemini") return forced;
  return cloudflareConfigured() ? "cloudflare" : "gemini";
}

/** FLUX.2 Klein requires every input image to be under 512x512. Flatten transparency onto white. */
async function shrinkForFlux(img: InlineImage, max = 511): Promise<Buffer> {
  const src = await Jimp.read(Buffer.from(img.data, "base64"));
  if (src.width > max || src.height > max) src.scaleToFit({ w: max, h: max });
  const canvas = new Jimp({ width: src.width, height: src.height, color: 0xffffffff });
  canvas.composite(src, 0, 0);
  return canvas.getBuffer("image/jpeg", { quality: 92 });
}

function sniffMime(b64: string): string {
  if (b64.startsWith("iVBOR")) return "image/png";
  if (b64.startsWith("UklGR")) return "image/webp";
  return "image/jpeg";
}

async function generateWithCloudflare(
  images: InlineImage[],
  prompt: string,
  width = 768,
  height = 1024,
  seed?: number
): Promise<{ dataUrl: string; model: string }> {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (!account || !token) {
    throw new ImageGenError("Cloudflare is selected but CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN are missing.", "no_key");
  }
  const model = process.env.CLOUDFLARE_IMAGE_MODEL?.trim() || "@cf/black-forest-labs/flux-2-klein-4b";
  const base = process.env.CLOUDFLARE_API_BASE?.trim() || "https://api.cloudflare.com/client/v4";

  const form = new FormData();
  form.append("prompt", prompt);
  form.append("width", String(width));
  form.append("height", String(height));
  if (seed !== undefined) form.append("seed", String(seed));
  const inputs = images.slice(0, 4); // model accepts at most 4 reference images
  for (let i = 0; i < inputs.length; i++) {
    const jpeg = await shrinkForFlux(inputs[i]);
    form.append(`input_image_${i}`, new Blob([new Uint8Array(jpeg)], { type: "image/jpeg" }), `image_${i}.jpg`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);
  let resp: globalThis.Response;
  try {
    resp = await fetch(`${base}/accounts/${account}/ai/run/${model}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      signal: controller.signal,
    });
  } catch (err: any) {
    throw new ImageGenError(`Could not reach Cloudflare Workers AI: ${err?.message || err}`, "api_error");
  } finally {
    clearTimeout(timer);
  }

  const type = resp.headers.get("content-type") || "";
  if (resp.ok && type.startsWith("image/")) {
    const b64 = Buffer.from(await resp.arrayBuffer()).toString("base64");
    return { dataUrl: `data:${type.split(";")[0]};base64,${b64}`, model: `cloudflare:${model}` };
  }

  const body: any = await resp.json().catch(() => ({}));
  const b64: string | undefined = body?.result?.image || body?.image;
  if (resp.ok && b64) {
    return { dataUrl: `data:${sniffMime(b64)};base64,${b64}`, model: `cloudflare:${model}` };
  }

  const apiMsg: string = body?.errors?.[0]?.message || body?.error || `HTTP ${resp.status}`;
  if (resp.status === 401 || resp.status === 403) {
    throw new ImageGenError(`Cloudflare rejected the API token (${apiMsg}). Check CLOUDFLARE_API_TOKEN has "Workers AI" permission.`, "no_key");
  }
  if (resp.status === 429 || /neuron|daily|allocation|limit/i.test(apiMsg)) {
    throw new ImageGenError("Today's free image allowance is used up. It resets at 5:30 AM IST (00:00 UTC).", "api_error");
  }
  if (/nsfw|safety|flagged/i.test(apiMsg)) {
    throw new ImageGenError("The image model declined this photo. Try a different, clearly lit front-facing photo.", "blocked");
  }
  throw new ImageGenError(`Cloudflare image generation failed: ${apiMsg}`, "api_error");
}

/** Generate with whichever engine is configured. */
async function makeImage(
  client: GoogleGenAI | null,
  job: { geminiParts: Part[]; fluxImages: InlineImage[]; fluxPrompt: string; seed?: number }
): Promise<{ dataUrl: string; model: string }> {
  if (imageProvider() === "cloudflare") {
    return generateWithCloudflare(job.fluxImages, job.fluxPrompt, 768, 1024, job.seed);
  }
  if (!client) {
    throw new ImageGenError(
      "No image AI is configured. Add CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN (free) or a paid GEMINI_API_KEY.",
      "no_key"
    );
  }
  try {
    return await generateImage(client, job.geminiParts, "3:4");
  } catch (err: any) {
    if (err instanceof ImageGenError && /quota|billing|free tier|RESOURCE_EXHAUSTED|429|paid/i.test(err.message)) {
      throw new ImageGenError(
        "Gemini image generation needs a paid (billing-enabled) key. For a free option, add CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN.",
        "no_key"
      );
    }
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Sanity check: did the AI actually make a figurine?                  */
/* ------------------------------------------------------------------ */

/**
 * Image-editing models sometimes hand the input photo back almost unchanged.
 * Returns the average pixel difference (0-255) between two images at thumbnail size.
 * A real chibi figurine on a studio backdrop differs from the photo by far more than ~20.
 */
async function imageDifference(a: InlineImage, b: InlineImage): Promise<number> {
  try {
    const [ja, jb] = await Promise.all([
      Jimp.read(Buffer.from(a.data, "base64")),
      Jimp.read(Buffer.from(b.data, "base64")),
    ]);
    ja.cover({ w: 24, h: 32 }).greyscale();
    jb.cover({ w: 24, h: 32 }).greyscale();
    let total = 0;
    const n = 24 * 32;
    for (let i = 0; i < n; i++) total += Math.abs(ja.bitmap.data[i * 4] - jb.bitmap.data[i * 4]);
    return total / n;
  } catch {
    return 255; // can't compare -> don't block
  }
}
const UNCHANGED_THRESHOLD = 18;

/** Last run details, shown at GET /api/stylist/status to make debugging on hosted previews easy. */
const lastRuns: Record<string, any> = {};

/* ------------------------------------------------------------------ */
/* Prompts                                                             */
/* ------------------------------------------------------------------ */

const STYLE_HINTS: Record<string, string> = {
  streetwear_vinyl:
    "a glossy-matte collectible vinyl designer-toy finish, like a premium blind-box art toy",
  anime_chibi:
    "a cute anime-inspired chibi resin figure finish with slightly larger head and softer features",
  realistic_scale:
    "a hand-painted 1:12 scale resin miniature with slightly more realistic proportions (head about 1/4 of body height) while staying toy-like",
};

const BUILD_HINTS: Record<string, string> = {
  regular: "an average, standard body build",
  athletic: "a slightly broader-shouldered, athletic body build",
  oversized_loose: "a relaxed, slightly fuller body build",
};

function miniaturePrompt(style: string, build: string, refCount = 1): string {
  const refs = refCount > 1 ? `IMAGES 2-${refCount + 1}` : "IMAGE 2";
  return `You are creating a personalised collectible miniature figurine for an online clothing store's virtual try-on.

IMAGE 1 is a photo of the customer.
${refs} ${refCount > 1 ? "are STYLE REFERENCES: small chibi collectible doll figurines" : "is the STYLE REFERENCE: a small chibi collectible doll figurine"}.

Create ONE new photograph of a chibi collectible miniature figurine that clearly depicts THE CUSTOMER FROM IMAGE 1, sculpted in the same style as ${refs} – like a small doll, but with the customer's own face.

Likeness (most important – the customer must recognise themselves):
- Keep the customer's exact hairstyle, hair length, parting, hair colour and texture.
- Keep their skin tone, face shape, eyebrows, facial hair, glasses, earrings or other distinctive features.
- Keep their gender presentation. A gentle, friendly smile.

Figurine style (copy from ${refs}):
- Chibi proportions: oversized head (about one third of total height), small body, short legs, simple mitten-like hands.
- Smooth sculpted hair with soft highlights, ${STYLE_HINTS[style] || STYLE_HINTS.streetwear_vinyl}.
- Body: ${BUILD_HINTS[build] || BUILD_HINTS.regular}, in chibi proportions.

Pose & framing:
- Full body, standing upright, facing the camera, arms relaxed slightly away from the torso so the shirt is fully visible.
- The entire figurine from the top of the hair to the soles of the shoes is inside the frame with some margin.

Outfit (a neutral base so clothes can be swapped later):
- Plain white crew-neck short-sleeve t-shirt with no print, plain dark navy straight trousers, plain white sneakers.
- Do NOT copy the clothes, face or hair of the reference dolls – only their sculpting style and proportions.

Scene: clean light-grey seamless studio backdrop, soft product-photography lighting, soft contact shadow under the feet.
No text, no logos, no watermark, no extra people, no frame or border.`;
}

function fitDescriptor(size: string, sizes: string[]): string {
  const order = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const idx = order.indexOf((size || "").toUpperCase());
  if (idx <= 1) return "a close, fitted cut that sits near the body";
  if (idx === 2) return "a true-to-size relaxed fit";
  if (idx === 3) return "a boxy, drop-shoulder relaxed fit with sleeves reaching just past the shoulder line";
  if (idx === 4) return "an oversized fit with dropped shoulders, wider body and sleeves reaching toward the elbow";
  if (idx >= 5) return "a very oversized, baggy fit with long hem and elbow-length sleeves";
  return sizes?.length ? "a relaxed fit" : "a regular fit";
}

function tryOnPrompt(opts: {
  productName: string;
  category: string;
  description?: string;
  colorName: string;
  colorHex: string;
  size: string;
  sizes: string[];
  hasProductImage: boolean;
}): string {
  const garmentSource = opts.hasProductImage
    ? `IMAGE 2 is the store's product photo of the article "${opts.productName}" (${opts.category}).
Take ONLY the garment from IMAGE 2 – ignore any model, mannequin, hanger, background or other clothing in it.
Reproduce its cut, neckline, sleeve length, hem, fabric texture, and any print, graphic, embroidery or logo with the same placement.`
    : `The article is "${opts.productName}" (${opts.category}). ${opts.description || ""}`.trim();

  return `IMAGE 1 is a customer's collectible chibi miniature figurine.
${garmentSource}

Edit IMAGE 1 so the SAME figurine is now wearing this article:
- Colour: ${opts.colorName} (approx. hex ${opts.colorHex}). If the product photo shows a different colour, recolour the garment to ${opts.colorName} while keeping its print/graphic.
- Size ${opts.size}: show it as ${fitDescriptor(opts.size, opts.sizes)}, scaled to the figurine's chibi proportions.
- The garment replaces only the figurine's current top. Fabric should drape and fold naturally with soft toy-photography shading.

Keep EVERYTHING else exactly the same as IMAGE 1: face, expression, hair, skin tone, body proportions, pose, trousers, shoes, background, lighting and camera angle. Keep the vinyl figurine art style – do not turn it into a real human.
No text overlays, no watermark, no extra figures.`;
}

/**
 * Shorter, index-based prompts for FLUX.2 (images are numbered from 0).
 * Order matters: image 0 = sample doll (sets the look + framing), image 1 = customer (identity only),
 * image 2 = optional second sample doll. Putting the photo first makes FLUX tend to return the photo.
 */
function fluxMiniaturePrompt(style: string, build: string, extraRef: boolean, strong = false): string {
  return `${strong ? "Do NOT return a photograph of a real person. " : ""}Turn the person in image 1 into a small chibi collectible doll figurine in the exact toy style of image 0${
    extraRef ? " and image 2" : ""
  }. The result is a photo of a toy figurine, not a real human: smooth matte vinyl skin, sculpted glossy hair, oversized head about one third of the height, small body, short legs, simple hands; ${
    STYLE_HINTS[style] || STYLE_HINTS.streetwear_vinyl
  }; ${BUILD_HINTS[build] || BUILD_HINTS.regular}. The figurine has the face of the person in image 1 so they recognise themselves: same hairstyle, hair colour, skin tone, face shape, beard or moustache, and glasses if they wear them, with a gentle smile. Full body figurine standing upright facing the camera, arms slightly away from the body, the whole toy visible from the top of the hair to the shoes, framed like image 0. It wears a plain white crew-neck t-shirt, dark navy trousers and white sneakers. Do not copy the clothes or face of the doll in image 0, and do not keep the background or clothes from image 1. Light grey seamless studio background, soft product photography lighting, soft shadow under the feet. No text, no watermark.`;
}

function fluxTryOnPrompt(opts: {
  productName: string;
  category: string;
  description?: string;
  colorName: string;
  colorHex: string;
  size: string;
  sizes: string[];
  hasProductImage: boolean;
}): string {
  const garment = opts.hasProductImage
    ? `the ${opts.category.toLowerCase()} shown in image 1 ("${opts.productName}"), copying its cut, neckline, sleeves, fabric texture and any print, graphic or logo with the same placement; ignore any person, mannequin or background in image 1`
    : `${/^[aeiou]/i.test(opts.category) ? "an" : "a"} ${opts.category.toLowerCase()} called "${opts.productName}"${opts.description ? ` (${opts.description.slice(0, 200)})` : ""}`;
  return `The exact same chibi doll figurine from image 0, now wearing ${garment}. The garment colour is ${opts.colorName}${
    opts.colorHex ? ` (${opts.colorHex})` : ""
  }. Size ${opts.size}: ${fitDescriptor(opts.size, opts.sizes)}, scaled to the figurine's chibi proportions, with natural folds. Keep the figurine's face, hair, skin tone, body, pose, trousers, shoes, background, lighting and camera angle identical to image 0. Vinyl collectible toy style. No text, no watermark.`;
}

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

export function registerStylistRoutes(app: Express, getClient: GetClient, rootDir: string) {
  // Style references: the sample miniatures the generated figurine should look like.
  const referenceDolls: InlineImage[] = [];
  for (const file of ["image_aa6d36c7.png", "reference_doll_2.png"]) {
    const p = path.join(rootDir, "public", "assets", "aistudio", file);
    try {
      referenceDolls.push({ mimeType: mimeFromExt(p), data: fs.readFileSync(p).toString("base64") });
    } catch {
      console.warn("[stylist] Reference doll image not found at", p);
    }
  }

  /** Customer photo -> personalised chibi miniature figurine */
  app.post("/api/stylist/create-miniature", async (req: Request, res: Response) => {
    const { photoData, style = "streetwear_vinyl", build = "regular", name = "Customer" } = req.body || {};
    const client = getClient();

    const isCustomerPhoto = typeof photoData === "string" && photoData.startsWith("data:image");
    if (!photoData || typeof photoData !== "string") {
      return res.status(400).json({ error: "A photo is required to create a miniature." });
    }

    let features = {
      skinTone: "warm medium",
      hairStyle: "natural styled hair",
      hairColor: "dark brown",
      facialVibe: "friendly smile",
      recommendedArchetype: "chibi_male",
      stylingNotes:
        "Balanced proportions that carry both relaxed and boxy cuts well. Try a drop-shoulder tee one size up for a streetwear drape.",
    };

    // Run feature extraction (text) and figurine generation (image) in parallel.
    const featuresTask = (async () => {
      if ((!client && !cloudflareConfigured()) || !isCustomerPhoto) return;
      const img = parseDataUrl(photoData);
      if (!img) return;
      try {
        const parsed = await generateJson(client, [
                { inlineData: img },
                {
                  text: `Describe this shopper for a clothing stylist. Return ONLY JSON with keys:
"skinTone" (e.g. "fair", "warm ivory", "golden tan", "deep brown"),
"hairStyle" (short phrase), "hairColor" (short phrase),
"facialVibe" (short phrase about expression),
"recommendedArchetype" (one of "chibi_male","chibi_fem","chibi_urban"),
"stylingNotes" (2 short sentences: which t-shirt cuts and colours would flatter them and why).
Do not guess age, ethnicity, religion or any sensitive attribute.`,
                },
        ]);
        features = { ...features, ...parsed };
      } catch (e) {
        console.warn("[stylist] feature extraction fallback:", cleanGeminiError(e));
      }
    })();

    const imageTask = (async () => {
      // Preset demo dolls are already figurines – use them as-is.
      if (!isCustomerPhoto) return { dataUrl: photoData, model: "preset", generated: false as const };
      const photo = parseDataUrl(photoData)!;
      const started = Date.now();
      const [mainRef, secondRef] = referenceDolls;
      const fluxImages = mainRef ? [mainRef, photo, ...(secondRef ? [secondRef] : [])] : [photo];
      const attempts: any[] = [];

      for (let attempt = 0; attempt < 2; attempt++) {
        const strong = attempt > 0;
        const parts: Part[] = [{ inlineData: photo }];
        for (const ref of referenceDolls) parts.push({ inlineData: ref });
        parts.push({
          text:
            (strong ? "IMPORTANT: the previous result was just the original photo. The output MUST be a toy figurine, not a photo of a person.\n\n" : "") +
            miniaturePrompt(style, build, referenceDolls.length),
        });
        const out = await makeImage(client, {
          geminiParts: parts,
          fluxImages,
          fluxPrompt: mainRef
            ? fluxMiniaturePrompt(style, build, Boolean(secondRef), strong)
            : fluxMiniaturePrompt(style, build, false, strong).replace(/image 0/g, "a collectible chibi vinyl toy"),
          seed: Math.floor(Math.random() * 2_000_000_000),
        });
        const generated = parseDataUrl(out.dataUrl);
        const diff = generated ? await imageDifference(generated, photo) : 255;
        attempts.push({ model: out.model, differenceFromPhoto: Math.round(diff) });
        console.log(`[stylist] miniature attempt ${attempt + 1} via ${out.model}: difference from photo = ${diff.toFixed(1)}`);
        if (diff >= UNCHANGED_THRESHOLD) {
          lastRuns.miniature = { ok: true, attempts, ms: Date.now() - started, at: new Date().toISOString() };
          return { ...out, generated: true as const };
        }
      }
      lastRuns.miniature = { ok: false, attempts, ms: Date.now() - started, at: new Date().toISOString() };
      throw new ImageGenError(
        "The AI returned your photo unchanged instead of a miniature. Try a different photo: one person, face clearly visible, plain background.",
        "no_image"
      );
    })();

    const [, imageResult] = await Promise.allSettled([featuresTask, imageTask]);

    let miniatureImageUrl = "";
    let isAiGenerated = false;
    let imageModel: string | undefined;
    let imageError: string | undefined;
    let imageErrorCode: string | undefined;

    if (imageResult.status === "fulfilled") {
      miniatureImageUrl = imageResult.value.dataUrl;
      isAiGenerated = imageResult.value.generated;
      imageModel = imageResult.value.model;
    } else {
      const err = imageResult.reason;
      imageError = err?.message || "Could not generate the miniature image.";
      imageErrorCode = err instanceof ImageGenError ? err.code : "api_error";
      console.warn("[stylist] miniature generation failed:", imageError);
      lastRuns.miniature = { ...(lastRuns.miniature || {}), ok: false, error: imageError, at: new Date().toISOString() };
    }

    return res.json({
      success: true,
      imageError,
      imageErrorCode,
      miniature: {
        id: `mini_${Date.now().toString(36)}`,
        name: name || "Member",
        userPhotoUrl: photoData,
        miniatureImageUrl,
        isAiGenerated,
        imageModel,
        style,
        build,
        ...features,
        createdAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      },
    });
  });

  /** Miniature + product -> miniature wearing the product */
  app.post("/api/stylist/try-on", async (req: Request, res: Response) => {
    const { miniatureImage, productImage, product, color, size } = req.body || {};
    if (!miniatureImage || !product?.name) {
      return res.status(400).json({ error: "miniatureImage and product are required." });
    }

    const [mini, garment] = await Promise.all([
      loadImage(miniatureImage, rootDir),
      loadImage(productImage, rootDir),
    ]);
    if (!mini) return res.status(400).json({ error: "Could not read the miniature image." });

    const promptOpts = {
      productName: String(product.name),
      category: String(product.category || "T-shirt"),
      description: product.description ? String(product.description).slice(0, 400) : undefined,
      colorName: color?.name || "the shown colour",
      colorHex: color?.hex || "",
      size: size || "M",
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      hasProductImage: Boolean(garment),
    };
    const parts: Part[] = [{ inlineData: mini }];
    if (garment) parts.push({ inlineData: garment });
    parts.push({ text: tryOnPrompt(promptOpts) });

    try {
      const out = await makeImage(getClient(), {
        geminiParts: parts,
        fluxImages: garment ? [mini, garment] : [mini],
        fluxPrompt: fluxTryOnPrompt(promptOpts),
      });
      lastRuns.tryOn = { ok: true, model: out.model, usedProductPhoto: Boolean(garment), at: new Date().toISOString() };
      return res.json({ imageUrl: out.dataUrl, model: out.model, usedProductPhoto: Boolean(garment) });
    } catch (err: any) {
      lastRuns.tryOn = { ok: false, error: err?.message, usedProductPhoto: Boolean(garment), at: new Date().toISOString() };
      const code = err instanceof ImageGenError ? err.code : "api_error";
      return res.status(code === "no_key" ? 503 : 502).json({ error: err?.message || "Try-on failed.", code });
    }
  });

  /** Debug page: open /api/stylist/status in the browser to see which engine is active and the last results. */
  app.get("/api/stylist/status", (_req: Request, res: Response) => {
    res.json({
      stylistVersion: "thread-den-ai-stylist v5 (cloudflare-ready)",
      imageEngine: imageProvider(),
      textEngineOrder: imageProvider() === "cloudflare" ? ["cloudflare", "gemini"] : ["gemini", "cloudflare"],
      cloudflareConfigured: cloudflareConfigured(),
      cloudflareModel: process.env.CLOUDFLARE_IMAGE_MODEL?.trim() || "@cf/black-forest-labs/flux-2-klein-4b",
      geminiKeyPresent: Boolean(getClient()),
      referenceDollsLoaded: referenceDolls.length,
      textModels: TEXT_MODELS,
      lastRuns,
    });
  });

  /** Honest fit verdict – looks at the dressed miniature when we have one */
  app.post("/api/stylist/analyze-fit", async (req: Request, res: Response) => {
    const { product, selectedColor, selectedSize, miniature, tryOnImage } = req.body || {};
    if (!product) return res.status(400).json({ error: "Product is required." });

    let verdict: any = {
      fitScore: 80,
      matchLevel: "Good everyday match",
      silhouetteDrape: "Relaxed drape that sits well on most builds.",
      colorSynergy: `${selectedColor || "This shade"} is an easy colour to wear with ${miniature?.skinTone || "most"} skin tones.`,
      stylistAdvice: `Size ${selectedSize || "L"} gives the "${product.name}" a relaxed streetwear drape. Size up once if you want a more oversized look.`,
      recommendedPairings: {
        bottoms: "Wide-leg washed denim or relaxed cargo pants.",
        footwear: "Retro runners or clean low-top sneakers.",
        accessories: "A minimal silver chain or a small crossbody bag.",
      },
      isEstimate: true,
    };

    const client = getClient();
    if (client || cloudflareConfigured()) {
      try {
        const look = tryOnImage ? parseDataUrl(tryOnImage) : null;
        const prompt = `You are "DEN AI", an honest streetwear stylist for THREAD DEN. ${
          look
            ? "The attached image shows the customer's personal miniature figurine WEARING the article. Judge what you actually see."
            : "No preview image is available; judge from the profile."
        }
Article: "${product.name}" (${product.category}), colour "${selectedColor || "default"}", size ${selectedSize || "L"}.
Customer profile: skin tone ${miniature?.skinTone || "unknown"}, hair ${miniature?.hairColor || "unknown"} ${
          miniature?.hairStyle || ""
        }, build ${miniature?.build || "regular"}.

Be genuinely useful: if the colour washes them out or the size looks wrong, say so and suggest a better colour/size from the product's options: colours [${(product.colors || [])
          .map((c: any) => c.name)
          .join(", ")}], sizes [${(product.sizes || []).join(", ")}].

Return ONLY JSON:
{"fitScore": integer 0-100 (honest; 85+ only for a genuinely great match),
 "matchLevel": short phrase,
 "silhouetteDrape": 1 sentence on how the cut/size sits,
 "colorSynergy": 1 sentence on colour vs their complexion and hair,
 "stylistAdvice": 2 sentences, include a better colour/size if relevant,
 "recommendedPairings": {"bottoms": "...", "footwear": "...", "accessories": "..."}}`;

        const parts: Part[] = look ? [{ inlineData: look }, { text: prompt }] : [{ text: prompt }];
        const parsed = await generateJson(client, parts);
        verdict = { ...verdict, ...parsed, isEstimate: false, basedOnPreview: Boolean(look) };
        verdict.fitScore = Math.max(0, Math.min(100, Math.round(Number(verdict.fitScore) || 0)));
      } catch (e) {
        console.warn("[stylist] fit analysis fallback:", cleanGeminiError(e));
      }
    }

    return res.json({ verdict });
  });
}
