"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Sparkles, FileText, User, Loader2, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Message } from "@/types/database";

interface ChatAreaProps {
  selectedProjectId: string | null;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
}

export function ChatArea({ selectedProjectId, messages, onSendMessage }: ChatAreaProps) {
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
      {/* Messages Area - Native Scroll */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
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
                    <div className="flex-1">
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content || (
                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Thinking...
                            </span>
                          )}
                        </p>
                      </div>
                      {/* Source citations */}
                      {Array.isArray(message.sources) && message.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(message.sources as { fileName: string; content?: string }[]).map(
                            (source, idx) => (
                              <button
                                key={idx}
                                className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs hover:bg-muted transition-colors"
                              >
                                <FileText className="w-3 h-3 text-muted-foreground" />
                                <span className="text-foreground">{source.fileName}</span>
                              </button>
                            )
                          )}
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
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                <Paperclip className="w-4 h-4" />
              </Button>
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
