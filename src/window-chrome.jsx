// Window chrome: traffic lights, toolbar, search. Apple-native look.

function TrafficLights() {
  // In Electron, the real macOS traffic lights are rendered natively via
  // titleBarStyle: 'hidden'. We just reserve the horizontal space here so
  // the rest of the toolbar aligns correctly under them.
  const inElectron = typeof window !== "undefined" && !!window.recast;
  if (inElectron) return <div style={{ width: 68, flexShrink: 0 }} />;
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{
        width: 12, height: 12, borderRadius: "50%",
        background: "#FF5F57", border: "0.5px solid rgba(0,0,0,0.12)"
      }} />
      <span style={{
        width: 12, height: 12, borderRadius: "50%",
        background: "#FEBC2E", border: "0.5px solid rgba(0,0,0,0.12)"
      }} />
      <span style={{
        width: 12, height: 12, borderRadius: "50%",
        background: "#28C840", border: "0.5px solid rgba(0,0,0,0.12)"
      }} />
    </div>
  );
}

function WindowFrame({ children, style }) {
  const { t, mode } = useTheme();
  const inElectron = typeof window !== "undefined" && !!window.recast;
  return (
    <div style={{
      width: "100%", height: "100%",
      background: t.windowBg,
      borderRadius: inElectron ? 0 : 12,
      overflow: "hidden",
      border: inElectron ? "none" : `0.5px solid ${t.hairStrong}`,
      boxShadow: inElectron ? "none" : (mode === "dark"
        ? "0 30px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.06)"
        : "0 30px 80px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.06)"),
      display: "flex", flexDirection: "column",
      color: t.text, fontFamily: FONT_UI,
      ...style
    }}>
      {children}
    </div>
  );
}

// Toolbar with optional sidebar-inset variant (sidebar sits under toolbar area)
function TitleBar({ title, subtitle, left, center, right, variant = "unified", hasSidebar }) {
  const { t } = useTheme();
  const noDrag = { WebkitAppRegion: "no-drag" };
  return (
    <div style={{
      height: 52,
      display: "flex", alignItems: "center",
      padding: "0 14px 0 18px",
      background: variant === "glass" ? t.chromeBg : "transparent",
      backdropFilter: variant === "glass" ? "blur(30px) saturate(180%)" : "none",
      borderBottom: `0.5px solid ${t.hair}`,
      gap: 14,
      flexShrink: 0,
      position: "relative",
      zIndex: 3,
      WebkitAppRegion: "drag",
    }}>
      <TrafficLights />
      {left && <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 6, ...noDrag }}>{left}</div>}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {title && (
          <div style={{
            fontSize: 13, fontWeight: 600, color: t.text,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>{title}</div>
        )}
        {subtitle && (
          <div style={{ fontSize: 12, color: t.textTertiary }}>{subtitle}</div>
        )}
        {center && <div style={noDrag}>{center}</div>}
      </div>
      {right && <div style={{ display: "flex", alignItems: "center", gap: 6, ...noDrag }}>{right}</div>}
    </div>
  );
}

// Icon button — subtle, mac vibranced
function IconButton({ icon, onClick, active, title, size = 28 }) {
  const { t } = useTheme();
  const [hover, setHover] = React.useState(false);
  const Ic = icon;
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: size, height: size, borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? t.sidebarItemActive : hover ? t.sidebarItemHover : "transparent",
        border: "none", color: t.textSecondary, cursor: "pointer",
        transition: "background 120ms ease"
      }}>
      <Ic size={15} color={active ? t.text : t.textSecondary} />
    </button>
  );
}

// Search field
function SearchField({ placeholder = "검색", width = 220, value = "", onChange }) {
  const { t } = useTheme();
  return (
    <div style={{
      height: 28, width, borderRadius: 6,
      background: t.surfaceSunken,
      border: `0.5px solid ${t.hair}`,
      display: "flex", alignItems: "center", gap: 6, padding: "0 8px",
    }}>
      <IconSearch size={12} color={t.textTertiary} />
      <input
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1, border: "none", outline: "none", background: "transparent",
          fontSize: 12, color: t.text, fontFamily: FONT_UI,
        }}
      />
      <span style={{
        fontSize: 10, color: t.textTertiary,
        padding: "1px 4px", borderRadius: 3,
        background: "rgba(0,0,0,0.05)",
      }}>⌘K</span>
    </div>
  );
}

