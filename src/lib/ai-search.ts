const AI_SEARCH_API = "/api/ai-search";
const AI_CHAT_API = "/api/ai-chat";

export interface SearchResult {
  score: number;
  content: {
    text?: string;
    type?: string;
    filename?: string;
  };
  attributes?: Record<string, unknown>;
}

export interface ChatCompletionResult {
  id: string;
  object: string;
  created: number;
  model: string;
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
  const data = await response.json() as { data?: SearchResult[]; results?: SearchResult[] };
  return data.data || data.results || [];
}

export async function chat(
  messages: Array<{ role: string; content: string }>
): Promise<ChatCompletionResult> {
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
