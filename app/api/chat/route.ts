import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamText } from "ai";
import { openrouter, RAG_SYSTEM_PROMPT, buildRAGPrompt, DEFAULT_MODEL } from "@/lib/openrouter/client";
import { queryIndex } from "@/lib/llama/client";

export async function POST(request: Request) {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, projectId, conversationId, model = DEFAULT_MODEL } = body;

    if (!message || !projectId) {
        return NextResponse.json({ error: "Message and project ID required" }, { status: 400 });
    }

    // Verify project ownership 
    const { data: project } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    try {
        // Create or get conversation
        let convId = conversationId;
        if (!convId) {
            const { data: newConv, error: convError } = await supabase
                .from("conversations")
                .insert({
                    project_id: projectId,
                    user_id: user.id,
                    title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
                } as { project_id: string; user_id: string; title: string })
                .select()
                .single();

            if (convError || !newConv) {
                throw new Error("Failed to create conversation");
            }
            convId = newConv.id;
        }

        // Save user message
        await supabase.from("messages").insert({
            conversation_id: convId,
            role: "user",
            content: message,
        } as { conversation_id: string; role: string; content: string });

        // Check if project has any documents
        const { count } = await supabase
            .from("documents")
            .select("*", { count: "exact", head: true })
            .eq("project_id", projectId)
            .eq("status", "ready");

        // If no documents, return immediate response without calling LLM
        if (!count || count === 0) {
            const noDocsResponse = "Attach a Document first";

            // Save assistant message
            await supabase.from("messages").insert({
                conversation_id: convId,
                role: "assistant",
                content: noDocsResponse,
                sources: JSON.stringify([]),
            } as { conversation_id: string; role: string; content: string; sources: string });

            const encoder = new TextEncoder();
            const readableStream = new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode(`0:${JSON.stringify(noDocsResponse)}\n`));
                    controller.close();
                },
            });

            return new Response(readableStream, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Conversation-Id": convId,
                },
            });
        }

        // Retrieve relevant context from LlamaCloud
        let context: { content: string; metadata?: Record<string, unknown> }[] = [];
        try {
            console.log("[Chat] Querying LlamaCloud index for project:", projectId);
            const results = await queryIndex(message, projectId, 10);
            console.log("[Chat] Got results from LlamaCloud:", results.length, "chunks");
            context = results.map((r) => ({
                content: r.content,
                metadata: r.metadata,
            }));
        } catch (queryError) {
            // No documents indexed yet, proceed without context
            console.log("[Chat] Query error (proceeding without context):", queryError);
        }

        // Build prompt with RAG context
        const promptWithContext = buildRAGPrompt(message, context);
        console.log("[Chat] Prompt built, calling OpenRouter with model:", model);

        // Stream response from OpenRouter
        const result = streamText({
            model: openrouter(model),
            system: RAG_SYSTEM_PROMPT,
            prompt: promptWithContext,
        });
        console.log("[Chat] Stream started");

        // Return streaming response using textStream
        const stream = result.textStream;

        // Create a ReadableStream from the async iterator
        const encoder = new TextEncoder();
        let fullResponse = "";

        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        fullResponse += chunk;
                        // Stream raw text directly
                        controller.enqueue(encoder.encode(chunk));
                    }

                    // Build sources from context
                    const sources = context.map((c) => ({
                        fileName: String(c.metadata?.file_name || "Unknown"),
                        content: c.content.substring(0, 200),
                    }));

                    // Send sources as special marker at end of stream
                    // Format: \n\n__SOURCES__:JSON
                    if (sources.length > 0) {
                        const sourcesMarker = `\n\n__SOURCES__:${JSON.stringify(sources)}`;
                        controller.enqueue(encoder.encode(sourcesMarker));
                    }

                    // Save assistant message after stream completes
                    await supabase.from("messages").insert({
                        conversation_id: convId,
                        role: "assistant",
                        content: fullResponse,
                        sources: JSON.stringify(sources),
                    } as { conversation_id: string; role: string; content: string; sources: string });

                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Conversation-Id": convId,
            },
        });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Chat failed" },
            { status: 500 }
        );
    }
}
