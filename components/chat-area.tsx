"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, FileText, User, Loader2, MessageSquare, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Message } from "@/types/database";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatAreaProps {
  selectedProjectId: string | null;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  onToggleMobileMenu?: () => void;
  isLoadingMessages?: boolean;
}

export function ChatArea({ selectedProjectId, messages, onSendMessage, onToggleMobileMenu, isLoadingMessages }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!input.trim() || sending || !selectedProjectId) return;

    const message = input.trim();
    setInput("");
    setSending(true);

    // Scroll to bottom when sending
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      await onSendMessage(message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedProjectId) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Unravel</h2>
          <p className="text-muted-foreground">
            Select or create a project from the sidebar to start chatting with your documents.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobileMenu}
          className="shrink-0"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <span className="font-semibold">Unravel</span>
      </div>

      {/* Messages Area - Native Scroll */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {isLoadingMessages ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Upload documents to this project and ask questions. The AI will
                answer based solely on your uploaded content.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-4">
                {message.role === "user" ? (
                  <>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-muted">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-primary/10 rounded-2xl rounded-tl-sm px-4 py-3 inline-block max-w-full">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      {/* Message Bubble */}
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                        {message.content ? (
                          <div className="prose prose-sm prose-invert max-w-none text-foreground">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                // Style markdown elements
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                                code: ({ className, children }) => {
                                  const isInline = !className;
                                  return isInline ? (
                                    <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                                  ) : (
                                    <code className="block bg-background/50 p-3 rounded-lg text-xs font-mono overflow-x-auto my-2">{children}</code>
                                  );
                                },
                                pre: ({ children }) => <pre className="bg-background/50 p-3 rounded-lg overflow-x-auto my-2">{children}</pre>,
                                a: ({ href, children }) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/50 pl-3 italic my-2">{children}</blockquote>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-muted-foreground text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Thinking...
                          </span>
                        )}
                      </div>
                      {/* Source Citations - Separate Container */}
                      {Array.isArray(message.sources) &&
                        message.sources.length > 0 &&
                        (message.sources as { fileName: string }[]).some(s => s?.fileName) && (
                          <div className="bg-card/50 border border-border rounded-xl px-3 py-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">Sources:</span>
                              {(message.sources as { fileName: string; content?: string }[])
                                .filter(source => source?.fileName)
                                .map((source, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md text-xs text-foreground"
                                  >
                                    <FileText className="w-3 h-3 text-muted-foreground" />
                                    {source.fileName}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
          {/* Scroll Anchor */}
          <div ref={bottomRef} className="h-4 w-full" />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card">
        <div className="max-w-3xl mx-auto p-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              className="min-h-[60px] pr-24 resize-none bg-background"
              disabled={sending}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              <Button
                size="icon"
                className="h-8 w-8 bg-primary hover:bg-primary/90"
                onClick={handleSend}
                disabled={!input.trim() || sending}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            All responses are based solely on your uploaded documents
          </p>
        </div>
      </div>
    </main>
  );
}
