export default async function handler(req) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const apiKey = "sk-ant-api03-YOURFULLKEYHERE";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing API key" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const { messages, system } = body;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system: system || "",
        messages: messages || [],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || "Anthropic error", detail: data }), {
        status: 502, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Server error" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}
