// Design tokens — Apple-inspired but with our own accent & type scale
// Light/Dark both supported via useTheme()

const TOKENS = {
  light: {
    // Window chrome
    windowBg: "#FDFDFD",
    chromeBg: "rgba(246, 246, 248, 0.72)",
    chromeBorder: "rgba(0,0,0,0.08)",
    sidebarBg: "rgba(239, 239, 242, 0.75)",
    sidebarItemHover: "rgba(0,0,0,0.045)",
    sidebarItemActive: "rgba(0,0,0,0.08)",
    // Surfaces
    surface: "#FFFFFF",
    surfaceAlt: "#F7F7F9",
    surfaceSunken: "#EFEFF2",
    hair: "rgba(0,0,0,0.08)",
    hairStrong: "rgba(0,0,0,0.14)",
    // Text
    text: "#0A0A0C",
    textSecondary: "#595961",
    textTertiary: "#8B8B93",
    textDisabled: "#B6B6BD",
    // Accent — warm coral, our product color
    accent: "#E85A3C",
    accentSoft: "#FFE5DE",
    accentText: "#B7331A",
    // Semantic
    info: "#0A84FF",
    success: "#22A06B",
    warn: "#E8A72B",
    // Code / log area
    codeBg: "#0F1013",
    codeText: "#E4E4EB",
    codeDim: "#6E6E78",
    codeAccent: "#FFB37A",
  },
  dark: {
    windowBg: "#1B1B1E",
    chromeBg: "rgba(38, 38, 42, 0.72)",
    chromeBorder: "rgba(255,255,255,0.08)",
    sidebarBg: "rgba(28, 28, 30, 0.78)",
    sidebarItemHover: "rgba(255,255,255,0.05)",
    sidebarItemActive: "rgba(255,255,255,0.09)",
    surface: "#242428",
    surfaceAlt: "#1F1F23",
    surfaceSunken: "#17171A",
    hair: "rgba(255,255,255,0.08)",
    hairStrong: "rgba(255,255,255,0.14)",
    text: "#F5F5F7",
    textSecondary: "#A1A1AA",
    textTertiary: "#71717A",
    textDisabled: "#52525B",
    accent: "#FF7557",
    accentSoft: "rgba(232,90,60,0.15)",
    accentText: "#FFB19E",
    info: "#64A9FF",
    success: "#3FB883",
    warn: "#FFC84D",
    codeBg: "#0B0B0D",
    codeText: "#E4E4EB",
    codeDim: "#6E6E78",
    codeAccent: "#FFB37A",
  }
};

const FONT_UI = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif';
const FONT_MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace';

// Hook
const ThemeCtx = React.createContext(null);

function ThemeProvider({ mode, children }) {
  const t = TOKENS[mode];
  return (
    <ThemeCtx.Provider value={{ t, mode }}>
      {children}
    </ThemeCtx.Provider>
  );
}
function useTheme() { return React.useContext(ThemeCtx); }

Object.assign(window, { TOKENS, FONT_UI, FONT_MONO, ThemeProvider, useTheme });
