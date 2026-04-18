// Detail screen — recording summary + transcript preview

function DetailHeader({ rec }) {
  const { t } = useTheme();
  return (
    <div style={{ padding: "20px 24px 14px" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 11, color: t.textTertiary, marginBottom: 8,
      }}>
        <IconCloud size={11} color={t.textTertiary} />
        <span>{rec.source}</span>
        <span>·</span>
        <span>{rec.date}</span>
        <span>·</span>
        <span>{rec.size}</span>
      </div>
      <h1 style={{
        margin: "0 0 8px", fontSize: 24, fontWeight: 700,
        letterSpacing: "-0.012em", color: t.text
      }}>
        {rec.title}
      </h1>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 12, color: t.textSecondary,
      }}>
        <IconClock size={12} color={t.textSecondary} />
        <span>{rec.duration}</span>
        {rec.speakers?.length > 0 && (
          <>
            <span style={{ color: t.textTertiary }}>·</span>
            <span>화자 {rec.speakers.length}명 — {rec.speakers.join(", ")}</span>
          </>
        )}
        <div style={{ flex: 1 }} />
        {(rec.tags || []).map(tag => <TagChip key={tag}>{tag}</TagChip>)}
      </div>
    </div>
  );
}

function Player({ rec, compact }) {
  const { t } = useTheme();
  const lib = useLibrary?.();
  const audioRef = React.useRef(null);
  const [playing, setPlaying] = React.useState(false);
  const [curSec, setCurSec] = React.useState(0);
  const [durationSec, setDurationSec] = React.useState(rec.durationSec || 0);
  const fmt = s => {
    s = Math.max(0, Math.floor(s || 0));
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };
  const pos = durationSec > 0 ? curSec / durationSec : 0;
  const canPlay = !!rec.audioPath;

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play(); else a.pause();
  };
  const seek = (e) => {
    const a = audioRef.current;
    if (!a || !durationSec) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * durationSec;
  };

  return (
    <div style={{
      margin: "0 24px", padding: compact ? "10px 14px" : "14px 18px",
      borderRadius: 10,
      background: t.surfaceAlt,
      border: `0.5px solid ${t.hair}`,
      display: "flex", alignItems: "center", gap: 14,
    }}>
      {canPlay && (
        <audio ref={audioRef} src={`file://${rec.audioPath}`} preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={e => setCurSec(e.currentTarget.currentTime)}
          onLoadedMetadata={e => {
            if (!isFinite(e.currentTarget.duration)) return;
            setDurationSec(e.currentTarget.duration);
          }}
        />
      )}
      <button
        onClick={toggle}
        disabled={!canPlay}
        title={canPlay ? (playing ? "일시정지" : "재생") : "오디오 파일 없음"}
        style={{
          width: 36, height: 36, borderRadius: "50%",
          background: canPlay ? t.accent : t.surfaceSunken,
          border: "none", cursor: canPlay ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", flexShrink: 0,
          boxShadow: canPlay ? "0 2px 8px rgba(232,90,60,0.3)" : "none",
        }}>
        {playing ? <IconPause size={14} color="white" /> : <IconPlay size={14} color="white" />}
      </button>
      <div style={{ flex: 1 }}>
        <div onClick={canPlay ? seek : undefined} style={{ cursor: canPlay ? "pointer" : "default" }}>
          <Waveform width={520} height={24} bars={64} active={pos} />
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 10.5, color: t.textTertiary, marginTop: 4,
          fontVariantNumeric: "tabular-nums"
        }}>
          <span>{fmt(curSec)}</span>
          <span>{fmt(durationSec)}</span>
        </div>
      </div>
      <IconButton icon={IconDownload} title="Markdown으로 내보내기"
        onClick={() => lib?.exportMarkdown(rec.id)} />
    </div>
  );
}

