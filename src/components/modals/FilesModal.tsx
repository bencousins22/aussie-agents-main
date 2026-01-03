import { useEffect, useMemo, useState } from "react";
import { Folder, FileText, Upload, Download, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { agentZeroApi } from "../../lib/agentZeroApi";
import { cn } from "../../lib/utils";

type FileNode = {
  name: string;
  path: string;
  is_dir?: boolean;
  size?: number;
  modified?: number;
  [k: string]: unknown;
};

export function FilesModal({
  open,
  onClose,
  activeContext,
}: {
  open: boolean;
  onClose: () => void;
  activeContext: string | null;
}) {
  const [rootPath, setRootPath] = useState<string>("/");
  const [cwd, setCwd] = useState<string>("/");
  const [items, setItems] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGoUp = useMemo(() => cwd !== rootPath && cwd !== "/", [cwd, rootPath]);

  async function loadDir(path: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await agentZeroApi.getWorkDirFiles(path);
      const list: FileNode[] = (res?.data || []) as FileNode[];
      const mapped: FileNode[] = list.map((it) => ({
        name: String(it.name || it.file_name || it.path?.split("/").pop() || "(unknown)"),
        path: String(it.path || it.abs_path || it.name || ""),
        is_dir: Boolean(it.is_dir ?? it.dir ?? it.type === "dir"),
        size: Number(it.size) || 0,
        modified: Number(it.modified) || 0,
      }));
      // directories first
      mapped.sort((a, b) => Number(Boolean(b.is_dir)) - Number(Boolean(a.is_dir)) || a.name.localeCompare(b.name));
      setItems(mapped);
      setCwd(path);
    } catch (e) {
      const errorMsg = (e as Error)?.message || "Failed to load directory";
      if (errorMsg.includes('Unexpected token') || errorMsg.includes('<!doctype')) {
        setError('Files endpoint not available. The backend may not be configured for file operations.');
      } else {
        setError(errorMsg);
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const init = async () => {
      setError(null);
      try {
        if (activeContext) {
          try {
            const res = await agentZeroApi.chatFilesPathGet(activeContext);
            const p = res?.ok && res.path ? String(res.path) : "/";
            if (!cancelled) {
              setRootPath(p);
              await loadDir(p);
            }
          } catch (e) {
            const errorMsg = (e as Error)?.message || "Failed to get chat files path";
            if (errorMsg.includes('Unexpected token') || errorMsg.includes('<!doctype')) {
              setError('Files endpoint not available. The backend may not be configured for file operations.');
            } else {
              setError('Failed to get chat files path: ' + errorMsg);
            }
            if (!cancelled) {
              setRootPath("/");
              await loadDir("/");
            }
          }
          return;
        }
      } catch {
        // ignore
      }
      if (!cancelled) {
        setRootPath("/");
        await loadDir("/");
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [open, activeContext]);

  async function handleUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files?.length) return;
      try {
        await agentZeroApi.uploadWorkDirFiles({ path: cwd, files: Array.from(files) });
        await loadDir(cwd);
      } catch (err) {
        const errorMsg = (err as Error)?.message || "Upload failed";
        if (errorMsg.includes('Unexpected token') || errorMsg.includes('<!doctype')) {
          setError('Files endpoint not available. The backend may not be configured for file operations.');
        } else {
          setError('Upload failed: ' + errorMsg);
        }
      }
    };
    input.click();
  }

  async function handleDownload(node: FileNode) {
    try {
      const blob = await agentZeroApi.downloadWorkDirFile(node.path);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = node.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      const errorMsg = (e as Error)?.message || "Download failed";
      if (errorMsg.includes('Unexpected token') || errorMsg.includes('<!doctype')) {
        setError('Files endpoint not available. The backend may not be configured for file operations.');
      } else {
        setError('Download failed: ' + errorMsg);
      }
    }
  }

  async function handleDelete(node: FileNode) {
    if (!confirm(`Delete ${node.name}?`)) return;
    try {
      await agentZeroApi.deleteWorkDirFile({ path: node.path, currentPath: cwd });
      await loadDir(cwd);
    } catch (e) {
      const errorMsg = (e as Error)?.message || "Delete failed";
      if (errorMsg.includes('Unexpected token') || errorMsg.includes('<!doctype')) {
        setError('Files endpoint not available. The backend may not be configured for file operations.');
      } else {
        setError('Delete failed: ' + errorMsg);
      }
    }
  }

  function goUp() {
    const parts = cwd.split("/").filter(Boolean);
    parts.pop();
    const next = "/" + parts.join("/");
    loadDir(next === "" ? "/" : next);
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      widthClassName="max-w-6xl"
      title={
        <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
          Aussie Agents Files
        </span>
      }
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="text-xs text-white/40">Current path</div>
            <div className="text-sm text-white/80 truncate">{cwd}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goUp()}
              disabled={!canGoUp}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-black/20 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-zinc-800",
                !canGoUp && "opacity-50 cursor-not-allowed"
              )}
            >
              <ArrowLeft className="size-4" />
              Up
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-500/20"
            >
              <Upload className="size-4" />
              Upload
            </button>
          </div>
        </div>

        {error ? <div className="mb-3 text-sm text-red-400">{error}</div> : null}

        {loading ? (
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </div>
        ) : null}

        <div className="rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_120px] gap-2 px-4 py-2 border-b border-zinc-800 text-xs text-white/40 bg-zinc-950/40">
            <div>Name</div>
            <div className="text-right">Size</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="divide-y divide-zinc-800">
            {items.map((it) => (
              <div key={it.path} className="grid grid-cols-[1fr_120px_120px] gap-2 px-4 py-2 items-center bg-black/20">
                <button
                  type="button"
                  className="flex items-center gap-2 min-w-0 text-left text-sm text-white/75 hover:text-white"
                  onClick={() => {
                    if (it.is_dir) loadDir(it.path);
                  }}
                  disabled={!it.is_dir}
                >
                  {it.is_dir ? (
                    <Folder className="size-4 text-emerald-400" />
                  ) : (
                    <FileText className="size-4 text-white/40" />
                  )}
                  <span className="truncate">{it.name}</span>
                </button>
                <div className="text-right text-xs text-white/40">
                  {it.is_dir ? "—" : typeof it.size === "number" ? formatBytes(it.size) : ""}
                </div>
                <div className="flex items-center justify-end gap-2">
                  {!it.is_dir ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(it)}
                      className="size-8 grid place-items-center rounded-lg text-white/50 hover:text-white hover:bg-zinc-800"
                      title="Download"
                    >
                      <Download className="size-4" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDelete(it)}
                    className="size-8 grid place-items-center rounded-lg text-white/50 hover:text-white hover:bg-zinc-800"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}

            {!loading && items.length === 0 ? (
              <div className="px-4 py-6 text-sm text-white/40">Empty directory.</div>
            ) : null}
          </div>
        </div>

        <div className="mt-3 text-xs text-white/40">
          Note: Directory listing depends on backend response shape. If it doesn’t list items correctly, I’ll adapt the parser to the real payload.
        </div>
      </div>
    </ModalShell>
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
