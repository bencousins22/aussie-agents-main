import { useEffect, useMemo, useState, useCallback, useTransition, memo } from "react";
import { 
  Save, 
  Loader2, 
  Check, 
  X, 
  AlertTriangle, 
  Settings as SettingsIcon, 
  Search,
  Globe,
  Cpu,
  Layers,
  Key,
  Server,
  Archive,
  Terminal
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { agentZeroApi, type SettingsOutput, type SettingsField, type SettingsSection } from "../../lib/agentZeroApi";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { Switch } from "../ui/Switch";
import { Select } from "../ui/Select";
import { TunnelSection } from "../features/TunnelSection";
import { MicrophoneSelector } from "../features/MicrophoneSelector";

const TAB_ICONS: Record<string, LucideIcon> = {
  agent: Cpu,
  external: Globe,
  mcp: Server,
  backup: Archive,
  developer: Terminal,
  tunnel: Globe,
  default: Layers
};

const TAB_LABELS: Record<string, string> = {
  agent: "Agent Settings",
  external: "External Services",
  mcp: "MCP / A2A",
  backup: "Backup & Restore",
  developer: "Developer Tools",
  tunnel: "Flare Tunnel",
};

const _parseStyle = (styleStr: string): React.CSSProperties => {
  const style: Record<string, string> = {};
  styleStr.split(';').forEach(s => {
    const [key, val] = s.split(':');
    if (key && val) {
      const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
      style[camelKey] = val.trim();
    }
  });
  return style;
};

interface SettingFieldProps {
  field: SettingsField;
  onUpdate: (fieldId: string, value: unknown) => void;
  onOpenMemoryDashboard?: () => void;
}

const SettingFieldComponent = memo(({ field, onUpdate, onOpenMemoryDashboard }: SettingFieldProps) => {
  const renderFieldInput = () => {
    switch (field.type) {
      case 'switch':
        return (
          <Switch
            checked={Boolean(field.value)}
            onCheckedChange={(checked) => onUpdate(field.id, checked)}
          />
        );
      case 'select':
        return (
          <Select
            value={String(field.value)}
            onChange={(e) => onUpdate(field.id, e.target.value)}
            options={field.options}
            className="min-w-[var(--spacing-48)]"
          />
        );
      case 'range':
        return (
          <div className="flex items-center gap-[var(--spacing-3)] w-full max-w-[var(--spacing-64)]">
            <input
              type="range"
              min={field.min ?? 0}
              max={field.max ?? 1}
              step={field.step ?? 0.01}
              value={field.value}
              onChange={(e) => onUpdate(field.id, Number(e.target.value))}
              className="flex-1 accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] font-mono font-bold text-emerald-400 w-[var(--spacing-12)] text-right">
              {typeof field.value === 'number' ? field.value.toFixed(2) : field.value}
            </span>
          </div>
        );
      case 'textarea':
        return (
          <Input
            as="textarea"
            value={String(field.value)}
            onChange={(e) => onUpdate(field.id, e.target.value)}
            className="font-mono text-xs min-h-[var(--spacing-32)]"
            style={field.style ? _parseStyle(field.style) : undefined}
          />
        );
      case 'password':
        return (
          <Input
            type="password"
            value={String(field.value)}
            onChange={(e) => onUpdate(field.id, e.target.value)}
            className="font-mono"
            placeholder="••••••••"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={field.value}
            onChange={(e) => onUpdate(field.id, Number(e.target.value))}
            className="w-[var(--spacing-32)]"
          />
        );
      case 'button':
        return (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (field.id === 'memory_dashboard' && onOpenMemoryDashboard) {
                onOpenMemoryDashboard();
              }
            }}
            className="text-[10px] uppercase tracking-widest font-black"
          >
            {field.value}
          </Button>
        );
      case 'html':
        if (String(field.value).includes('microphone.html')) {
          return <MicrophoneSelector />;
        }
        return <div dangerouslySetInnerHTML={{ __html: String(field.value) }} className="text-xs text-foreground/60" />;
      default:
        return (
          <Input
            type="text"
            value={String(field.value)}
            onChange={(e) => onUpdate(field.id, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="group flex flex-col sm:flex-row sm:items-start justify-between gap-[var(--spacing-4)] p-[var(--spacing-4)] rounded-[var(--radius-2xl)] border border-border bg-muted/5 hover:bg-muted/10 hover:border-emerald-500/20 transition-all duration-300 shadow-sm">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-foreground/90 leading-tight flex items-center gap-2">
          {field.title}
          {field.id.includes('api_key') && <Key className="size-3 text-amber-500/50" />}
        </div>
        {field.description && (
          <p className="text-[10px] text-foreground/50 mt-1.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: field.description }} />
        )}
      </div>
      <div className="flex-shrink-0 self-end sm:self-start pt-1">
        {renderFieldInput()}
      </div>
    </div>
  );
});

SettingFieldComponent.displayName = "SettingField";

interface SettingSectionProps {
  section: SettingsSection;
  onUpdate: (fieldId: string, value: unknown) => void;
  onOpenMemoryDashboard?: () => void;
}

const SettingSectionComponent = memo(({ section, onUpdate, onOpenMemoryDashboard }: SettingSectionProps) => {
  return (
    <div className="space-y-[var(--spacing-4)]">
      <div className="flex flex-col gap-1 border-l-2 border-emerald-500/30 pl-4">
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
          {section.title}
        </h3>
        {section.description && (
          <p className="text-[10px] text-foreground/40 leading-relaxed max-w-2xl" dangerouslySetInnerHTML={{ __html: section.description }} />
        )}
      </div>
      
      <div className="grid gap-[var(--spacing-3)]">
        {section.fields.map((field) => (
          <SettingFieldComponent 
            key={field.id} 
            field={field} 
            onUpdate={onUpdate} 
            onOpenMemoryDashboard={onOpenMemoryDashboard}
          />
        ))}
      </div>
    </div>
  );
});

SettingSectionComponent.displayName = "SettingSection";

/**
 * SettingsModal component allows users to configure various aspects of the agent.
 * Features categorized settings, search functionality, and persistent storage.
 */
export const SettingsModal = memo(function SettingsModal({ 
  open, 
  onClose, 
  onOpenMemoryDashboard,
  initialTab = 'agent'
}: { 
  open: boolean; 
  onClose: () => void;
  onOpenMemoryDashboard?: () => void;
  initialTab?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settingsData, setSettingsData] = useState<SettingsOutput | null>(null);
  const [originalSettingsData, setOriginalSettingsData] = useState<SettingsOutput | null>(null);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Reset activeTab when initialTab changes or modal opens
  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  // Load settings when modal opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const loadSettings = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      try {
        const res = await agentZeroApi.settingsGet();
        if (cancelled) return;
        
        setSettingsData(res.settings);
        setOriginalSettingsData(JSON.parse(JSON.stringify(res.settings)));
        
        // Find first tab if current activeTab is not in results
        const availableTabs = Array.from(new Set(res.settings.sections.map(s => s.tab)));
        if (!availableTabs.includes(activeTab) && availableTabs.length > 0) {
          setActiveTab(availableTabs[0]);
        }
      } catch (e) {
        if (cancelled) return;
        setError((e as Error)?.message || "Failed to load settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, [open, activeTab]);

  // Transform and filter settings
  const filteredSections = useMemo(() => {
    if (!settingsData) return [];

    return settingsData.sections
      .filter(section => section.tab === activeTab)
      .map(section => ({
        ...section,
        fields: section.fields.filter(field => {
          if (field.hidden) return false;
          const matchesSearch = 
            field.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            field.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (field.description?.toLowerCase().includes(searchQuery.toLowerCase()));
          return matchesSearch;
        })
      }))
      .filter(section => section.fields.length > 0);
  }, [settingsData, searchQuery, activeTab]);

  // Get unique tabs
  const tabs = useMemo(() => {
    if (!settingsData) return [];
    const t = new Set<string>();
    settingsData.sections.forEach(s => t.add(s.tab));
    t.add('tunnel'); // Add tunnel manually
    return Array.from(t).sort((a, b) => {
      const order = ['agent', 'external', 'mcp', 'backup', 'developer', 'tunnel'];
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [settingsData]);

  // Check if settings have changed
  const hasChanges = useMemo(() => {
    return JSON.stringify(settingsData) !== JSON.stringify(originalSettingsData);
  }, [settingsData, originalSettingsData]);

  // Update setting value
  const updateSetting = useCallback((fieldId: string, value: unknown) => {
    setSettingsData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map(section => ({
          ...section,
          fields: section.fields.map(field => 
            field.id === fieldId ? { ...field, value } : field
          )
        }))
      };
    });
  }, []);

  // Save settings
  const handleSave = useCallback(async () => {
    if (!settingsData) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await agentZeroApi.settingsSet(settingsData);
      setOriginalSettingsData(JSON.parse(JSON.stringify(settingsData)));
      setSuccess("Settings saved successfully!");
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (e) {
      setError((e as Error)?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [settingsData]);

  // Reset settings
  const handleReset = useCallback(() => {
    setSettingsData(JSON.parse(JSON.stringify(originalSettingsData)));
    setError(null);
    setSuccess(null);
  }, [originalSettingsData]);

  const selectTab = (tab: string) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-[var(--spacing-3)]">
          <SettingsIcon className="size-5 text-emerald-400" />
          <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent font-black uppercase tracking-widest">
            Aussie Agents Settings
          </span>
        </div>
      }
    >
      <div className="flex flex-col md:flex-row h-[80vh] overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-[var(--spacing-64)] border-b md:border-b-0 md:border-r border-border flex flex-col bg-muted/10 shrink-0">
          <div className="p-[var(--spacing-4)] border-b border-border">
            <Input
              type="search"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="size-4" />}
              className="text-xs"
              autoComplete="off"
              name="a0-settings-search"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-[var(--spacing-2)] space-y-[var(--spacing-1)] no-scrollbar">
            <div className="px-[var(--spacing-3)] py-[var(--spacing-2)] text-[9px] font-black text-foreground/20 uppercase tracking-[0.2em]">Modules</div>
            
            {tabs.map((tab) => {
              const Icon = TAB_ICONS[tab] || TAB_ICONS.default;
              return (
                <button
                  key={tab}
                  onClick={() => selectTab(tab)}
                  className={cn(
                    "w-full flex items-center gap-[var(--spacing-3)] rounded-[var(--radius-xl)] px-[var(--spacing-3)] py-[var(--spacing-2.5)] text-left transition-all active:scale-[0.98]",
                    activeTab === tab
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-foreground/60 hover:text-foreground hover:bg-foreground/5 border border-transparent"
                  )}
                  disabled={isPending}
                >
                  <Icon className="size-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest truncate">{TAB_LABELS[tab] || tab}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-black/20 overflow-hidden">
          {/* Action Bar */}
          <div className="flex items-center justify-between px-[var(--spacing-6)] py-[var(--spacing-4)] border-b border-border/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex flex-col">
              <h2 className="text-sm font-black text-foreground/90 uppercase tracking-widest">
                {TAB_LABELS[activeTab] || activeTab}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" size="sm" className="text-[9px] h-4">
                  {activeTab === 'tunnel' ? 'External Proxy' : `${filteredSections.reduce((acc, s) => acc + s.fields.length, 0)} Parameters`}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-[var(--spacing-3)]">
              {activeTab !== 'tunnel' && (
                <>
                  {hasChanges && (
                    <Button
                      variant="ghost"
                      onClick={handleReset}
                      leftIcon={<X className="size-3.5" />}
                      className="text-[10px] uppercase tracking-widest font-black"
                    >
                      Reset
                    </Button>
                  )}
                  
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving || loading || !hasChanges}
                    leftIcon={saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                    className="text-[10px] uppercase tracking-widest font-black px-[var(--spacing-5)]"
                  >
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Settings Grid / Content */}
          <div className="flex-1 overflow-y-auto p-[var(--spacing-6)] no-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-[var(--spacing-4)] text-foreground/40">
                <Loader2 className="size-8 animate-spin text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Registry...</span>
              </div>
            ) : activeTab === 'tunnel' ? (
              <TunnelSection />
            ) : (
              <div className="space-y-[var(--spacing-8)] pb-[var(--spacing-10)]">
                {filteredSections.length === 0 ? (
                  <div className="text-center py-[var(--spacing-20)] text-foreground/20 italic text-sm">
                    No settings match your criteria
                  </div>
                ) : (
                  filteredSections.map((section) => (
                    <SettingSectionComponent 
                      key={section.id} 
                      section={section} 
                      onUpdate={updateSetting} 
                      onOpenMemoryDashboard={onOpenMemoryDashboard}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Toast-like notifications inside modal */}
          {(error || success) && (
            <div className="p-[var(--spacing-4)] bg-background/80 border-t border-border animate-in slide-in-from-bottom-2 duration-300">
              {error && (
                <div className="flex items-center gap-[var(--spacing-3)] text-xs font-bold uppercase tracking-widest text-red-400 bg-red-500/5 border border-red-500/20 rounded-[var(--radius-xl)] px-[var(--spacing-4)] py-[var(--spacing-3)]">
                  <AlertTriangle className="size-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-[var(--spacing-3)] text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-[var(--radius-xl)] px-[var(--spacing-4)] py-[var(--spacing-3)]">
                  <Check className="size-4 flex-shrink-0" />
                  {success}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
});
