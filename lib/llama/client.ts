// LlamaCloud SDK Integration
// Uses llama-cloud-services for indexing and retrieval with direct API for uploads
import { LlamaCloudIndex, LlamaCloudRetriever } from "llama-cloud-services";
import {
    client,
    uploadFileApiV1FilesPost,
    addFilesToPipelineApiApiV1PipelinesPipelineIdFilesPut,
} from "llama-cloud-services/api";

// Environment configuration
const LLAMA_CLOUD_API_KEY = process.env.LLAMA_CLOUD_API_KEY!;
const LLAMA_CLOUD_BASE_URL = "https://api.cloud.llamaindex.ai/api/v1";
const LLAMA_CLOUD_PROJECT_NAME = process.env.LLAMA_CLOUD_PROJECT_NAME || "Default";
const LLAMA_CLOUD_INDEX_NAME = process.env.LLAMA_CLOUD_INDEX_NAME || "UNRAVEL";

// Configure the API client
client.setConfig({
    baseUrl: LLAMA_CLOUD_BASE_URL,
    headers: {
        "Authorization": `Bearer ${LLAMA_CLOUD_API_KEY}`,
    },
});

export interface QueryResult {
    content: string;
    score: number;
    metadata: Record<string, unknown>;
}

/**
 * Get the index name for a project
 */
function getIndexName(projectId?: string): string {
    return projectId
        ? `${LLAMA_CLOUD_INDEX_NAME}-${projectId}`
        : LLAMA_CLOUD_INDEX_NAME;
}

/**
 * Get or create a LlamaCloud index/pipeline
 * Returns the index instance with project and pipeline IDs available
 */
async function getOrCreateIndex(projectId?: string): Promise<LlamaCloudIndex> {
    const indexName = getIndexName(projectId);
    const huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;

    if (!huggingfaceApiKey) {
        throw new Error("HUGGINGFACE_API_KEY environment variable is required for embeddings");
    }

    const index = new LlamaCloudIndex({
        name: indexName,
        projectName: LLAMA_CLOUD_PROJECT_NAME,
        apiKey: LLAMA_CLOUD_API_KEY,
    });

    // Ensure the index/pipeline exists with proper embedding config
    await index.ensureIndex({
        embedding: {
            type: "HUGGINGFACE_API_EMBEDDING",
            component: {
                model_name: "BAAI/bge-small-en-v1.5",
                token: huggingfaceApiKey,
            },
        } as any, // Type assertion needed due to SDK type limitations
        transform: {
            mode: "auto",
            chunk_size: 1024,
            chunk_overlap: 200,
        } as any,
    });

    return index;
}

/**
 * Upload a file to LlamaCloud and add it to the index
 * Uses direct REST API to avoid SDK polling timeout issues
 * The file will be processed asynchronously by LlamaCloud
 */
