import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { registerStylistRoutes } from "./stylistRoutes";

dotenv.config({ path: [".env.local", ".env"] });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize @google/genai with required User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

/**
 * System Instructions for different chatbot roles
 */
const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  stylist: `You are "DEN AI" - the Lead Streetwear Stylist and Cut Consultant for THREAD DEN.
Your role:
- Provide expert styling recommendations, urban streetwear outfit ideas, and color pairing guides.
- Explain aesthetic combinations for heavyweights (240+ GSM), graphic cuts, acid wash, and minimalist blanks.
- Recommend pants, sneakers, and layering pieces (hoodies, flannels, cargo pants) that complement oversized tees.
- Maintain an authentic streetwear tone: cool, knowledgeable, concise, and helpful.`,

  sizing: `You are "DEN AI" - the Fit & Sizing Specialist for THREAD DEN.
Your role:
- Help shoppers choose the exact right size (S, M, L, XL, XXL) based on their height, weight, build, and desired fit (true-to-size boxy, relaxed oversized, or standard fit).
- Explain drop-shoulder anatomy, chest measurements, and preshrunk cotton behavior.
- Give concrete garment care rules: cold water machine wash, inside out, line dry to keep collars and ribbing crisp.
- Be precise with numerical measurements in inches or centimeters when asked.`,

  reseller: `You are "DEN AI" - the Reseller & Merchant Business Advisor for THREAD DEN.
Your role:
- Assist streetwear brand owners, merch creators, and resellers with margin optimization, bulk batch planning, and retail markup.
- Explain why 240+ GSM heavyweight blanks have higher perceived value and justify 2.5x - 3.5x retail margins.
- Provide tips on screen printing, direct-to-garment (DTG), puff print, and embroidery on heavy cotton.
- Give actionable business insights in a sharp, entrepreneurial manner.`,
};

/**
 * Multi-Turn Chat API Endpoint
 */
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model = "gemini-3.8-flash", role = "stylist", customInstruction } = req.body;

    const activeKey = process.env.GEMINI_API_KEY || apiKey;
    const client = activeKey
      ? new GoogleGenAI({
          apiKey: activeKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        })
      : null;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing or invalid 'messages' array in request body." });
    }

    if (!client) {
      throw new Error("Gemini API key is not configured on the server. Please add your key in Settings > Secrets.");
    }

    // Determine system instruction by persona role
    const systemInstruction = customInstruction || SYSTEM_INSTRUCTIONS[role] || SYSTEM_INSTRUCTIONS.stylist;

    // Allowed models per gemini-api SKILL.md
    const validModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-4-argon"];
    const targetModel = validModels.includes(model) ? model : "gemini-3.8-flash";

    // Format chat history for @google/genai
    const formattedContents = messages.map((m: { role: string; text?: string; content?: string }) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.text || m.content || "" }],
    }));

    const response = await client.models.generateContent({
      model: targetModel,
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "I'm here to help you style and select the best streetwear cuts.";
    return res.json({ reply });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    let errMsg = error.message || "Failed to generate AI response from Gemini.";
    try {
      if (typeof errMsg === "string" && (errMsg.startsWith("{") || errMsg.includes('"error"'))) {
        const parsed = JSON.parse(errMsg);
        if (parsed?.error?.message) {
          errMsg = parsed.error.message;
        }
      }
    } catch (e) {
      // keep original
    }

    // Provide a smart contextual fallback if Gemini API requires billing or has quota limits
    const reqMessages = req.body?.messages;
    const lastUserMsg = (Array.isArray(reqMessages) && reqMessages.length > 0 ? reqMessages[reqMessages.length - 1]?.text || "" : "").toLowerCase();
    let fallbackReply = "";

    if (
      lastUserMsg.includes("size") ||
      lastUserMsg.includes("fit") ||
      lastUserMsg.includes("kg") ||
      lastUserMsg.includes("cm") ||
      lastUserMsg.includes("height")
    ) {
      fallbackReply = `📏 **DEN AI Fit Recommendation:**\n\nFor a signature drop-shoulder oversized look on our **240+ GSM heavyweight blanks**:\n- **Medium (Chest 42", Length 29")**: Perfect if you are around 5'8" - 5'10" (65-75kg) wanting relaxed drape without being too long.\n- **Large (Chest 44", Length 30")**: Ideal for 5'10" - 6'1" (75-85kg) for a boxy streetwear profile.\n- **Garment Tip**: Our combed cotton is preshrunk. Wash in cold water and hang dry to maintain collar rib stiffness!`;
    } else if (
      lastUserMsg.includes("color") ||
      lastUserMsg.includes("pair") ||
      lastUserMsg.includes("style") ||
      lastUserMsg.includes("outfit")
    ) {
      fallbackReply = `👟 **DEN AI Styling Guide:**\n\n- **Heavyweight Pitch Black**: Pairs cleanly with vintage washed grey denim or olive cargo pants and low-top retro sneakers.\n- **Vintage Sand / Cream**: Looks best with raw indigo denim or dark charcoal sweatpants.\n- **Acid Wash Slate**: Elevate it with monochromatic black utility pants and minimalist silver accessories.`;
    } else if (
      lastUserMsg.includes("margin") ||
      lastUserMsg.includes("resell") ||
      lastUserMsg.includes("price") ||
      lastUserMsg.includes("wholesale") ||
      lastUserMsg.includes("profit")
    ) {
      fallbackReply = `💼 **DEN AI Reseller Strategy:**\n\n- **Wholesale Base Cost**: Sourced at ~₹600 - ₹750/unit.\n- **Recommended Retail Price**: ₹1,500 - ₹2,200/unit.\n- **Gross Margin**: 55% - 65%.\n- **Why it sells**: 240+ GSM combed cotton with high-density collar ribbing looks and feels like international luxury streetwear brands, allowing premium retail margins.`;
    } else {
      fallbackReply = `✨ **DEN AI Streetwear Stylist:**\n\nI can help you explore sizing, drop-shoulder silhouettes, fabric care for 240+ GSM heavyweight blanks, or calculate wholesale reseller margins for **THREAD DEN**!\n\n*(Note: To connect directly to real-time Gemini reasoning, ensure your billing-enabled Gemini API key is configured in Settings > Secrets).*`;
    }

    return res.json({
      reply: fallbackReply,
      warning: errMsg,
      isFallback: true,
    });
  }
});

/**
 * AI Stylist: customer miniature generation, virtual try-on and fit verdict
 * (see stylistRoutes.ts)
 */
registerStylistRoutes(
  app,
  () => {
    const key = process.env.GEMINI_API_KEY || apiKey;
    return key ? new GoogleGenAI({ apiKey: key, httpOptions: { headers: { "User-Agent": "aistudio-build" } } }) : null;
  },
  __dirname
);

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Vite Dev Middleware / Static Production Server
 */
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
