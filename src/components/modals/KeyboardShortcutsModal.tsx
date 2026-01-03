import { ModalShell } from "./ModalShell";

export function KeyboardShortcutsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const shortcuts = [
    { key: "Ctrl/Cmd + Enter", desc: "Focus chat input / Send message" },
    { key: "Ctrl/Cmd + K", desc: "Search chat history" },
    { key: "Ctrl/Cmd + B", desc: "Toggle sidebar" },
    { key: "Ctrl/Cmd + N", desc: "Start new chat" },
    { key: "Ctrl/Cmd + ,", desc: "Open settings" },
    { key: "Ctrl/Cmd + Space", desc: "Pause/Resume agent" },
    { key: "Escape", desc: "Close modal / Blur input" },
    { key: "?", desc: "Show this help guide" },
  ];

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      widthClassName="max-w-xl"
      title={
        <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
          Command Shortcuts
        </span>
      }
    >
      <div className="p-6">
        <div className="grid gap-4">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between group">
              <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">
                {s.desc}
              </span>
              <div className="flex items-center gap-1">
                {s.key.split(" + ").map((k, j) => (
                  <span key={j} className="flex items-center">
                    <kbd className="px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[10px] font-black text-emerald-400 shadow-lg min-w-[2.5rem] text-center uppercase tracking-tighter">
                      {k}
                    </kbd>
                    {j < s.key.split(" + ").length - 1 && <span className="text-white/20 mx-1">+</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
          <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
            Aussie Agents Workforce • Professional Series
          </p>
        </div>
      </div>
    </ModalShell>
  );
}
