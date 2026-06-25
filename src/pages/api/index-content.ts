import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const platform = (context as any).platform;
    const aiSearch = platform?.env?.AI_SEARCH as {
      search?: unknown;
      chatCompletion?: unknown;
      indexDocument?: (params: {
        instance: string;
        content: string;
        filename?: string;
        contentType?: string;
      }) => Promise<{ indexId?: string }>;
    };

    if (!aiSearch?.indexDocument) {
      return new Response(
        JSON.stringify({
          error: "AI Search binding not configured or not supporting document indexing",
          hint: "Check your wrangler.toml ai_search configuration",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const blog = await getCollection("blog");
    const projects = await getCollection("projects");
    const allEntries = [...blog, ...projects].filter((entry) => !entry.data.draft);

    const indexed: string[] = [];
    for (const entry of allEntries) {
      const content = entry.body || "";
      const result = await aiSearch.indexDocument({
        instance: "blog-instance",
        content,
        filename: `${entry.id}.md`,
        contentType: "text/markdown",
      });
      if (result?.indexId) {
        indexed.push(entry.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        indexed: indexed.length,
        items: indexed,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Indexing error:", err);
    return new Response(
      JSON.stringify({ error: "Indexing failed", details: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
