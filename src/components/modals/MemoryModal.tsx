import { useEffect, useMemo, useState, useDeferredValue, useCallback } from "react";
import { Loader2, Search, Trash2 } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { agentZeroApi } from "../../lib/agentZeroApi";

type MemoryItem = {
  id: string;
  title?: string;
  content?: string;
  area?: string;
  score?: number;
  created_at?: number;
  [k: string]: unknown;
};

export function MemoryModal({
  open,
  onClose,
  activeContext,
}: {
  open: boolean;
  onClose: () => void;
  activeContext: string | null;
}) {
  const [subdirs, setSubdirs] = useState<string[]>(["default"]);
  const [subdir, setSubdir] = useState<string>("default");
  const [query, setQuery] = useState<string>("");
  const deferredQuery = useDeferredValue(query, "");
  const [area, setArea] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<MemoryItem[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const init = async () => {
      setError(null);
      try {
        const current = await agentZeroApi.memoryDashboard("get_current_memory_subdir", {
          context_id: activeContext ?? null,
        });
        if (!cancelled && current?.success && current.memory_subdir) {
          setSubdir(String(current.memory_subdir));
        }
      } catch {
        // ignore
      }

      try {
        const res = await agentZeroApi.memoryDashboard("get_memory_subdirs", {});
        if (cancelled) return;
        if (res?.success && Array.isArray(res.subdirs)) {
          const s = res.subdirs.includes("default")
            ? ["default", ...res.subdirs.filter((d: string) => d !== "default").sort()]
            : ["default", ...res.subdirs.slice().sort()];
          setSubdirs(s);
        } else {
          setSubdirs(["default"]);
          if (!res?.success && res?.error) setError(res.error);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error)?.message || "Failed to load memory subdirs");
      }

      return;
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [open, activeContext]);

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await agentZeroApi.memoryDashboard("search", {
        memory_subdir: subdir,
        search: query,
        area,
        limit: 200,
        threshold: 0.6,
      });
      if (res?.success) {
        setItems((res.memories || []) as MemoryItem[]);
      } else {
        setItems([]);
        setError(res?.error || "Search failed");
      }
    } catch (e) {
      setError((e as Error)?.message || "Search failed");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [subdir, query, area]);

  useEffect(() => {
    if (!open) return;
    search();
  }, [open, search]);

  useEffect(() => {
    if (!open) return;
    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [deferredQuery, subdir, search, open]);

  const stats = useMemo(() => {
    const byArea = new Map<string, number>();
    for (const m of items) {
      const a = String(m.area || "");
      if (!a) continue;
      byArea.set(a, (byArea.get(a) || 0) + 1);
    }
    return Array.from(byArea.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this memory?") || !id) return;
    try {
      const res = await agentZeroApi.memoryDashboard("delete", {
        memory_subdir: subdir,
        memory_id: id,
      });
      if (res?.success) {
        setItems((prev) => prev.filter((m) => m.id !== id));
      } else {
        alert(res?.error || "Delete failed");
      }
    } catch (e) {
      alert((e as Error)?.message || "Delete failed");
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      widthClassName="max-w-6xl"
      title={
        <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
          Aussie Agents Memory
        </span>
      }
    >
      <div className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <select
              className="rounded-lg border border-zinc-800 bg-black/30 px-3 py-2 text-sm text-white/70 outline-none focus:border-emerald-400/40"
              value={subdir}
              onChange={(e) => setSubdir(e.target.value)}
            >
              {subdirs.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Area filter (optional)"
              className="rounded-lg border border-zinc-800 bg-black/30 px-3 py-2 text-sm text-white/70 outline-none focus:border-emerald-400/40"
            />

            <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-black/30 px-3 py-2">
              <Search className="size-4 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search memories…"
                className="bg-transparent text-sm text-white/70 outline-none w-64"
                onKeyDown={(e) => {
                  if (e.key === "Enter") search();
                }}
              />
            </div>

            <button
              type="button"
              onClick={search}
              className="rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-all active:scale-95"
              aria-label="Search memory"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setArea("");
                search();
              }}
              className="rounded-lg border border-zinc-800 bg-black/30 px-3 py-2 text-sm text-white/70 hover:text-white transition-all active:scale-95"
              aria-label="Clear filters and refresh"
            >
              Reset
            </button>
          </div>

          <div className="text-xs text-white/40">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Searching…
              </span>
            ) : (
              <span>{items.length} results</span>
            )}
          </div>
        </div>

        {error ? <div className="mb-3 text-sm text-red-400">{error}</div> : null}

        {stats.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {stats.slice(0, 8).map(([a, c]) => (
              <button
                key={a}
                type="button"
                onClick={() => setArea(a)}
                className="rounded-full border border-zinc-800 bg-black/20 px-3 py-1 text-xs text-white/60 hover:text-white"
              >
                {a} ({c})
              </button>
            ))}
          </div>
        ) : null}

        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className="rounded-xl border border-zinc-800 bg-black/20">
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white/85 truncate">
                    {m.title || m.id}
                  </div>
                  <div className="mt-1 text-xs text-white/40">
                    {m.area ? `area: ${m.area}` : null}
                    {typeof m.score === "number" ? `  score: ${m.score.toFixed(3)}` : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(String(m.id))}
                  className="size-9 grid place-items-center rounded-lg text-white/50 hover:text-white hover:bg-zinc-800"
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {m.content ? (
                <div className="border-t border-zinc-800 px-4 py-3">
                  <pre className="text-xs text-white/70 whitespace-pre-wrap break-words font-mono">{String(m.content)}</pre>
                </div>
              ) : null}
            </div>
          ))}

          {!loading && items.length === 0 ? (
            <div className="text-sm text-white/40">No memories found.</div>
          ) : null}
        </div>
      </div>
    </ModalShell>
  );
}
