/**
 * Aurora Background - Enhanced Aesthetic Version
 * A beautiful, dynamic background with animated gradients and particles
 */

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-950 to-black" />

      {/* Animated aurora layers */}
      <div className="absolute inset-0">
        {/* Primary aurora glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-teal-400/15 rounded-full blur-[100px] animate-pulse delay-[2s]" />
        <div className="absolute bottom-1/4 left-1/3 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[110px] animate-pulse delay-[4s]" />
        
        {/* Secondary accent glows */}
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[90px] animate-pulse delay-[1s]" />
        <div className="absolute bottom-1/3 left-1/2 w-[450px] h-[450px] bg-indigo-500/8 rounded-full blur-[95px] animate-pulse delay-[3s]" />
      </div>

      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/60" />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay">
        <svg className="h-full w-full">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Glowing particles */}
      <div className="absolute inset-0 opacity-40">
        {/* Large particles */}
        <div className="absolute top-[10%] left-[10%] w-3 h-3 bg-emerald-400 rounded-full blur-sm animate-float" />
        <div className="absolute top-[25%] right-[20%] w-2 h-2 bg-teal-300 rounded-full blur-sm animate-float-delayed" />
        <div className="absolute bottom-[30%] left-[30%] w-2.5 h-2.5 bg-emerald-500 rounded-full blur-sm animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[50%] right-[10%] w-2 h-2 bg-cyan-400 rounded-full blur-sm animate-float-delayed" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[15%] right-[35%] w-3 h-3 bg-emerald-300 rounded-full blur-sm animate-float" style={{ animationDelay: '3s' }} />
        
        {/* Small particles */}
        <div className="absolute top-[35%] left-[25%] w-1.5 h-1.5 bg-teal-400 rounded-full blur-[2px] animate-float-delayed" />
        <div className="absolute bottom-[25%] left-[50%] w-1.5 h-1.5 bg-emerald-400 rounded-full blur-[2px] animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[65%] right-[30%] w-1 h-1 bg-cyan-300 rounded-full blur-[2px] animate-float-delayed" style={{ animationDelay: '2.5s' }} />
        
        {/* Accent particles */}
        <div className="absolute top-[45%] left-[15%] w-1.5 h-1.5 bg-purple-400 rounded-full blur-[2px] animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-[40%] right-[25%] w-1 h-1 bg-indigo-400 rounded-full blur-[2px] animate-float-delayed" style={{ animationDelay: '1.8s' }} />
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
      
      {/* Border glow */}
      <div className="absolute inset-0 border border-emerald-500/10 shadow-[inset_0_0_120px_rgba(16,185,129,0.08)]" />
    </div>
  );
}
