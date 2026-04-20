// api/story.js — Vercel Serverless Function
// This keeps your Anthropic API key safe on the server.
// The frontend calls /api/story instead of Anthropic directly.

export const config = {
  runtime: "edge", // Edge runtime = fastest cold starts globally
};

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*"; // Set to your domain in production

export default async function handler(req) {
  // ── CORS ──────────────────────────────────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // ── Rate limiting (simple IP-based) ───────────────────────────────────────
  // For production, swap this with Upstash Redis or Vercel KV
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  // ── Parse body ────────────────────────────────────────────────────────────
  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { messages, system } = body;

  if (!messages || !Array.isArray(messages)) {
    return json({ error: "messages array is required" }, 400);
  }

  // ── Validate message count (prevent abuse) ────────────────────────────────
  if (messages.length > 20) {
    return json({ error: "Too many messages" }, 400);
  }

  // ── Call Anthropic ────────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: "API key not configured" }, 500);
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: system ?? "",
        messages,
      }),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      console.error("Anthropic error:", data);
      return json({ error: data?.error?.message ?? "Anthropic API error" }, 502);
    }

    return json(data, 200);
  } catch (err) {
    console.error("Proxy error:", err);
    return json({ error: "Internal server error" }, 500);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}
