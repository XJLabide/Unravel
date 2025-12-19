"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Plus,
  FileText,
  Layers,
  MoreHorizontal,
  Trash2,
  Loader2,
  LogOut,
  MessageSquare,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import type { Project, Conversation } from "@/types/database";

interface ProjectSidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  selectedConversationId: string | null;
  onSelectProject: (id: string) => void;
  onSelectConversation: (conversationId: string, projectId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
  onCreateProject: (name: string) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  refreshTrigger?: number; // Increment to force refresh
}

export function ProjectSidebar({
  projects,
  selectedProjectId,
  selectedConversationId,
  onSelectProject,
  onSelectConversation,
  onDeleteConversation,
  onCreateProject,
  onDeleteProject,
  refreshTrigger,
  isMobileMenuOpen,
  onToggleMobileMenu,
}: ProjectSidebarProps) {
  const { user, signOut } = useAuth();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [projectConversations, setProjectConversations] = useState<Record<string, Conversation[]>>({});
  const [loadingConversations, setLoadingConversations] = useState<Record<string, boolean>>({});

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  // Project Deletion
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Conversation Deletion
  const [deleteConvDialogOpen, setDeleteConvDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);

  // Project Rename
  const [renameProjectDialogOpen, setRenameProjectDialogOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);
  const [newProjectRename, setNewProjectRename] = useState("");
  const [renaming, setRenaming] = useState(false);

  // Conversation Rename
  const [renameConvDialogOpen, setRenameConvDialogOpen] = useState(false);
  const [conversationToRename, setConversationToRename] = useState<Conversation | null>(null);
  const [newConvRename, setNewConvRename] = useState("");

  const [deleting, setDeleting] = useState(false);

  // Auto-expand selected project
  useEffect(() => {
    if (selectedProjectId && !expandedProjects.has(selectedProjectId)) {
      fetchConversations(selectedProjectId);
      setExpandedProjects(prev => new Set(prev).add(selectedProjectId));
    }
  }, [selectedProjectId]);

  // Refresh conversations when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && selectedProjectId) {
      // Force refresh by clearing the loading state
      setLoadingConversations(prev => ({ ...prev, [selectedProjectId]: false }));
      fetchConversations(selectedProjectId);
    }
  }, [refreshTrigger]);

  const fetchConversations = async (projectId: string) => {
    if (loadingConversations[projectId]) return;

    setLoadingConversations(prev => ({ ...prev, [projectId]: true }));
    try {
      const res = await fetch(`/api/projects/${projectId}/conversations`);
      if (res.ok) {
        const data = await res.json();
        setProjectConversations(prev => ({ ...prev, [projectId]: data }));
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoadingConversations(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const toggleProject = async (id: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      // Fetch conversations when expanding
      if (!projectConversations[id]) {
        await fetchConversations(id);
      }
    }
    setExpandedProjects(newExpanded);

    // Select project when toggling if not already selected
    if (selectedProjectId !== id) {
      onSelectProject(id);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    await onCreateProject(newProjectName.trim());
    setCreating(false);
    setNewProjectName("");
    setCreateDialogOpen(false);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    await onDeleteProject(projectToDelete.id);
    setDeleting(false);
    setProjectToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/conversations/${conversationToDelete.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        // Update local state
        const projectId = conversationToDelete.project_id;
        setProjectConversations(prev => ({
          ...prev,
          [projectId]: prev[projectId]?.filter(c => c.id !== conversationToDelete.id) || []
        }));

        // Notify parent
        if (onDeleteConversation) {
          onDeleteConversation(conversationToDelete.id);
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    } finally {
      setDeleting(false);
      setConversationToDelete(null);
      setDeleteConvDialogOpen(false);
    }
  };

  // Rename project handler
  const handleRenameProject = async () => {
    if (!projectToRename || !newProjectRename.trim()) return;
    setRenaming(true);

    try {
      const res = await fetch(`/api/projects/${projectToRename.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectRename.trim() }),
      });

      if (res.ok) {
        // Refresh will happen via parent component
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to rename project:", error);
    } finally {
      setRenaming(false);
      setProjectToRename(null);
      setNewProjectRename("");
      setRenameProjectDialogOpen(false);
    }
  };

  // Rename conversation handler
  const handleRenameConversation = async () => {
    if (!conversationToRename || !newConvRename.trim()) return;
    setRenaming(true);

    try {
      const res = await fetch(`/api/conversations/${conversationToRename.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newConvRename.trim() }),
      });

      if (res.ok) {
        // Update local state
        const projectId = conversationToRename.project_id;
        setProjectConversations(prev => ({
          ...prev,
          [projectId]: prev[projectId]?.map(c =>
            c.id === conversationToRename.id
              ? { ...c, title: newConvRename.trim() }
              : c
          ) || []
        }));
      }
    } catch (error) {
      console.error("Failed to rename conversation:", error);
    } finally {
      setRenaming(false);
      setConversationToRename(null);
      setNewConvRename("");
      setRenameConvDialogOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggleMobileMenu}
        />
      )}

      <aside className={cn(
        "w-72 shrink-0 bg-card border-r border-border flex flex-col sticky z-50",
        // Mobile: fixed overlay, hidden by default
        "fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">Unravel</span>
          </div>
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Projects List */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Projects
            </div>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No projects yet. Create one to get started!
              </p>
            ) : (
              <div className="space-y-1">
                {projects.map((project) => (
                  <div key={project.id} className="group">
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                        selectedProjectId === project.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-foreground"
                      )}
                      onClick={() => toggleProject(project.id)}
                    >
                      {expandedProjects.has(project.id) ? (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      )}
                      <FolderOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left truncate">{project.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {projectConversations[project.id]?.length || 0}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToRename(project);
                              setNewProjectRename(project.name);
                              setRenameProjectDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToDelete(project);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Conversations List */}
                    {expandedProjects.has(project.id) && (
                      <div className="ml-4 border-l border-border pl-2 mt-1 space-y-0.5 pr-1">
                        {/* New Chat Button */}
                        <div
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                            (selectedProjectId === project.id && !selectedConversationId)
                              ? "bg-muted font-medium"
                              : "hover:bg-muted/50 text-muted-foreground"
                          )}
                          onClick={() => onSelectProject(project.id)} // Select project = new chat
                        >
                          <Plus className="w-3 h-3" />
                          <span>New Chat</span>
                        </div>

                        {/* Loading State */}
                        {loadingConversations[project.id] && !projectConversations[project.id] && (
                          <div className="px-3 py-2 text-xs text-muted-foreground flex items-center">
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Loading...
                          </div>
                        )}

                        {/* Conversations */}
                        {projectConversations[project.id]?.map(conv => (
                          <div
                            key={conv.id}
                            className={cn(
                              "flex items-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors cursor-pointer group/conv",
                              selectedConversationId === conv.id
                                ? "bg-muted font-medium text-foreground"
                                : "hover:bg-muted/50 text-muted-foreground"
                            )}
                            onClick={() => onSelectConversation(conv.id, project.id)}
                          >
                            <MessageSquare className="w-3 h-3 flex-shrink-0" />
                            {/* Title wrapper - this div grows to fill space and clips overflow */}
                            <div className="flex-1 overflow-hidden">
                              <span className="block truncate text-sm">
                                {conv.title || "New Conversation"}
                              </span>
                            </div>
                            {/* Button - always at fixed position on right */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 flex-shrink-0 opacity-70 hover:opacity-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConversationToRename(conv);
                                    setNewConvRename(conv.title || "");
                                    setRenameConvDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConversationToDelete(conv);
                                    setDeleteConvDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer ... remains same */}
        <div className="p-4 border-t border-border space-y-2">
          {user && (
            <p className="text-xs text-muted-foreground truncate px-2">
              {user.email}
            </p>
          )}
          <Link href="/docs">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Docs
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Project Dialogs ... */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        {/* ... content same ... */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Projects help you organize documents and conversations by topic.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Project name (e.g., Thesis Research)"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateProject();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={creating || !newProjectName.trim()}>
              {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{projectToDelete?.name}&quot;? This will also
              delete all documents and conversations in this project. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Conversation Dialog */}
      <Dialog open={deleteConvDialogOpen} onOpenChange={setDeleteConvDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{conversationToDelete?.title || "this conversation"}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConvDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConversation} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={renameProjectDialogOpen} onOpenChange={setRenameProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for this project.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newProjectRename}
            onChange={(e) => setNewProjectRename(e.target.value)}
            placeholder="Project name"
            onKeyDown={(e) => e.key === "Enter" && handleRenameProject()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameProject} disabled={renaming || !newProjectRename.trim()}>
              {renaming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Conversation Dialog */}
      <Dialog open={renameConvDialogOpen} onOpenChange={setRenameConvDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
            <DialogDescription>
              Enter a new name for this conversation.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newConvRename}
            onChange={(e) => setNewConvRename(e.target.value)}
            placeholder="Conversation name"
            onKeyDown={(e) => e.key === "Enter" && handleRenameConversation()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameConvDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameConversation} disabled={renaming || !newConvRename.trim()}>
              {renaming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
