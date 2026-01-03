import { useState, useEffect, useCallback, memo } from "react";
import { 
  Play, 
  StopCircle, 
  Copy, 
  Loader2, 
  Check, 
  AlertTriangle, 
  QrCode,
  ShieldCheck,
  Globe
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { agentZeroApi } from "../../lib/agentZeroApi";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { Select } from "../ui/Select";
import { cn } from "../../lib/utils";

export const TunnelSection = memo(function TunnelSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tunnelUrl, setTunnelUrl] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [provider, setProvider] = useState("serveo");
  const [port, setPort] = useState(5173);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentZeroApi.tunnelStatus();
      if (res.success && res.tunnel_url) {
        setTunnelUrl(res.tunnel_url);
        setIsRunning(true);
      } else {
        setTunnelUrl(null);
        setIsRunning(false);
      }
    } catch {
      setError("Failed to fetch tunnel status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await agentZeroApi.tunnelCreate(provider, port);
      if (res.success && res.tunnel_url) {
        setTunnelUrl(res.tunnel_url);
        setIsRunning(true);
        setSuccess("Tunnel created successfully!");
      } else {
        setError(res.error || "Failed to create tunnel");
      }
    } catch {
      setError("An error occurred while creating tunnel");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!confirm("Are you sure you want to stop the tunnel? The URL will no longer be accessible.")) return;
    
    setLoading(true);
    try {
      const res = await agentZeroApi.tunnelStop();
      if (res.success) {
        setTunnelUrl(null);
        setIsRunning(false);
        setSuccess("Tunnel stopped successfully");
      }
    } catch {
      setError("Failed to stop tunnel");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!tunnelUrl) return;
    navigator.clipboard.writeText(tunnelUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-[var(--spacing-8)] pb-[var(--spacing-10)] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1 border-l-2 border-emerald-500/30 pl-4">
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
          Public Tunnel Access
        </h3>
        <p className="text-[10px] text-foreground/40 leading-relaxed max-w-2xl">
          Securely expose your local Agent Zero instance to the internet. This allows you to access the UI and API from any device, anywhere.
        </p>
      </div>

      <div className="grid gap-[var(--spacing-6)]">
        {/* Status Card */}
        <div className={cn(
          "p-[var(--spacing-6)] rounded-[var(--radius-3xl)] border transition-all duration-500",
          isRunning 
            ? "bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5" 
            : "bg-muted/5 border-border shadow-sm"
        )}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-[var(--spacing-6)]">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "size-2 rounded-full animate-pulse",
                  isRunning ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-zinc-600"
                )} />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground/80">
                  {isRunning ? "System Exposed" : "Internal Only"}
                </span>
                {isRunning && (
                  <Badge variant="success" size="sm" className="text-[9px] h-4">Active</Badge>
                )}
              </div>
              <h4 className="text-xl font-black text-foreground">
                {isRunning ? "Tunnel Connection Live" : "Public Tunnel Offline"}
              </h4>
            </div>

            {!isRunning ? (
              <div className="flex items-center gap-[var(--spacing-3)]">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Port</label>
                  <Input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-[var(--spacing-24)] h-9"
                    placeholder="Port"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Provider</label>
                  <Select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    options={[
                      { value: "serveo", label: "Serveo.net (Recommended)" },
                      { value: "localhost.run", label: "Localhost.run" }
                    ]}
                    className="min-w-[var(--spacing-48)] h-9"
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleStart}
                  disabled={loading}
                  leftIcon={loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                  className="px-[var(--spacing-6)] mt-4"
                >
                  Create Tunnel
                </Button>
              </div>
            ) : (
              <Button
                variant="destructive"
                onClick={handleStop}
                disabled={loading}
                leftIcon={<StopCircle className="size-4" />}
                className="px-[var(--spacing-6)]"
              >
                Terminate Tunnel
              </Button>
            )}
          </div>

          {isRunning && tunnelUrl && (
            <div className="mt-[var(--spacing-8)] space-y-[var(--spacing-6)] animate-in zoom-in-95 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest ml-1">
                  Access URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/40 border border-emerald-500/20 rounded-[var(--radius-xl)] px-4 py-3 font-mono text-sm text-emerald-400 break-all select-all">
                    {tunnelUrl}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyToClipboard}
                    className="shrink-0 size-11 rounded-[var(--radius-xl)] border-emerald-500/10 hover:bg-emerald-500/10"
                  >
                    {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowQR(!showQR)}
                    className={cn(
                      "shrink-0 size-11 rounded-[var(--radius-xl)] border-emerald-500/10",
                      showQR ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-emerald-500/10"
                    )}
                  >
                    <QrCode className="size-4" />
                  </Button>
                </div>
              </div>

              {showQR && (
                <div className="flex flex-col items-center gap-4 p-[var(--spacing-6)] bg-white/5 rounded-[var(--radius-2xl)] border border-white/5 animate-in slide-in-from-top-4 duration-300">
                  <div className="p-4 bg-white rounded-2xl shadow-2xl">
                    <QRCodeSVG 
                      value={tunnelUrl} 
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                    Scan to access on mobile
                  </span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/20 border border-white/5">
                  <ShieldCheck className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground/90 uppercase tracking-wide">Secure Link</p>
                    <p className="text-[10px] text-foreground/40 leading-relaxed">
                      All traffic is encrypted. Ensure you have authentication enabled in Registry settings.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/20 border border-white/5">
                  <Globe className="size-5 text-teal-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground/90 uppercase tracking-wide">Global Access</p>
                    <p className="text-[10px] text-foreground/40 leading-relaxed">
                      Share this URL with colleagues or access your workspace while traveling.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        {!isRunning && (
          <div className="p-6 rounded-[var(--radius-3xl)] border border-amber-500/20 bg-amber-500/5 space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="size-5" />
              <h5 className="text-sm font-black uppercase tracking-widest">Security Warning</h5>
            </div>
            <p className="text-xs text-amber-500/70 leading-relaxed">
              Creating a public tunnel without authentication means anyone with the URL can access your Agent Zero instance and execute code. 
              <strong> Highly recommended:</strong> Set a strong UI login and password in the <span className="font-black">Authentication</span> section before starting a tunnel.
            </p>
          </div>
        )}
      </div>

      {/* Notifications */}
      {(error || success) && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-4 duration-300">
          {error && (
            <div className="flex items-center gap-3 px-6 py-4 bg-red-500/90 text-white font-bold rounded-2xl shadow-2xl backdrop-blur-md border border-red-400/20">
              <AlertTriangle className="size-5" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest opacity-70">Error</span>
                <span className="text-xs">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="ml-4 opacity-50 hover:opacity-100">
                <StopCircle className="size-4" />
              </button>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/90 text-white font-bold rounded-2xl shadow-2xl backdrop-blur-md border border-emerald-400/20">
              <Check className="size-5" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest opacity-70">Success</span>
                <span className="text-xs">{success}</span>
              </div>
              <button onClick={() => setSuccess(null)} className="ml-4 opacity-50 hover:opacity-100">
                <StopCircle className="size-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});