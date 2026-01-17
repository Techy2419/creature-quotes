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
    const { quote, availableAnimals } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!quote || !availableAnimals || !Array.isArray(availableAnimals)) {
      return new Response(
        JSON.stringify({ error: "quote and availableAnimals array are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const words = quote.split(/\s+/);
    console.log(`[Gemini Chaos] 📥 Request received: quote="${quote}", wordCount=${words.length}, animals=${availableAnimals.length}`);
    console.log(`[Gemini Chaos] 📋 Available animals:`, availableAnimals);

    // Determine number of replacements (2-4, but not more than half the words)
    const maxReplacements = Math.min(4, Math.floor(words.length / 2));
    const numReplacements = Math.max(2, Math.min(maxReplacements, Math.floor(Math.random() * 3) + 2));

    // Fallback function
    const getFallbackSelections = () => {
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
        .filter(({ word }) => word.length > 3 && !blacklist.has(word))
        .map(({ index }) => index);

      const pool = candidates.length >= numReplacements ? candidates : words.map((_, i) => i);
      const selections: Array<{ index: number; animal: string }> = [];
      const usedIndices = new Set<number>();

      while (selections.length < numReplacements && pool.length > 0) {
        const randomWordIdx = Math.floor(Math.random() * pool.length);
        const wordIndex = pool.splice(randomWordIdx, 1)[0];
        
        if (!usedIndices.has(wordIndex)) {
          const randomAnimal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
          selections.push({ index: wordIndex, animal: randomAnimal });
          usedIndices.add(wordIndex);
        }
      }

      return selections.sort((a, b) => a.index - b.index);
    };

    console.log(`[Gemini Chaos] 🚀 Calling Gemini API for ${numReplacements} word selections...`);
    const geminiStartTime = Date.now();
    console.log(`[Gemini Chaos] ⏱️ Request started at: ${new Date().toISOString()}`);
    
    const animalsList = availableAnimals.join(", ");
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
                  text: `You are selecting ${numReplacements} words from this quote to replace with animal sounds. For each word, you must also choose which animal sound fits best.

QUOTE:
"${quote}"

AVAILABLE ANIMALS: ${animalsList}

RULES (VERY IMPORTANT):
- Split the quote into words by spaces (0-based indexing)
- Select ${numReplacements} different word indices
- For each selected word, choose the most fitting animal from the available list
- Prefer verbs, nouns, or emotional adjectives for replacement
- Avoid articles, pronouns, and filler words
- Pick FUNNY and unexpected combinations
- Each word index must be unique
- Return ONLY a JSON array in this exact format:
[
  {"index": 2, "animal": "Lion"},
  {"index": 5, "animal": "Dog"},
  {"index": 8, "animal": "Cat"}
]

Example:
Quote: "I'm gonna make him an offer he can't refuse"
Available animals: Lion, Dog, Cat, Duck, Pig, Cow
Valid output: [{"index": 4, "animal": "Lion"}, {"index": 7, "animal": "Dog"}]`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      const elapsed = Date.now() - geminiStartTime;
      console.error(`[Gemini Chaos] API error (${elapsed}ms):`, response.status, errorText);
      const fallback = getFallbackSelections();
      console.log(`[Gemini Chaos] Using fallback selections:`, fallback);
      return new Response(
        JSON.stringify({ selections: fallback, fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const elapsed = Date.now() - geminiStartTime;
    
    console.log(`[Gemini Chaos] ✅ Gemini API responded in ${elapsed}ms`);
    console.log(`[Gemini Chaos] 📄 Raw response text:`, rawText?.substring(0, 200) || "null");

    if (!rawText) {
      console.warn(`[Gemini Chaos] No text returned (${elapsed}ms), using fallback`);
      const fallback = getFallbackSelections();
      return new Response(
        JSON.stringify({ selections: fallback, fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to parse JSON from the response
    let selections: Array<{ index: number; animal: string }> = [];
    try {
      console.log(`[Gemini Chaos] 🔍 Attempting to parse JSON from response...`);
      // Extract JSON array from response (might have markdown code blocks)
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log(`[Gemini Chaos] 📦 Found JSON array in response, length: ${jsonMatch[0].length}`);
        selections = JSON.parse(jsonMatch[0]);
      } else {
        console.log(`[Gemini Chaos] 📦 Parsing entire response as JSON`);
        selections = JSON.parse(rawText);
      }
      console.log(`[Gemini Chaos] ✅ Successfully parsed ${selections.length} selections:`, selections);
    } catch (parseError) {
      console.error(`[Gemini Chaos] ❌ Failed to parse JSON (${elapsed}ms):`, parseError);
      console.error(`[Gemini Chaos] 📄 Raw text that failed:`, rawText);
      const fallback = getFallbackSelections();
      console.log(`[Gemini Chaos] 🔄 Using fallback selections:`, fallback);
      return new Response(
        JSON.stringify({ selections: fallback, fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate selections
    console.log(`[Gemini Chaos] 🔍 Validating ${selections.length} selections...`);
    const validSelections: Array<{ index: number; animal: string }> = [];
    const usedIndices = new Set<number>();

    for (const sel of selections) {
      const isValidIndex = typeof sel.index === "number" && sel.index >= 0 && sel.index < words.length;
      const isUniqueIndex = !usedIndices.has(sel.index);
      const isValidAnimal = typeof sel.animal === "string" && availableAnimals.includes(sel.animal);
      
      if (isValidIndex && isUniqueIndex && isValidAnimal) {
        validSelections.push({ index: sel.index, animal: sel.animal });
        usedIndices.add(sel.index);
        console.log(`[Gemini Chaos] ✅ Valid selection: index ${sel.index} ("${words[sel.index]}") → ${sel.animal}`);
      } else {
        console.warn(`[Gemini Chaos] ⚠️ Invalid selection skipped:`, {
          index: sel.index,
          animal: sel.animal,
          isValidIndex,
          isUniqueIndex,
          isValidAnimal,
          wordAtIndex: words[sel.index],
        });
      }
    }

    if (validSelections.length < 2) {
      console.warn(`[Gemini Chaos] Not enough valid selections (${validSelections.length}), using fallback`);
      const fallback = getFallbackSelections();
      return new Response(
        JSON.stringify({ selections: fallback, fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sort by index
    validSelections.sort((a, b) => a.index - b.index);

    console.log(`[Gemini Chaos] Success! Selected ${validSelections.length} words in ${elapsed}ms:`, 
      validSelections.map(s => `${s.index}:"${words[s.index]}"→${s.animal}`));

    return new Response(
      JSON.stringify({ selections: validSelections }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("gemini-chaos-select error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
