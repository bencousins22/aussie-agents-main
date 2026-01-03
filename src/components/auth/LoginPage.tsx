import React, { useState, useEffect } from "react";
import { User, Lock, LogIn, AlertCircle } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

declare global {
  interface Window {
    LOGIN_ERROR: string | undefined;
  }
}

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Read error from global variable injected by Flask
    const globalError = window.LOGIN_ERROR;
    if (globalError) {
      setError(globalError);
      // Clear it so it doesn't persist on refresh
      window.LOGIN_ERROR = undefined;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const apiBaseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiBaseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        mode: "cors",
        body: formData.toString(),
      });

      // If the login is successful, Flask redirects to /
      // In fetch, response.redirected will be true if it followed a redirect
      // and response.url will be the final URL.
      if (response.ok && (response.redirected || response.url.endsWith("/") || !response.url.endsWith("/login"))) {
        window.location.href = "/";
        return;
      }

      setError("Invalid Credentials. Please try again.");
    } catch (err) {
      console.error("Login error:", err);
      setError("A connection error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 safe-area-inset">
      <Card className="w-full max-w-md p-6 sm:p-8 border-primary-400/30 bg-background/90 backdrop-blur-xl shadow-2xl shadow-primary-500/20 my-safe">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          {/* Logo/Header */}
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 sm:size-24 rounded-[var(--radius-2xl)] bg-primary-500/15 border border-primary-400/30 flex items-center justify-center shadow-inner overflow-hidden text-xl sm:text-2xl font-black text-black">
              AA
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-foreground uppercase mt-2 sm:mt-4 italic">
              Aussie <span className="text-primary-400">Agents</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] text-foreground/40 font-black uppercase tracking-[0.2em] -mt-1">
              Workforce Management
            </p>
          </div>

          <form 
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-3 sm:gap-4 mt-2 sm:mt-4"
          >
            {error && (
              <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm font-medium">
                <AlertCircle size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            <Input
              id="username"
              name="username"
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User size={18} />}
              required
              fullWidth
              autoFocus
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
              required
              fullWidth
            />

            <div className="pt-4 sm:pt-6">
              <Button
                type="submit"
                variant="default"
                size="lg"
                fullWidth
                loading={isSubmitting}
                rightIcon={<LogIn size={18} />}
              >
                Login
              </Button>
            </div>
          </form>

          <p className="text-[10px] sm:text-xs text-foreground/30 font-medium uppercase tracking-widest mt-2 sm:mt-4">
            Authorized Personnel Only
          </p>
        </div>
      </Card>
    </div>
  );
};
