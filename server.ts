import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse large JSON bodies (images are heavy)
  app.use(express.json({ limit: "50mb" }));

  // API Route for Image Generation
  app.post("/api/generate-marketing-image", async (req, res) => {
    try {
      const { imageBase64, mimeType, targetAudience, medium, style, engine } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Product image is required." });
      }

      const modelName = engine === 'fast' ? 'gemini-2.5-flash-image' : 'gemini-3.1-flash-image-preview';
      
      const promptText = `Transform this product image into a professional ${medium} design for ${targetAudience}. The style should be ${style}. Ensure the core product characteristics remain consistent but seamlessly integrated into this marketing medium.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: engine === 'fast' ? "512px" : "1K"
          }
        }
      });
      
      let finalBase64 = null;
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            finalBase64 = part.inlineData.data;
            break;
          }
        }
      }

      if (finalBase64) {
        res.json({ success: true, imageUrl: `data:image/png;base64,${finalBase64}` });
      } else {
        res.status(500).json({ error: "Failed to locate generated image in response.", fullResponse: response.text });
      }

    } catch (err: any) {
      console.error("Image generation error:", err);
      res.status(500).json({ error: err.message || "Failed to generate image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
