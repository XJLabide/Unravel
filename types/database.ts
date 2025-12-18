export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {

            projects: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    description: string | null;
                    document_count: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    description?: string | null;
                    document_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    description?: string | null;
                    document_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            documents: {
                Row: {
                    id: string;
                    project_id: string;
                    user_id: string;
                    file_name: string;
                    file_type: string;
                    file_size: number;
                    file_url: string;
                    status: "uploading" | "processing" | "ready" | "error";
                    error_message: string | null;
                    llama_file_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    user_id: string;
                    file_name: string;
                    file_type: string;
                    file_size: number;
                    file_url: string;
                    status?: "uploading" | "processing" | "ready" | "error";
                    error_message?: string | null;
                    llama_file_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    user_id?: string;
                    file_name?: string;
                    file_type?: string;
                    file_size?: number;
                    file_url?: string;
                    status?: "uploading" | "processing" | "ready" | "error";
                    error_message?: string | null;
                    llama_file_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            document_chunks: {
                Row: {
                    id: string;
                    document_id: string;
                    content: string;
                    page_number: number | null;
                    chunk_index: number;
                    embedding: number[] | null;
                    metadata: Json;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    document_id: string;
                    content: string;
                    page_number?: number | null;
                    chunk_index: number;
                    embedding?: number[] | null;
                    metadata?: Json;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    document_id?: string;
                    content?: string;
                    page_number?: number | null;
                    chunk_index?: number;
                    embedding?: number[] | null;
                    metadata?: Json;
                    created_at?: string;
                };
            };
            conversations: {
                Row: {
                    id: string;
                    project_id: string;
                    user_id: string;
                    title: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    user_id: string;
                    title?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    user_id?: string;
                    title?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            messages: {
                Row: {
                    id: string;
                    conversation_id: string;
                    role: "user" | "assistant";
                    content: string;
                    sources: Json;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    conversation_id: string;
                    role: "user" | "assistant";
                    content: string;
                    sources?: Json;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    conversation_id?: string;
                    role?: "user" | "assistant";
                    content?: string;
                    sources?: Json;
                    created_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            match_document_chunks: {
                Args: {
                    query_embedding: number[];
                    match_threshold: number;
                    match_count: number;
                    filter_project_id: string;
                };
                Returns: {
                    id: string;
                    document_id: string;
                    content: string;
                    page_number: number | null;
                    chunk_index: number;
                    similarity: number;
                    metadata: Json;
                }[];
            };
        };
        Enums: {
            [_ in never]: never;
        };
    };
}

// Convenience types
export type Tables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Update"];

export type Project = Tables<"projects">;
export type Document = Tables<"documents">;
export type Conversation = Tables<"conversations">;
export type Message = Tables<"messages">;
