import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API endpoints
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", name: "Tyre Directory API", time: new Date().toISOString() });
  });

  // Gemini AI endpoint for smart tyre recommendations
  app.post("/api/gemini/advisor", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({
          error: "Kunci GEMINI_API_KEY belum dikonfigurasi secara lengkap. Sila pastikan kunci API sah di persekitaran anda."
        });
      }

      const { prompt, userQuery, carInfo } = req.body;
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `Anda ialah Pakar Penasihat Tayar Pro (Smart Tyre Consultant) untuk platform Tyre Directory di Malaysia.
Tugas anda ialah memberikan nasihat pemilihan tayar yang tepat, mesra pengguna, dan jujur berdasarkan keperluan pelanggan (jenis kenderaan, saiz, bajet, corak pemanduan, prestasi basah, senyap/selesa, dsb.).
Jawab dalam Bahasa Melayu yang santai dan profesional dengan format markdown yang kemas.
Jika relevan, cadangkan jenama & model tayar popular di Malaysia seperti Michelin (Primacy/Pilot Sport), Goodyear (TripleMax/EfficentGrip), Continental (CC7/UC6), Hankook (Ventus Prime 4/K435), Nexen (N Fera SU4), Toyo (CR1), Autogreen, Duraturn, Kingboss, Durun, Gepormax, dll.`;

      const fullPrompt = carInfo 
        ? `Maklumat Kenderaan: ${carInfo}. Soalan Pelanggan: ${userQuery || prompt}`
        : (prompt || userQuery || "Bantu saya pilih tayar terbaik.");

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: `${systemInstruction}\n\n${fullPrompt}` }] }
        ],
      });

      const text = response.text || "Minta maaf, tiada jawapan diterima dari AI.";
      res.json({ result: text });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      res.status(500).json({ error: err.message || "Ralat komunikasi bersama AI Advisor." });
    }
  });

  // Vite middleware for development or static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use("/liastyre", express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Tyre Directory running on port ${PORT}`);
  });
}

startServer();
