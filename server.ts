import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import helmet from "helmet";

dotenv.config();

const app = express();
const PORT = 3000;

// Security layer: Helmet helps secure the app by setting various HTTP headers
// In development, we need to relax some policies to allow Vite's inline scripts/WS
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "frame-src": ["'self'", "https://www.youtube.com", "https://youtube.com", "https://www.youtube-nocookie.com"],
      "script-src": ["'self'", "'unsafe-inline'", "https://www.youtube.com", "https://s.ytimg.com"],
      "img-src": ["'self'", "data:", "https://images.unsplash.com", "https://img.youtube.com", "https://i.ytimg.com"],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
}));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build-hardened',
    }
  }
});

// Middleware
app.use(express.json({ limit: '1mb' })); // Limit payload size to prevent DDoS

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "secured", timestamp: new Date().toISOString() });
});
app.post("/api/ai/analyze-relationship", async (req, res) => {
  try {
    const { content } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following content for creator relationships and sentiment in the Ryan Upchurch saga. 
      Identify alliances, conflicts, and sentiment shifts. 
      Return a JSON object with: 
      - relationships: Array of { source, target, type (allied|neutral|hostile|unstable|former_allies), sentiment (score -1 to 1) }
      - summary: Short text summary of the dynamic.
      - confidence: 0-1 score.
      
      Content: ${content}`,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    console.error("AI Relationship Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze relationship" });
  }
});

app.post("/api/ai/detect-contradictions", async (req, res) => {
  try {
    const { statements } = req.body; // Array of { text, source, date }
    
    // Safety: Sanitize and limit statement sizes to prevent model overflow
    const sanitizedStatements = statements.map((s: any) => ({
      ...s,
      text: s.text.length > 50000 ? s.text.substring(0, 50000) + "... [TRUNCATED]" : s.text
    }));

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Use flash for faster response on larger text blocks
      contents: `Perform a deep cross-referencing analysis on these statements from the "Ryan Upchurch Saga". 
      Your mission is to detect direct contradictions, narrative shifts, or claims that clash with previous statements.
      
      TRANSCIPT/DATA SET:
      ${JSON.stringify(sanitizedStatements)}

      If the input is a transcript, identify key points where the story changed.
      
      Return JSON directly: 
      { 
        "contradictions": [
          { "claim1": {"text": "...", "date": "..."}, "claim2": {"text": "...", "date": "..."}, "description": "...", "confidence": 0.0 to 1.0 }
        ],
        "summary": "Overall assessment of narrative consistency" 
      }`,
      config: { responseMimeType: "application/json" }
    });
    
    const result = JSON.parse(response.text || "{\"contradictions\": []}");
    res.json(result);
  } catch (error) {
    console.error("Contradiction Detection Error:", error);
    res.status(500).json({ error: "Narrative cross-reference failed due to payload size or processing timeout." });
  }
});

app.post("/api/ai/saga-summary", async (req, res) => {
  try {
    const { timelineEvents } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a cinematic saga summary based on these recent events: ${JSON.stringify(timelineEvents)}.
      Style: FBI Intelligence Report / Documentary Narration.
      Return JSON: { summary, keyNarratives: string[], heatmapUpdate: { creator: string, index: number }[] }`,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    console.error("Saga Summary Error:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

app.post("/api/ai/analyze-evidence", async (req, res) => {
  try {
    const { title, description, url, tags } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Perform an intelligence analysis on the following evidence entry for the "Mokon/Upchurch Saga".
      
      TITLE: ${title}
      DESCRIPTION: ${description}
      URL: ${url || 'No URL provided'}
      TAGS: ${tags?.join(', ')}
      
      Your goal is to assess content validity, determine volatility (the likelihood this triggers more drama), and summarize the narrative impact.
      
      Return a JSON object:
      {
        "summary": "Short 1-2 sentence intelligence summary",
        "volatility": 0.0 to 1.0,
        "validityScore": 0.0 to 1.0 (based on internal consistency and source quality),
        "extractedThemes": ["string"],
        "narrativeImpact": "Description of how this changes the story"
      }`,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    console.error("Evidence Analysis Error:", error);
    res.status(500).json({ error: "Intelligence analysis sequence failed" });
  }
});

// Vite Middleware
async function setupVite() {
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
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Intelligence System running on http://localhost:${PORT}`);
  });
});
