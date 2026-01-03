import { useState, useEffect, useCallback, memo } from "react";
import { Mic, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";

export const MicrophoneSelector = memo(function MicrophoneSelector() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices.filter(d => d.kind === "audioinput" && d.deviceId);
      setDevices(audioInputs);
      
      const saved = localStorage.getItem('microphoneSelectedDevice');
      if (saved && audioInputs.some(d => d.deviceId === saved)) {
        setSelectedDevice(saved);
      } else if (audioInputs.length > 0) {
        setSelectedDevice(audioInputs[0].deviceId);
      }
    } catch {
      setError("Failed to enumerate devices");
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const handleRequestPermission = async () => {
    setRequesting(true);
    setError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await loadDevices();
    } catch {
      setError("Permission denied");
    } finally {
      setRequesting(false);
    }
  };

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDevice(deviceId);
    localStorage.setItem('microphoneSelectedDevice', deviceId);
  };

  if (devices.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRequestPermission}
          loading={requesting}
          leftIcon={<Mic className="size-3.5" />}
          className="text-[10px] uppercase tracking-widest font-black"
        >
          {requesting ? "Waiting for devices..." : "Request Microphone Permission"}
        </Button>
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">
            <AlertCircle className="size-3" />
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Select
        value={selectedDevice}
        onChange={(e) => handleSelectDevice(e.target.value)}
        options={devices.map(d => ({ value: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 5)}...` }))}
        className="min-w-[var(--spacing-64)]"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={loadDevices}
        className="shrink-0 size-10 rounded-xl border border-white/5 hover:bg-white/5"
      >
        <RefreshCw className="size-4" />
      </Button>
    </div>
  );
});
