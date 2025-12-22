"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProjectSidebar } from "./project-sidebar";
import { ChatArea } from "./chat-area";
import { DocumentSidebar } from "./document-sidebar";
import { useAuth } from "@/contexts/auth-context";
import type { Project, Document, Message } from "@/types/database";
import { Loader2, Layers } from "lucide-react";

export function ChatInterface() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  // Fetch documents for selected project
  const fetchDocuments = useCallback(async () => {
    if (!selectedProjectId) {
      setDocuments([]);
      return;
    }
    setLoadingDocuments(true);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoadingDocuments(false);
    }
  }, [selectedProjectId]);

  // Fetch conversation messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  useEffect(() => {
    fetchDocuments();
    // Do not reset conversation here - handled by selection handlers
  }, [selectedProjectId, fetchDocuments]);

  useEffect(() => {
    fetchMessages();
  }, [conversationId, fetchMessages]);

  // Handle project selection
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setConversationId(null);
    setMessages([]);
  };

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string, projectId: string) => {
    if (selectedProjectId !== projectId) {
      setSelectedProjectId(projectId);
    }
    setConversationId(conversationId);
  };

  // Create project
  const handleCreateProject = async (name: string) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const newProject = await res.json();
        setProjects([newProject, ...projects]);
        handleSelectProject(newProject.id);
      } else {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to create project:", res.status, errorData);
        alert(`Failed to create project: ${errorData.error || res.statusText}`);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      alert(`Failed to create project: ${error instanceof Error ? error.message : "Network error"}`);
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== projectId));
        if (selectedProjectId === projectId) {
          const nextProject = projects.find((p) => p.id !== projectId);
          if (nextProject) {
            handleSelectProject(nextProject.id);
          } else {
            setSelectedProjectId(null);
            setConversationId(null);
            setMessages([]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  // Upload document
  const handleUploadDocument = async (file: File) => {
    if (!selectedProjectId) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", selectedProjectId);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const newDoc = await res.json();
        setDocuments([newDoc, ...documents]);

        // Trigger ingestion
        fetch("/api/documents/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: newDoc.id }),
        }).then(() => {
          // Refresh documents after ingestion
          fetchDocuments();
        });

        return newDoc;
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
    }
    return null;
  };

  // Send chat message
  const handleSendMessage = async (content: string) => {
    if (!selectedProjectId) return;

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId || "",
      role: "user",
      content,
      sources: [],
      created_at: new Date().toISOString(),
    };

    // Add thinking message immediately
    const thinkingMsgId = crypto.randomUUID();
    const thinkingMsg: Message = {
      id: thinkingMsgId,
      conversation_id: conversationId || "",
      role: "assistant",
      content: "", // Empty content triggers "Thinking..." in UI
      sources: [],
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg, thinkingMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          projectId: selectedProjectId,
          conversationId,
        }),
      });

      if (!res.ok) {
        // Handle API error - show error message to user
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        const errorMessage = errorData.error || `Request failed with status ${res.status}`;

        // Replace thinking message with error
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.id === thinkingMsgId) {
            lastMsg.content = `⚠️ Error: ${errorMessage}`;
          }
          return updated;
        });
        return;
      }

      // Get conversation ID from header
      const newConvId = res.headers.get("X-Conversation-Id");
      if (newConvId && !conversationId) {
        setConversationId(newConvId);
        // Trigger a refresh of the sidebar to show new conversation
        setSidebarRefreshTrigger(prev => prev + 1);
      }

      // Stream response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let parsedSources: { fileName: string; content?: string }[] = [];

      console.log("[Frontend] Starting to read stream...");

      while (reader) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("[Frontend] Stream done, final content:", assistantContent);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log("[Frontend] Raw chunk received:", chunk);

        assistantContent += chunk;

        // Check for sources marker at the end
        let displayContent = assistantContent;
        const sourcesMarker = "\n\n__SOURCES__:";
        const sourcesIndex = assistantContent.indexOf(sourcesMarker);

        if (sourcesIndex !== -1) {
          displayContent = assistantContent.substring(0, sourcesIndex);
          const sourcesJson = assistantContent.substring(sourcesIndex + sourcesMarker.length);
          try {
            parsedSources = JSON.parse(sourcesJson);
            console.log("[Frontend] Parsed sources:", parsedSources);
          } catch {
            // Still streaming sources JSON, wait for complete
          }
        }

        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.role === "assistant") {
            lastMsg.content = displayContent;
            if (parsedSources.length > 0) {
              lastMsg.sources = parsedSources;
            }
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Show error message to user
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversationId || "",
        role: "assistant",
        content: `⚠️ Error: ${error instanceof Error ? error.message : "Failed to send message. Please try again."}`,
        sources: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Handle conversation deletion
  const handleDeleteConversation = (deletedConvId: string) => {
    if (conversationId === deletedConvId) {
      setConversationId(null);
      setMessages([]);
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocuments(documents.filter((d) => d.id !== documentId));
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Layers className="w-8 h-8 text-primary" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar - Projects */}
      <ProjectSidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        selectedConversationId={conversationId}
        onSelectProject={handleSelectProject}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        refreshTrigger={sidebarRefreshTrigger}
      />

      {/* Main Chat Area */}
      <ChatArea
        selectedProjectId={selectedProjectId}
        messages={messages}
        onSendMessage={handleSendMessage}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isLoadingMessages={loadingMessages}
      />

      {/* Right Sidebar - Documents */}
      <DocumentSidebar
        selectedProjectId={selectedProjectId}
        documents={documents}
        onUploadDocument={handleUploadDocument}
        onRefreshDocuments={fetchDocuments}
        onDeleteDocument={handleDeleteDocument}
        isLoadingDocuments={loadingDocuments}
      />
    </div>
  );
}