export async function parseAndIndexDocument(
    file: Blob | Buffer,
    fileName: string,
    projectId?: string,
    metadata?: Record<string, unknown>
): Promise<{ documentId: string; chunksProcessed: number }> {
    try {
        // Get or create the index first
        const index = await getOrCreateIndex(projectId);

        // Get project and pipeline IDs from the index
        const pipelineId = await index.getPipelineId();
        const projectIdFromIndex = await index.getProjectId();

        // Convert Buffer/Blob to File with proper filename
        // Using File instead of Blob ensures LlamaCloud receives the correct filename
        let uploadFile: File;
        const mimeType = getMimeType(fileName);

        if (file instanceof Buffer) {
            const uint8Array = new Uint8Array(file);
            uploadFile = new File([uint8Array], fileName, { type: mimeType });
        } else if (file instanceof Blob) {
            // Convert Blob to File with proper name
            const arrayBuffer = await file.arrayBuffer();
            uploadFile = new File([arrayBuffer], fileName, { type: mimeType });
        } else {
            const uint8Array = new Uint8Array(file as unknown as ArrayBuffer);
            uploadFile = new File([uint8Array], fileName, { type: mimeType });
        }

        // Step 1: Upload file to LlamaCloud file storage
        console.log(`Uploading file ${fileName} to LlamaCloud...`);

        const uploadResponse = await uploadFileApiV1FilesPost({
            body: {
                upload_file: uploadFile,
            },
            query: {
                project_id: projectIdFromIndex,
            },
        });

        if (uploadResponse.error || !uploadResponse.data) {
            throw new Error(`Failed to upload file: ${JSON.stringify(uploadResponse.error)}`);
        }

        const llamaFileId = uploadResponse.data.id;
        console.log(`File uploaded with ID: ${llamaFileId}`);

        // Step 2: Add file to pipeline (this triggers processing)
        console.log(`Adding file to pipeline ${pipelineId}...`);

        try {
            const addResponse = await addFilesToPipelineApiApiV1PipelinesPipelineIdFilesPut({
                path: {
                    pipeline_id: pipelineId,
                },
                body: [
                    {
                        file_id: llamaFileId,
                        custom_metadata: {
                            ...metadata,
                            file_name: fileName,
                            project_id: projectId,
                        },
                    },
                ],
            });

            if (addResponse.error) {
                console.warn(`Warning adding file to pipeline: ${JSON.stringify(addResponse.error)}`);
                // Continue anyway - file is already uploaded
            } else {
                console.log(`File ${fileName} successfully added to pipeline.`);
            }
        } catch (addError) {
            // Log but don't throw - the file is already uploaded to LlamaCloud
            console.warn(`Warning: Failed to add file to pipeline (file still uploaded): ${addError}`);
        }

        console.log(`File ${fileName} upload complete. Processing will continue in background.`);

        return {
            documentId: llamaFileId,
            chunksProcessed: 1, // File-based upload
        };
    } catch (error) {
        console.error("LlamaCloud parse and index error:", error);
        throw new Error(`Failed to parse and index document: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Get MIME type from file extension
 */
function getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'txt': 'text/plain',
        'md': 'text/markdown',
        'csv': 'text/csv',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Query documents from a LlamaCloud index
 * Uses the SDK retriever for proper semantic search
 */
export async function queryIndex(
    query: string,
    projectId?: string,
    topK: number = 5
): Promise<QueryResult[]> {
    try {
        const indexName = getIndexName(projectId);
        console.log("[queryIndex] Starting query for project:", projectId);
        console.log("[queryIndex] Using index name:", indexName);

        // Add timeout to prevent infinite hang
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("LlamaCloud query timeout after 30s")), 30000);
        });

        const queryPromise = (async () => {
            console.log("[queryIndex] Getting/creating index...");
            const index = await getOrCreateIndex(projectId);
            console.log("[queryIndex] Index ready, creating retriever...");

            const retriever = index.asRetriever({
                similarityTopK: topK,
            }) as LlamaCloudRetriever;

            console.log("[queryIndex] Retrieving results for query:", query);
            const results = await retriever.retrieve({ query });
            console.log("[queryIndex] Got", results.length, "results");

            if (results.length === 0) {
                console.log("[queryIndex] WARNING: No results returned. Index may be empty or documents not processed yet.");
            }

            return results.map((result) => {
                const nodeMetadata = result.node.metadata || {};
                // Build robust metadata with fallback chain for file_name
                const enhancedMetadata: Record<string, unknown> = {
                    ...nodeMetadata,
                    // Fallback chain: custom_metadata.file_name > file_name > source node > default
                    file_name:
                        (nodeMetadata.custom_metadata as Record<string, unknown>)?.file_name ||
                        nodeMetadata.file_name ||
                        (result.node as any).sourceNode?.metadata?.file_name ||
                        nodeMetadata['file name'] ||
                        "Unknown Document",
                };

                return {
                    content: (result.node as any).text || (result.node as any).content || "",
                    score: result.score || 0,
                    metadata: enhancedMetadata,
                };
            });
        })();

        return await Promise.race([queryPromise, timeoutPromise]);
    } catch (error) {
        console.error("[queryIndex] LlamaCloud query error:", error);
        return [];
    }
}

/**
 * Delete a document from the index
 */
export async function deleteDocument(
    documentId: string,
    projectId?: string
): Promise<void> {
    try {
        const index = await getOrCreateIndex(projectId);
        // Use the index's delete method with the document ID
        // Note: LlamaCloud may require different deletion approach
        await (index as any).deleteRefDoc(documentId, true);
    } catch (error) {
        console.error("LlamaCloud delete error:", error);
        throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

// ============================================
// Legacy functions for backwards compatibility
// ============================================

/**
 * @deprecated Use parseAndIndexDocument instead
 * Upload a document to LlamaCloud for parsing (legacy)
 */
export async function uploadToLlamaCloud(
    indexName: string,
    file: Blob,
    fileName: string
): Promise<{ id: string }> {
    console.warn("uploadToLlamaCloud is deprecated. Use parseAndIndexDocument instead.");

    const result = await parseAndIndexDocument(file, fileName);
    return { id: result.documentId };
}

/**
 * @deprecated Parsing is now handled automatically by parseAndIndexDocument
 */
export async function getParsingStatus(jobId: string): Promise<{ status: string; error?: string }> {
    console.warn("getParsingStatus is deprecated. Parsing is now handled automatically.");
    return { status: "SUCCESS" };
}

/**
 * @deprecated Parsing is now handled automatically by parseAndIndexDocument
 */
export async function getParsingResult(jobId: string): Promise<{ pages?: unknown[] }> {
    console.warn("getParsingResult is deprecated. Parsing is now handled automatically.");
    return { pages: [] };
}
