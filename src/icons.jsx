// Monoline SF-style icons. All accept {size, color, strokeWidth}
// Pattern: single React component per icon, sharp SF-inspired forms.

const IconBase = ({ size=16, color="currentColor", stroke=1.6, children, viewBox="0 0 16 16" }) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none"
    stroke={color} strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    {children}
  </svg>
);

const IconMic = (p) => (
  <IconBase {...p}>
    <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" />
    <path d="M3 7.2c0 2.76 2.24 5 5 5s5-2.24 5-5" />
    <path d="M8 12.2v2.3" />
  </IconBase>
);

const IconWaveform = (p) => (
  <IconBase {...p}>
    <path d="M1.5 8h1M4 5v6M6.5 3v10M9 5.5v5M11.5 6.5v3M14 8h.5" />
  </IconBase>
);

const IconFolder = (p) => (
  <IconBase {...p}>
    <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h2.4c.4 0 .78.16 1.06.44L8 4.5h4.5A1.5 1.5 0 0 1 14 6v6a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12V4.5Z" />
  </IconBase>
);

const IconSparkles = (p) => (
  <IconBase {...p}>
    <path d="M5.5 2v2.5M4.25 3.25h2.5" />
    <path d="M12 9v2.5M10.75 10.25h2.5" />
    <path d="M8.5 5.5l1.3 2.7 2.7 1.3-2.7 1.3-1.3 2.7-1.3-2.7-2.7-1.3 2.7-1.3L8.5 5.5Z" />
  </IconBase>
);

const IconClock = (p) => (
  <IconBase {...p}>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 5v3l2 1.5" />
  </IconBase>
);

const IconPlay = (p) => (
  <IconBase {...p}>
    <path d="M4.5 3.2 12.3 8 4.5 12.8V3.2Z" fill={p.color || "currentColor"} stroke="none" />
  </IconBase>
);

const IconPause = (p) => (
  <IconBase {...p}>
    <rect x="4" y="3" width="3" height="10" rx="0.5" fill={p.color || "currentColor"} stroke="none"/>
    <rect x="9" y="3" width="3" height="10" rx="0.5" fill={p.color || "currentColor"} stroke="none"/>
  </IconBase>
);

const IconSearch = (p) => (
  <IconBase {...p}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5 14 14" />
  </IconBase>
);

const IconDoc = (p) => (
  <IconBase {...p}>
    <path d="M4 2h5l3 3v8.5A.5.5 0 0 1 11.5 14h-7.5A.5.5 0 0 1 3.5 13.5v-11A.5.5 0 0 1 4 2Z" />
    <path d="M9 2v3.5h3" />
  </IconBase>
);

const IconCheck = (p) => (
  <IconBase {...p}>
    <path d="M3 8.5 6.5 12l6.5-8" />
  </IconBase>
);

const IconChevron = (p) => (
  <IconBase {...p}>
    <path d="M6 3.5 10.5 8 6 12.5" />
  </IconBase>
);

const IconArrowDown = (p) => (
  <IconBase {...p}>
    <path d="M8 3v10M4 9l4 4 4-4" />
  </IconBase>
);

const IconTag = (p) => (
  <IconBase {...p}>
    <path d="M2 2h5.5L14 8.5l-5.5 5.5L2 7.5V2Z" />
    <circle cx="5" cy="5" r="1" fill={p.color || "currentColor"} stroke="none" />
  </IconBase>
);

const IconPlus = (p) => (
  <IconBase {...p}>
    <path d="M8 3v10M3 8h10" />
  </IconBase>
);

const IconDownload = (p) => (
  <IconBase {...p}>
    <path d="M8 2v9M4.5 7.5 8 11l3.5-3.5" />
    <path d="M2.5 13h11" />
  </IconBase>
);

const IconShare = (p) => (
  <IconBase {...p}>
    <path d="M8 10V2M5 5l3-3 3 3" />
    <path d="M3 8v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8" />
  </IconBase>
);

const IconMoon = (p) => (
  <IconBase {...p}>
    <path d="M13 9.5A5.5 5.5 0 1 1 6.5 3a4.5 4.5 0 0 0 6.5 6.5Z" />
  </IconBase>
);

const IconSun = (p) => (
  <IconBase {...p}>
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.2 3.2l1 1M11.8 11.8l1 1M3.2 12.8l1-1M11.8 4.2l1-1" />
  </IconBase>
);

const IconSettings = (p) => (
  <IconBase {...p}>
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1.5v1.8M8 12.7v1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M1.5 8h1.8M12.7 8h1.8M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3" />
  </IconBase>
);

const IconTerminal = (p) => (
  <IconBase {...p}>
    <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
    <path d="M4 6.5 6.5 8.5 4 10.5" />
    <path d="M8 10.5h3.5" />
  </IconBase>
);

const IconUpload = (p) => (
  <IconBase {...p}>
    <path d="M8 11V2M4.5 5.5 8 2l3.5 3.5" />
    <path d="M2.5 13h11" />
  </IconBase>
);

const IconStar = (p) => (
  <IconBase {...p}>
    <path d="M8 2 9.8 6 14 6.5 11 9.5l.8 4.2L8 11.7l-3.8 2 .8-4.2L2 6.5 6.2 6 8 2Z" />
  </IconBase>
);

const IconTrash = (p) => (
  <IconBase {...p}>
    <path d="M3 5h10M6 5V3.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5V5M4.5 5l.6 8a.5.5 0 0 0 .5.45h4.8a.5.5 0 0 0 .5-.45l.6-8" />
  </IconBase>
);

const IconSidebar = (p) => (
  <IconBase {...p}>
    <rect x="2" y="3" width="12" height="10" rx="1.5" />
    <path d="M6 3v10" />
  </IconBase>
);

const IconCloud = (p) => (
  <IconBase {...p}>
    <path d="M5 11.5A3.5 3.5 0 0 1 5.3 4.5 4 4 0 0 1 12.7 6a3 3 0 0 1-.2 5.9H5Z" />
  </IconBase>
);

const IconAirDrop = (p) => (
  <IconBase {...p}>
    <path d="M3 11a5 5 0 0 1 10 0" />
    <path d="M5.5 9a2.5 2.5 0 0 1 5 0" />
    <circle cx="8" cy="13" r="0.8" fill={p.color || "currentColor"} stroke="none"/>
  </IconBase>
);

Object.assign(window, {
  IconMic, IconWaveform, IconFolder, IconSparkles, IconClock,
  IconPlay, IconPause, IconSearch, IconDoc, IconCheck, IconChevron,
  IconArrowDown, IconTag, IconPlus, IconDownload, IconShare,
  IconMoon, IconSun, IconSettings, IconTerminal, IconUpload,
  IconStar, IconTrash, IconSidebar, IconCloud, IconAirDrop,
});
