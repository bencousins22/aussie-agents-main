import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Edit3, Play, Square, X, Check } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { agentZeroApi } from "../../lib/agentZeroApi";
import { cn } from "../../lib/utils";
import { SkeletonList } from "../ui/Skeleton";

type Project = {
  name: string;
  title?: string;
  description?: string;
  color?: string;
  active?: boolean;
  [k: string]: unknown;
};

export function ProjectsModal({
  open,
  onClose,
  activeContext,
}: {
  open: boolean;
  onClose: () => void;
  activeContext: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "" });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await agentZeroApi.projects("list");
      if (res?.ok) {
        setProjects((res.data || []) as Project[]);
      } else {
        // Handle directory not found error gracefully
        if (res?.error?.includes("No such file or directory") || res?.error?.includes("projects")) {
          setError("Projects directory not found. Please create the projects directory to use this feature.");
        } else {
          setError(res?.error || "Failed to load projects");
        }
      }
    } catch (e) {
      const errorMsg = (e as Error)?.message || "Failed to load projects";
      if (errorMsg.includes("No such file or directory") || errorMsg.includes("projects")) {
        setError("Projects directory not found. Please create the projects directory to use this feature.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    load();
  }, [open]);

  async function handleActivate(name: string) {
    setActionLoading(name);
    try {
      const res = await agentZeroApi.projects("activate", { context_id: activeContext, name });
      if (res?.ok) {
        await load();
      } else {
        // Handle directory not found error gracefully
        if (res?.error?.includes("No such file or directory") || res?.error?.includes("projects")) {
          setError("Projects directory not found. Please create the projects directory to use this feature.");
        } else {
          setError(res?.error || "Failed to activate project");
        }
      }
    } catch (e) {
      const errorMsg = (e as Error)?.message || "Failed to activate project";
      if (errorMsg.includes("No such file or directory") || errorMsg.includes("projects")) {
        setError("Projects directory not found. Please create the projects directory to use this feature.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeactivate() {
    if (!activeContext) return;
    setActionLoading("deactivate");
    try {
      const res = await agentZeroApi.projects("deactivate", { context_id: activeContext });
      if (res?.ok) {
        await load();
      } else {
        // Handle directory not found error gracefully
        if (res?.error?.includes("No such file or directory") || res?.error?.includes("projects")) {
          setError("Projects directory not found. Please create the projects directory to use this feature.");
        } else {
          setError(res?.error || "Failed to deactivate project");
        }
      }
    } catch (e) {
      const errorMsg = (e as Error)?.message || "Failed to deactivate project";
      if (errorMsg.includes("No such file or directory") || errorMsg.includes("projects")) {
        setError("Projects directory not found. Please create the projects directory to use this feature.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreateProject() {
    if (!newProject.title.trim()) return;
    setActionLoading("create");
    try {
      const res = await agentZeroApi.projects("create", {
        project: {
          title: newProject.title.trim(),
          description: newProject.description.trim(),
        },
      });
      if (res?.ok) {
        setCreating(false);
        setNewProject({ title: "", description: "" });
        await load();
      } else {
        // Handle directory not found error gracefully
        if (res?.error?.includes("No such file or directory") || res?.error?.includes("projects")) {
          setError("Projects directory not found. Please create the projects directory to use this feature.");
        } else {
          setError(res?.error || "Failed to create project");
        }
      }
    } catch (e) {
      const errorMsg = (e as Error)?.message || "Failed to create project";
      if (errorMsg.includes("No such file or directory") || errorMsg.includes("projects")) {
        setError("Projects directory not found. Please create the projects directory to use this feature.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`Delete project "${name}"? This cannot be undone.`)) return;
    setActionLoading(name);
    try {
      const res = await agentZeroApi.projects("delete", { name });
      if (res?.ok) {
        await load();
      } else {
        // Handle directory not found error gracefully
        if (res?.error?.includes("No such file or directory") || res?.error?.includes("projects")) {
          setError("Projects directory not found. Please create the projects directory to use this feature.");
        } else {
          setError(res?.error || "Failed to delete project");
        }
      }
    } catch (e) {
      const errorMsg = (e as Error)?.message || "Failed to delete project";
      if (errorMsg.includes("No such file or directory") || errorMsg.includes("projects")) {
        setError("Projects directory not found. Please create the projects directory to use this feature.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      widthClassName="max-w-4xl"
      title={
        <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
          Aussie Agents Projects
        </span>
      }
    >
      <div className="p-5 space-y-4">
        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <div className="flex items-center justify-between">
          <div className="text-xs text-white/50">
            Projects are isolated workspaces with their own memory and files.
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-black/20 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Edit3 className="size-4" />}
            Refresh
          </button>
        </div>

        <div className="grid gap-3">
          {loading ? (
            <SkeletonList items={3} />
          ) : (
            projects.map((proj) => (
            <div
              key={proj.name}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                proj.active
                  ? "border-emerald-400/30 bg-emerald-500/10"
                  : "border-zinc-800 bg-black/20"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: proj.color || "#06d6a0" }}
                    />
                    <span className="font-medium text-white truncate">{proj.title || proj.name}</span>
                    {proj.active && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </div>
                  <div className="text-xs text-white/50 mb-2">{proj.name}</div>
                  {proj.description ? (
                    <div className="text-sm text-white/70">{proj.description}</div>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  {!proj.active ? (
                    <button
                      type="button"
                      onClick={() => handleActivate(proj.name)}
                      disabled={actionLoading === proj.name}
                      className="size-8 grid place-items-center rounded-lg text-white/50 hover:text-white hover:bg-zinc-800 disabled:opacity-50"
                      title="Activate"
                    >
                      {actionLoading === proj.name ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDeactivate}
                      disabled={actionLoading === "deactivate"}
                      className="size-8 grid place-items-center rounded-lg text-white/50 hover:text-white hover:bg-zinc-800 disabled:opacity-50"
                      title="Deactivate"
                    >
                      {actionLoading === "deactivate" ? <Loader2 className="size-4 animate-spin" /> : <Square className="size-4" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(proj.name)}
                    disabled={actionLoading === proj.name}
                    className="size-8 grid place-items-center rounded-lg text-white/50 hover:text-white hover:bg-zinc-800 disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
          )}

          {!loading && projects.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-sm text-white/40 mb-2">No projects yet</div>
              <div className="text-xs text-white/30">
                Create a project to organize your work with isolated memory and files.
              </div>
            </div>
          ) : null}
          
          {/* Error message with help */}
          {error && error.includes("Projects directory not found") && (
            <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
              <div className="text-sm text-amber-300 font-medium mb-2">Setup Required</div>
              <div className="text-xs text-amber-200/80 space-y-1">
                <p>To use projects, create the projects directory:</p>
                <code className="block p-2 bg-black/30 rounded text-xs font-mono text-amber-300">
                  mkdir -p /a0/usr/projects
                </code>
                <p className="text-amber-200/60">Then restart the application.</p>
              </div>
            </div>
          )}
        </div>

        {/* Create Project Section */}
        <div className="pt-3 border-t border-zinc-800">
          {!creating ? (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 bg-black/20 text-sm text-white/70 hover:text-white hover:bg-zinc-800"
            >
              <Plus className="size-4" />
              Create Project
            </button>
          ) : (
            <div className="space-y-3 p-3 border border-zinc-800 rounded-xl bg-black/20">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">New Project</h3>
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setNewProject({ title: "", description: "" });
                  }}
                  className="size-6 grid place-items-center rounded text-white/50 hover:text-white hover:bg-zinc-800"
                >
                  <X className="size-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Project title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-black/30 text-sm text-white placeholder:text-white/40 outline-none focus:border-emerald-400/40"
              />
              <textarea
                placeholder="Description (optional)"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-black/30 text-sm text-white placeholder:text-white/40 outline-none focus:border-emerald-400/40 resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setNewProject({ title: "", description: "" });
                  }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-800 text-sm text-white/60 hover:text-white hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateProject}
                  disabled={!newProject.title.trim() || actionLoading === "create"}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {actionLoading === "create" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