// Accent CTA button
function Button({ children, onClick, variant = "secondary", size = "md", icon: Icon }) {
  const { t } = useTheme();
  const [hover, setHover] = React.useState(false);
  const sizes = {
    sm: { h: 24, px: 10, fs: 11 },
    md: { h: 28, px: 12, fs: 12 },
    lg: { h: 32, px: 14, fs: 13 },
  }[size];
  const variants = {
    primary: {
      bg: hover ? `color-mix(in oklch, ${t.accent} 92%, black)` : t.accent,
      fg: "#FFFFFF",
      border: "transparent",
    },
    secondary: {
      bg: hover ? t.surfaceSunken : t.surface,
      fg: t.text,
      border: t.hair,
    },
    ghost: {
      bg: hover ? t.sidebarItemHover : "transparent",
      fg: t.text,
      border: "transparent",
    }
  }[variant];
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: sizes.h, padding: `0 ${sizes.px}px`,
        borderRadius: 6,
        background: variants.bg, color: variants.fg,
        border: `0.5px solid ${variants.border}`,
        fontSize: sizes.fs, fontWeight: 500, fontFamily: FONT_UI,
        display: "inline-flex", alignItems: "center", gap: 6,
        cursor: "pointer", whiteSpace: "nowrap",
        transition: "background 120ms ease"
      }}>
      {Icon && <Icon size={12} color={variants.fg} />}
      {children}
    </button>
  );
}

// Tag chip
function TagChip({ children, color }) {
  const { t } = useTheme();
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 7px", borderRadius: 4,
      fontSize: 10.5, fontWeight: 500,
      color: t.textSecondary,
      background: t.surfaceSunken,
      border: `0.5px solid ${t.hair}`,
    }}>
      {color && <span style={{
        width: 5, height: 5, borderRadius: "50%", background: color
      }}/>}
      {children}
    </span>
  );
}

// Mini waveform svg (static)
function Waveform({ width = 120, height = 20, bars = 32, color, active = 0 }) {
  const { t } = useTheme();
  const c = color || t.textTertiary;
  // seeded random
  const heights = React.useMemo(() => {
    const out = [];
    let seed = 13;
    for (let i = 0; i < bars; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const r = seed / 233280;
      // bell-ish curve
      const mid = 1 - Math.abs(i - bars/2) / (bars/2);
      out.push(0.18 + r * 0.5 + mid * 0.35);
    }
    return out;
  }, [bars]);
  const barW = width / bars;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {heights.map((h, i) => {
        const bh = Math.max(2, h * height);
        const y = (height - bh) / 2;
        const isActive = i / bars < active;
        return (
          <rect key={i}
            x={i * barW + 0.5} y={y}
            width={Math.max(1, barW - 1)} height={bh}
            rx={Math.max(0.5, barW/2 - 1)}
            fill={isActive ? t.accent : c}
            opacity={isActive ? 1 : 0.6}
          />
        );
      })}
    </svg>
  );
}

// animated waveform — bars breathe, used during analysis
function AnimatedWaveform({ width = 200, height = 28, bars = 24 }) {
  const { t } = useTheme();
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    let raf;
    const step = () => { setTick(x => x + 1); raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  const barW = width / bars;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {Array.from({ length: bars }).map((_, i) => {
        const phase = (tick / 30) + i * 0.45;
        const h = 0.25 + (Math.sin(phase) * 0.5 + 0.5) * 0.75;
        const bh = Math.max(2, h * height);
        const y = (height - bh) / 2;
        return (
          <rect key={i}
            x={i * barW + 1} y={y}
            width={Math.max(1, barW - 2)} height={bh}
            rx={Math.max(0.5, barW/2 - 1)}
            fill={t.accent}
          />
        );
      })}
    </svg>
  );
}

// Progress ring (for analyzing)
function ProgressRing({ size = 72, stroke = 5, value = 0.6 }) {
  const { t } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      <circle cx={size/2} cy={size/2} r={r}
        stroke={t.hair} strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r}
        stroke={t.accent} strokeWidth={stroke} fill="none"
        strokeLinecap="round"
        strokeDasharray={`${c * value} ${c}`}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dasharray 600ms ease" }}
      />
    </svg>
  );
}

Object.assign(window, {
  TrafficLights, WindowFrame, TitleBar, IconButton, SearchField,
  Button, TagChip, Waveform, AnimatedWaveform, ProgressRing
});
