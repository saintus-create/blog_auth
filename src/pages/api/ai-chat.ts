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

    const userMessage = messages.findLast((m) => m.role === "user")?.content ?? "";

    const platform = (context as any).platform;
    const aiSearch = platform?.env?.AI_SEARCH as {
      aiSearch: (params: {
        query: string;
        maxNumResults?: number;
      }) => Promise<{
        response: string;
        data?: Array<{
          score: number;
          content?: { text?: string; type?: string; filename?: string };
          attributes?: Record<string, unknown>;
        }>;
      }>;
    };

    if (!aiSearch?.aiSearch) {
      return new Response(
        JSON.stringify({
          error: "AI Search binding not configured",
          hint: "Add [[ai_search]] in wrangler.toml and create an AutoRAG index in the Cloudflare dashboard named 'doc'.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await aiSearch.aiSearch({
      query: userMessage,
      maxNumResults: 5,
    });

    return new Response(
      JSON.stringify({
        id: crypto.randomUUID(),
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "autorag",
        response: result.response,
        data: result.data ?? [],
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: result.response,
            },
            finish_reason: "stop",
          },
        ],
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("AutoRAG chat error:", err);
    return new Response(
      JSON.stringify({ error: "Chat failed", details: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
