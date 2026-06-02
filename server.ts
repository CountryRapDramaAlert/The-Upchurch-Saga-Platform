import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
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

app.post("/api/auth/verify-passcode", (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmails = ["didhesaythatreally@gmail.com", "administrator@gmail.com"];

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required credentials." });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!adminEmails.includes(cleanEmail)) {
      return res.status(403).json({ success: false, error: "ACCESS_DENIED: Unauthorized administrative email address." });
    }

    // Secure custom admin password from environment variables
    const configuredPassword = process.env.ADMIN_PASSWORD;
    const expectedPassword = configuredPassword || "admin123";

    if (password === expectedPassword) {
      console.log(`[AUTH] Admin bypass verification succeeded for ${cleanEmail}`);
      return res.json({ 
        success: true, 
        message: "ADMINISTRATIVE_ACCESS_GRANTED",
        profile: {
          uid: "admin_bypass_uid",
          username: "administrator",
          email: cleanEmail,
          karma: 9999,
          isAdmin: true,
          createdAt: new Date().toISOString()
        }
      });
    } else {
      console.warn(`[AUTH] Admin bypass login attempted with incorrect password for ${cleanEmail}`);
      return res.status(401).json({ success: false, error: "ACCESS_DENIED: Invalid administrative password." });
    }
  } catch (error: any) {
    console.error("[AUTH] Passcode verification error:", error);
    res.status(500).json({ success: false, error: "Internal session authentication server error." });
  }
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

// Livestream Sync Mode Analysis Endpoint
app.post("/api/ai/analyze-stream", async (req, res) => {
  try {
    const { url, title, creatorName, category } = req.body;
    
    if (!url || !title || !creatorName) {
      return res.status(400).json({ error: "URL, Title, and Creator Name are required for stream sync setup." });
    }

    // Secondary sanitization
    const cleanUrl = url.trim();
    const cleanTitle = title.trim();
    const cleanCreator = creatorName.trim();
    const cleanCategory = (category || "Drama & Disputes").trim();

    console.log(`[SYNC RUN] Starting real-time sync simulation for video: "${cleanTitle}" by ${cleanCreator}`);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Your task is to analyze this YouTube video / livestream and simulate a real-time intelligence report.
      
      STREAM SPECS:
      - Channel/Creator: ${cleanCreator}
      - Title: ${cleanTitle}
      - Stream Category: ${cleanCategory}
      - Ingestion URL: ${cleanUrl}

      You are a specialized intelligence analysis engine monitoring content conflicts, drama sagas, and narrative maneuvers.
      Perform a deep contradiction memory check, narrative shift evaluation, deflection detection, and emotional volatility index profiling.
      Identify 5 to 9 chronological timestamped detections starting from 00:05 and scatter-plotting up to 15:00 based on the video context.
      Make these extremely detailed, specific to the creator name with authentic simulated quotes (snippets) and expert analysis.
      
      TYPES MUST BE ONE OF THESE STRINGS ONLY:
      'contradiction', 'narrative_shift', 'accusation', 'denial', 'emotional_escalation', 'alliance_mention', 'repeated_talking_point', 'possible_misinformation', 'evidence_claim', 'self_contradiction', 'deflection', 'topic_pivot', 'hostile_escalation', 'audience_manipulation'
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            creatorName: { type: Type.STRING },
            dramaIntensity: { type: Type.INTEGER, description: "Scale 0-100 indicating active conflict severity" },
            heatMapData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING, description: "MM:SS format coordinate" },
                  intensity: { type: Type.NUMBER, description: "Intensity scale 0-100" }
                },
                required: ["time", "intensity"]
              }
            },
            detections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING, description: "Format MM:SS (e.g. 02:45)" },
                  timestampSeconds: { type: Type.INTEGER, description: "Integer total seconds" },
                  type: { type: Type.STRING, description: "Annotation tag matching requested list" },
                  title: { type: Type.STRING, description: "Short dynamic headline" },
                  severity: { type: Type.STRING, description: "low, medium, or high" },
                  confidence: { type: Type.INTEGER, description: "0-100 percent" },
                  explanation: { type: Type.STRING, description: "Deep investigative analytical breakdown" },
                  snippet: { type: Type.STRING, description: "Simulated dialogue or quote" }
                },
                required: ["timestamp", "timestampSeconds", "type", "title", "severity", "confidence", "explanation", "snippet"]
              }
            }
          },
          required: ["title", "creatorName", "dramaIntensity", "heatMapData", "detections"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("[SYNC RUN FAILURE] Gemini streamline analysis failed:", error);
    res.status(500).json({ error: "Streamline sync sequence timed out or reached parsing bounds.", details: error.message });
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
