import type { APIRoute } from "astro";

export const prerender = false;

type AutoRAGBinding = {
  search: (params: { query: string; maxNumResults?: number }) => Promise<{
    response?: string;
    data?: Array<{
      score: number;
      content?: { text?: string; type?: string; filename?: string };
      attributes?: Record<string, unknown>;
    }>;
  }>;
  aiSearch: (params: { query: string; maxNumResults?: number }) => Promise<{
    response: string;
    data?: Array<{
      score: number;
      content?: { text?: string; type?: string; filename?: string };
      attributes?: Record<string, unknown>;
    }>;
  }>;
};

function getBinding(context: Parameters<APIRoute>[0]): AutoRAGBinding | null {
  const platform = (context as any).platform;
  return (platform?.env?.AI_SEARCH as AutoRAGBinding) ?? null;
}

export const GET: APIRoute = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (!query) {
    return new Response(
      JSON.stringify({ error: "Missing query parameter: q" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const aiSearch = getBinding(context);

    if (!aiSearch?.search) {
      return new Response(
        JSON.stringify({ error: "AI Search binding not configured" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await aiSearch.search({ query, maxNumResults: 5 });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("AutoRAG search error:", err);
    return new Response(
      JSON.stringify({ error: "Search failed", details: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const POST: APIRoute = async (context) => {
  try {
    const { request } = context;
    const body = await request.json() as { query?: string };
    const { query } = body;

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Missing query in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const aiSearch = getBinding(context);

    if (!aiSearch?.aiSearch) {
      return new Response(
        JSON.stringify({ error: "AI Search binding not configured" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await aiSearch.aiSearch({ query, maxNumResults: 5 });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("AutoRAG search error:", err);
    return new Response(
      JSON.stringify({ error: "Search failed", details: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
