import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;

export const openrouter = createOpenRouter({
    apiKey: OPENROUTER_API_KEY,
});

// Default model for chat - using a capable model
export const DEFAULT_MODEL = "google/gemini-2.0-flash-001";

// System prompt for RAG-grounded responses
export const RAG_SYSTEM_PROMPT = `You are a helpful AI assistant that answers questions based ONLY on the provided document context. 

Rules:
1. Only use information from the provided context to answer questions.
2. If there are no documents attached yet (no context provided), respond with exactly: "I Unravel if there are Documents, Upload a document first".
3. If there are documents (context is provided) but the user's prompt is not related to the documents or the answer cannot be found in the context, respond with: "Not found in document".
4. Do NOT include citations or source references in your response. The sources are displayed separately in the UI.
5. Be concise but thorough.
6. Format your responses in a clear, readable way using markdown when appropriate.`;

// Available models for users to choose from
export const AVAILABLE_MODELS = [
    { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
    { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
    { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
    { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash", provider: "Google" },
    { id: "mistralai/mistral-large-latest", name: "Mistral Large", provider: "Mistral" },
] as const;

export type ModelId = typeof AVAILABLE_MODELS[number]["id"];

/**
 * Build a prompt with RAG context for the LLM
 */
export function buildRAGPrompt(
    userQuery: string,
    context: { content: string; metadata?: Record<string, unknown> }[]
): string {
    if (context.length === 0) {
        return `NO DOCUMENTS ATTACHED/PROVIDED.\n\nUSER QUESTION:\n${userQuery}`;
    }

    const contextText = context
        .map((chunk, i) => {
            const fileName = chunk.metadata?.file_name || `Document ${i + 1}`;
            const pageNum = chunk.metadata?.page_number ? ` (Page ${chunk.metadata.page_number})` : "";
            return `[${fileName}${pageNum}]\n${chunk.content}`;
        })
        .join("\n\n---\n\n");

    return `Based on the following document context, please answer the user's question.

DOCUMENT CONTEXT:
${contextText}

USER QUESTION:
${userQuery}`;
}
