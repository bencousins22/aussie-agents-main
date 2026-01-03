import { useState } from "react";
import { Download, Upload, Loader2 } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { agentZeroApi } from "../../lib/agentZeroApi";

export function HistoryModal({
  open,
  onClose,
  activeContext,
}: {
  open: boolean;
  onClose: () => void;
  activeContext: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    if (!activeContext) return;
    setBusy(true);
    setError(null);
    try {
      const res = await agentZeroApi.chatExport(activeContext);
      const blob = new Blob([JSON.stringify(res.content, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-${activeContext}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error)?.message || "Export failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    setBusy(true);
    setError(null);
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.multiple = true;
      const chats: unknown[] = await new Promise((resolve) => {
        input.onchange = async (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (!files?.length) return resolve([]);
          const arr: unknown[] = [];
          for (const f of files) {
            arr.push(JSON.parse(await f.text()));
          }
          resolve(arr);
        };
        input.click();
      });

      if (chats.length === 0) return;
      await agentZeroApi.chatLoad(chats);
      onClose();
    } catch (e) {
      setError((e as Error)?.message || "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      widthClassName="max-w-3xl"
      title={
        <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
          Aussie Agents History
        </span>
      }
    >
      <div className="p-5 space-y-4">
        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={!activeContext || busy}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-black/20 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Export current chat
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-black/20 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Import chat JSON
          </button>
        </div>

        <div className="text-xs text-white/40">
          Import will add chats into the backend chat list.
        </div>
      </div>
    </ModalShell>
  );
}
