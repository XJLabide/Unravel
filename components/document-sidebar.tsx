"use client";

import { useRef, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Table, FileCode, CheckCircle2, Loader2, X, FileSpreadsheet } from "lucide-react";
import { cn, formatFileSize, getFileExtension, getFileIcon } from "@/lib/utils";
import type { Document } from "@/types/database";

interface DocumentSidebarProps {
  selectedProjectId: string | null;
  documents: Document[];
  onUploadDocument: (file: File) => Promise<Document | null>;
  onRefreshDocuments: () => void;
}

const iconMap = {
  pdf: FileText,
  xlsx: Table,
  txt: FileText,
  json: FileCode,
  docx: FileText,
};

export function DocumentSidebar({
  selectedProjectId,
  documents,
  onUploadDocument,
}: DocumentSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const readyCount = documents.filter((d) => d.status === "ready").length;

  const handleFiles = useCallback(async (files: FileList) => {
    if (!selectedProjectId) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      await onUploadDocument(file);
    }
    setUploading(false);
  }, [selectedProjectId, onUploadDocument]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <aside className="w-80 shrink-0 bg-card border-l border-border flex flex-col sticky">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold mb-1">Documents</h2>
        <p className="text-xs text-muted-foreground">
          {readyCount} file{readyCount !== 1 ? "s" : ""} ready
        </p>
      </div>

      {/* Upload Area */}
      <div className="p-4 border-b border-border">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          multiple
          accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md,.json"
        />
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50",
            !selectedProjectId && "opacity-50 pointer-events-none"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileSelect}
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-primary" />
            )}
          </div>
          <p className="text-sm text-foreground mb-1">
            {uploading ? "Uploading..." : "Drop files here"}
          </p>
          <p className="text-xs text-muted-foreground mb-3">or click to browse</p>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            disabled={!selectedProjectId || uploading}
          >
            Select Files
          </Button>
        </div>
      </div>

      {/* Documents List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {!selectedProjectId ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Select a project to see documents
            </p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No documents yet. Upload some files to get started!
            </p>
          ) : (
            documents.map((doc) => {
              const iconType = getFileIcon(getFileExtension(doc.file_name));
              const Icon = iconMap[iconType] || FileText;

              return (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex-shrink-0 bg-primary/10 rounded flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{doc.file_name}</p>
                        {doc.status === "ready" && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                        {doc.status === "processing" && (
                          <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                        )}
                        {doc.status === "uploading" && (
                          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin flex-shrink-0" />
                        )}
                        {doc.status === "error" && (
                          <X className="w-4 h-4 text-destructive flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                      </p>
                      {doc.status === "processing" && (
                        <div className="mt-2">
                          <Progress value={50} className="h-1" />
                          <p className="text-xs text-muted-foreground mt-1">Processing...</p>
                        </div>
                      )}
                      {doc.status === "error" && doc.error_message && (
                        <p className="text-xs text-destructive mt-1">{doc.error_message}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Supported: PDF, DOCX, XLSX, CSV, TXT, MD, JSON
        </p>
      </div>
    </aside>
  );
}
