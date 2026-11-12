<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/29a51f2e-085f-419e-872e-79f1bf38fe50

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## AI Stylist – personal miniature try-on

1. The customer uploads or snaps a photo in **AI Stylist (Try-On)**.
2. `POST /api/stylist/create-miniature` sends the photo plus the reference doll
   (`public/assets/aistudio/image_aa6d36c7.png`) to the Gemini image model, which sculpts a chibi
   figurine of *that* customer in a neutral base outfit.
3. Picking any product / colour / size calls `POST /api/stylist/try-on`, which dresses the same
   figurine in that article (using the product's colour photo as the garment reference).
   Looks are cached in the browser, so switching back is instant.
4. `POST /api/stylist/analyze-fit` looks at the dressed miniature and gives an honest fit score
   and colour/size advice.

Server code lives in `stylistRoutes.ts`; the UI is `src/components/AiStylistModal.tsx`.
Requires `GEMINI_API_KEY` on a billing-enabled project (image generation is a paid feature).
Optional: `GEMINI_IMAGE_MODEL` to pick the image model.

### Free image engine (Cloudflare Workers AI)

Gemini image generation needs a paid key. For a free setup, create a Cloudflare account,
open **Workers AI → Use REST API**, copy the **Account ID**, create a **Workers AI API token**, and add:

```
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

The stylist then uses FLUX.2 Klein (about 80 free images a day; resets 5:30 AM IST).
With Cloudflare set, the photo reading and fit verdict also run on Cloudflare (Llama 4 Scout), so no Gemini key is needed. Check what is running at `/api/stylist/status`.
