const AI_CHAT_API = "/api/ai-chat";
const AI_SEARCH_API = "/api/ai-search";

export interface SearchResult {
  score: number;
  content?: {
    text?: string;
    type?: string;
    filename?: string;
  };
  attributes?: Record<string, unknown>;
}

export interface AIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  response: string;
  data: SearchResult[];
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

export async function search(query: string): Promise<SearchResult[]> {
  const response = await fetch(`${AI_SEARCH_API}?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  const data = await response.json() as { data?: SearchResult[] };
  return data.data ?? [];
}

export async function chat(
  messages: Array<{ role: string; content: string }>
): Promise<AIResponse> {
  const response = await fetch(AI_CHAT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!response.ok) {
    throw new Error(`Chat failed: ${response.statusText}`);
  }
  return response.json();
}

export async function ask(query: string): Promise<AIResponse> {
  return chat([{ role: "user", content: query }]);
}
