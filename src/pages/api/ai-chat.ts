import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const { request } = context;
    const body = await request.json() as { messages?: Array<{ role: string; content: string }> };
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Missing messages array in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const platform = (context as any).platform;
    const aiSearch = platform?.env?.AI_SEARCH as {
      chatCompletion: (params: {
        messages: Array<{ role: string; content: string }>;
        maxTokens?: number;
        stream?: boolean;
      }) => Promise<{
        id: string;
        choices: Array<{
          index: number;
          message: { role: string; content: string };
          finish_reason: string;
        }>;
      }>;
    };

    if (!aiSearch?.chatCompletion) {
      return new Response(
        JSON.stringify({
          error: "AI Search binding not configured",
          hint: "Set up ai_search binding in wrangler.toml",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await aiSearch.chatCompletion({
      messages,
      maxTokens: 1024,
      stream: false,
    });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("AI Search chat error:", err);
    return new Response(
      JSON.stringify({ error: "Chat failed", details: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
