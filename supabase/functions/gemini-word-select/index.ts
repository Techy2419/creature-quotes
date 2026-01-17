import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { quote, animalName } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!quote || !animalName) {
      return new Response(
        JSON.stringify({ error: "quote and animalName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const words = quote.split(/\s+/);
    console.log(`[Gemini] Request received: quote="${quote}", animal="${animalName}", wordCount=${words.length}`);

    // 🔁 Deterministic fallback (senior-level safety)
    const fallbackIndex = (() => {
      const blacklist = new Set([
        "the", "a", "an", "and", "or", "but", "to", "of", "in", "on",
        "with", "for", "from", "that", "this", "it", "is", "are",
        "was", "were", "be", "been", "being"
      ]);

      const candidates = words
        .map((w, i) => ({
          word: w.replace(/[^\w]/g, "").toLowerCase(),
          index: i,
        }))
        .filter(({ word }) => word.length > 3 && !blacklist.has(word));

      if (candidates.length === 0) {
        return Math.floor(words.length / 2);
      }

      return candidates[Math.floor(Math.random() * candidates.length)].index;
    })();

    console.log(`[Gemini] Calling Gemini API for word selection...`);
    const geminiStartTime = Date.now();
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are selecting ONE word from this quote to replace with a ${animalName} sound.

QUOTE:
"${quote}"

RULES (VERY IMPORTANT):
- Split the quote into words by spaces
- Choose ONE word index (0-based)
- Prefer verbs, nouns, or emotional adjectives
- Avoid articles, pronouns, and filler words
- Pick the FUNNIEST and most unexpected choice
- Do NOT explain
- Return ONLY a single integer number

Example:
Quote: "I'm gonna make him an offer he can't refuse"
Valid output: 4`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 5,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      const elapsed = Date.now() - geminiStartTime;
      console.error(`[Gemini] API error (${elapsed}ms):`, response.status, errorText);
      console.log(`[Gemini] Using fallback index ${fallbackIndex} ("${words[fallbackIndex]}")`);
      return new Response(
        JSON.stringify({ index: fallbackIndex, fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const index = Number(raw);
    const elapsed = Date.now() - geminiStartTime;

    if (Number.isNaN(index) || index < 0 || index >= words.length) {
      console.warn(`[Gemini] Invalid index returned (${elapsed}ms):`, raw, "Using fallback");
      console.log(`[Gemini] Fallback index ${fallbackIndex} ("${words[fallbackIndex]}")`);
      return new Response(
        JSON.stringify({ index: fallbackIndex, fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Gemini] Success! Selected index ${index} ("${words[index]}") in ${elapsed}ms`);
    return new Response(
      JSON.stringify({ index }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("gemini-word-select error:", error);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
