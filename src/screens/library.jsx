// Library screen — list of recordings. Used by multiple layouts.

function RecordingRow({ rec, selected, onClick, dense }) {
  const { t } = useTheme();
  const [hover, setHover] = React.useState(false);

  const bg = selected ? t.sidebarItemActive : hover ? t.sidebarItemHover : "transparent";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "grid",
        gridTemplateColumns: dense ? "1fr auto" : "22px 1fr 120px 60px 90px 28px",
        alignItems: "center",
        gap: 10,
        padding: dense ? "9px 12px" : "10px 14px",
        borderRadius: 6,
        background: bg,
        cursor: "pointer",
        transition: "background 80ms ease",
      }}>
      {!dense && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%",
            background: rec.status === "analyzing" ? t.accentSoft : t.surfaceSunken,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `0.5px solid ${t.hair}`,
          }}>
            {rec.status === "analyzing"
              ? <IconSparkles size={10} color={t.accent} />
              : <IconWaveform size={10} color={t.textSecondary} />}
          </div>
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 3,
        }}>
          {rec.starred && <IconStar size={10} color="#E8A72B" />}
          <div style={{
            fontSize: 13, fontWeight: 500, color: t.text,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>{rec.title}</div>
        </div>
        <div style={{
          fontSize: 11, color: t.textTertiary,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
        }}>
          {rec.status === "analyzing"
            ? <span style={{ color: t.accent }}>
                <span className="pulse-dot" style={{
                  display: "inline-block", width: 5, height: 5, borderRadius: "50%",
                  background: t.accent, marginRight: 6, verticalAlign: "middle"
                }}/>
                분석 중 · {Math.round(rec.progress * 100)}%
              </span>
            : (rec.tldr || `${rec.speakers.join(", ")} · ${rec.tags.join(", ")}`)}
        </div>
      </div>
      {!dense && <>
        <div>
          <Waveform width={110} height={18} bars={28} />
        </div>
        <div style={{ fontSize: 11, color: t.textSecondary, fontVariantNumeric: "tabular-nums" }}>
          {rec.duration}
        </div>
        <div style={{ fontSize: 11, color: t.textTertiary }}>
          {rec.dateShort}
        </div>
        <IconChevron size={11} color={t.textTertiary} />
      </>}
    </div>
  );
}

function LibraryHeader({ title = "모든 녹음", count, rightExtra }) {
  const { t } = useTheme();
  return (
    <div style={{
      display: "flex", alignItems: "baseline", gap: 10,
      padding: "18px 20px 12px", justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <h1 style={{
          margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em",
          color: t.text
        }}>{title}</h1>
        <span style={{ fontSize: 13, color: t.textTertiary }}>{count}개</span>
      </div>
      {rightExtra}
    </div>
  );
}

// Column header (for list)
function ListColumns({ cols }) {
  const { t } = useTheme();
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "22px 1fr 120px 60px 90px 28px",
      gap: 10, padding: "6px 14px",
      borderBottom: `0.5px solid ${t.hair}`,
      fontSize: 10.5, fontWeight: 600, color: t.textTertiary,
      textTransform: "uppercase", letterSpacing: "0.04em",
    }}>
      <div />
      <div>{cols[0]}</div>
      <div>{cols[1]}</div>
      <div>{cols[2]}</div>
      <div>{cols[3]}</div>
      <div />
    </div>
  );
}

function LibraryList({ items, selectedId, onSelect, dense }) {
  const { t } = useTheme();
  return (
    <div style={{ padding: dense ? "0 4px" : "0 10px" }}>
      {!dense && <ListColumns cols={["제목", "파형", "길이", "날짜"]} />}
      <div style={{ padding: dense ? "4px 0" : "6px 0" }}>
        {items.map(r => (
          <RecordingRow key={r.id} rec={r}
            selected={selectedId === r.id}
            onClick={() => onSelect?.(r.id)}
            dense={dense}
          />
        ))}
      </div>
    </div>
  );
}

// Drop zone — "import" empty area
function ImportDropzone() {
  const { t } = useTheme();
  const analyzer = useAnalyzer?.();
  const live = analyzer?.available;
  const hint = live
    ? "파일을 선택하면 whisper로 트랜스크립션 후 Claude CLI로 요약합니다."
    : "iCloud · Voice Memos · AirDrop에서 자동 동기화되며, 직접 파일을 끌어다 놓을 수도 있어요.";
  return (
    <div style={{
      margin: "14px 20px 20px",
      padding: "18px 20px",
      borderRadius: 8,
      border: `1px dashed ${t.hairStrong}`,
      background: t.surfaceAlt,
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: t.accentSoft, color: t.accent,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <IconUpload size={18} color={t.accent} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 2 }}>
          녹음 파일을 여기로 드래그하세요
        </div>
        <div style={{ fontSize: 11.5, color: t.textSecondary }}>{hint}</div>
      </div>
      <Button size="sm" variant="secondary" icon={IconFolder}
        onClick={() => analyzer?.pickAndAnalyze()}>
        파일 선택
      </Button>
    </div>
  );
}

Object.assign(window, { RecordingRow, LibraryHeader, LibraryList, ImportDropzone });