function Section({ title, icon: Icon, children, right }) {
  const { t } = useTheme();
  return (
    <section style={{ padding: "18px 24px 4px" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
      }}>
        {Icon && <Icon size={12} color={t.textSecondary} />}
        <h3 style={{
          margin: 0, fontSize: 11, fontWeight: 700,
          color: t.textSecondary,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>{title}</h3>
        <div style={{ flex: 1 }} />
        {right}
      </div>
      {children}
    </section>
  );
}

function OverviewCard({ text }) {
  const { t } = useTheme();
  return (
    <div style={{
      padding: "16px 18px", borderRadius: 10,
      background: t.surfaceAlt,
      border: `0.5px solid ${t.hair}`,
      fontSize: 13.5, lineHeight: 1.75, color: t.text,
      whiteSpace: "pre-wrap",
    }}>
      {text}
    </div>
  );
}

// Renders bullets that often follow "레이블: 본문" pattern. Splits on the first
// colon so the label can be emphasised while the body wraps naturally.
function StructuredBullets({ items }) {
  const { t } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((raw, i) => {
        const text = String(raw).trim();
        const m = text.match(/^([^:：]{1,40})[:：]\s*(.+)$/s);
        const label = m?.[1];
        const body = m?.[2] ?? text;
        return (
          <div key={i} style={{
            padding: "10px 14px", borderRadius: 8,
            background: t.surfaceAlt, border: `0.5px solid ${t.hair}`,
            display: "flex", gap: 10, alignItems: "flex-start",
          }}>
            <div style={{
              marginTop: 5, width: 4, height: 4, borderRadius: "50%",
              background: t.accent, flexShrink: 0,
            }}/>
            <div style={{ fontSize: 13, lineHeight: 1.65, color: t.text, minWidth: 0 }}>
              {label && (
                <span style={{ fontWeight: 700, color: t.text }}>{label}: </span>
              )}
              <span style={{ color: label ? t.textSecondary : t.text }}>{body}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Map old-format records (bullets/chapters/actions) to section shape for
// uniform rendering.
function legacyToSections(rec) {
  if (Array.isArray(rec.sections) && rec.sections.length) {
    return rec.sections;
  }
  const out = [];
  if (rec.bullets?.length) out.push({ heading: "핵심 포인트", bullets: rec.bullets });
  if (rec.chapters?.length) out.push({
    heading: "챕터",
    bullets: rec.chapters.map(c => `${c.t}: ${c.title}`),
  });
  if (rec.actions?.length) out.push({
    heading: "액션 아이템",
    bullets: rec.actions.map(a =>
      [a.who, a.text, a.due].filter(Boolean).join(" · ")
    ),
  });
  return out;
}

function TLDRCard({ text }) {
  const { t } = useTheme();
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 10,
      background: `linear-gradient(135deg, ${t.accentSoft}, ${t.surfaceAlt})`,
      border: `0.5px solid ${t.hair}`,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 6,
        fontSize: 10.5, fontWeight: 700, color: t.accentText,
        letterSpacing: "0.04em",
      }}>
        <IconSparkles size={11} color={t.accentText} />
        TL;DR
      </div>
      <div style={{
        fontSize: 14, lineHeight: 1.55, color: t.text, fontWeight: 500,
      }}>
        {text}
      </div>
    </div>
  );
}

function BulletList({ items }) {
  const { t } = useTheme();
  return (
    <ul style={{
      margin: 0, padding: 0, listStyle: "none",
      display: "flex", flexDirection: "column", gap: 2,
    }}>
      {items.map((b, i) => (
        <li key={i} style={{
          display: "flex", gap: 10, padding: "8px 2px",
          borderBottom: i < items.length - 1 ? `0.5px solid ${t.hair}` : "none",
          fontSize: 13, lineHeight: 1.5, color: t.text,
        }}>
          <span style={{
            width: 18, flexShrink: 0,
            fontSize: 11, color: t.textTertiary, fontVariantNumeric: "tabular-nums",
            paddingTop: 1,
          }}>{String(i+1).padStart(2,"0")}</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function ChapterList({ items, onJump }) {
  const { t } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((c, i) => (
        <div key={i} onClick={() => onJump?.(c.t)} style={{
          display: "grid", gridTemplateColumns: "58px 1fr 20px",
          alignItems: "center", gap: 10,
          padding: "9px 10px", borderRadius: 6, cursor: "pointer",
          transition: "background 80ms ease",
        }}
          onMouseEnter={e => e.currentTarget.style.background = t.sidebarItemHover}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{
            fontFamily: FONT_MONO, fontSize: 11, color: t.textTertiary,
          }}>{c.t}</span>
          <span style={{ fontSize: 13, color: t.text }}>{c.title}</span>
          <IconPlay size={10} color={t.textTertiary} />
        </div>
      ))}
    </div>
  );
}

function ActionList({ items }) {
  const { t } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((a, i) => (
        <label key={i} style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "10px 12px", borderRadius: 8,
          background: t.surfaceAlt, border: `0.5px solid ${t.hair}`,
          cursor: "pointer",
        }}>
          <span style={{
            width: 16, height: 16, marginTop: 1, borderRadius: 4,
            border: `1.2px solid ${t.hairStrong}`,
            background: t.surface,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: t.text, marginBottom: 3 }}>{a.text}</div>
            <div style={{
              display: "flex", gap: 8, fontSize: 11, color: t.textTertiary,
            }}>
              <span>@{a.who}</span>
              <span>·</span>
              <span>{a.due}</span>
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}

function TranscriptPreview({ items, onShowAll }) {
  const { t } = useTheme();
  const preview = items.slice(0, 4);
  return (
    <div style={{
      borderRadius: 10, background: t.surfaceAlt,
      border: `0.5px solid ${t.hair}`,
      overflow: "hidden",
    }}>
      {preview.map((s, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "50px 80px 1fr",
          gap: 10, padding: "10px 14px",
          borderBottom: i < preview.length - 1 ? `0.5px solid ${t.hair}` : "none",
        }}>
          <span style={{
            fontFamily: FONT_MONO, fontSize: 10.5, color: t.textTertiary, paddingTop: 2,
          }}>{s.t}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: t.text, paddingTop: 1 }}>{s.who}</span>
          <span style={{ fontSize: 12.5, lineHeight: 1.55, color: t.text }}>{s.text}</span>
        </div>
      ))}
      <div onClick={onShowAll} style={{
        padding: "10px 14px", textAlign: "center",
        fontSize: 12, color: t.info, cursor: "pointer", fontWeight: 500,
        background: t.surface, borderTop: `0.5px solid ${t.hair}`,
      }}>
        전체 트랜스크립트 보기 →
      </div>
    </div>
  );
}

function DetailBody({ rec, onJump, onShowAll }) {
  const { t } = useTheme();
  if (!rec) return null;
  if (rec.status === "analyzing") {
    return <AnalyzingInlineCard rec={rec} />;
  }
  const sections = legacyToSections(rec);
  return (
    <div>
      <DetailHeader rec={rec} />
      <Player rec={rec} />
      {rec.tldr && (
        <Section title="TL;DR" icon={IconSparkles}>
          <TLDRCard text={rec.tldr} />
        </Section>
      )}
      {rec.overview && (
        <Section title="요약" icon={IconDoc}>
          <OverviewCard text={rec.overview} />
        </Section>
      )}
      {sections.map((sec, i) => (
        <Section key={i} title={sec.heading} icon={IconCheck}>
          <StructuredBullets items={sec.bullets} />
        </Section>
      ))}
      {rec.transcript.length > 0 && (
        <Section title="트랜스크립트 미리보기" icon={IconDoc}>
          <TranscriptPreview items={rec.transcript} onShowAll={onShowAll} />
        </Section>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}

// Inline analyzing card (shown in detail when rec is still processing)
function AnalyzingInlineCard({ rec }) {
  const { t } = useTheme();
  return (
    <div style={{ padding: "40px 32px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: t.text }}>
        {rec.title}
      </h1>
      <div style={{ fontSize: 12, color: t.textTertiary, marginBottom: 30 }}>
        {rec.source} · {rec.duration} · {rec.size}
      </div>
      <AnimatedWaveform width={260} height={40} bars={28} />
      <div style={{ height: 24 }} />
      <div style={{
        fontSize: 13, color: t.accent, fontWeight: 600, letterSpacing: "0.01em",
      }}>
        분석 중 · {Math.round(rec.progress * 100)}%
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: t.textSecondary }}>
        트랜스크립트 추출 후 요약을 작성하고 있어요.
      </div>
      <div style={{ height: 28 }} />
      <CliConsole compact />
    </div>
  );
}

Object.assign(window, {
  DetailHeader, Player, Section, TLDRCard, OverviewCard, StructuredBullets,
  BulletList, ChapterList, ActionList, TranscriptPreview, DetailBody,
  AnalyzingInlineCard, legacyToSections,
});
