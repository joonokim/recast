// Mock data for recordings

const RECORDINGS = [
  {
    id: "r1",
    title: "제품팀 주간 싱크",
    source: "iCloud",
    date: "오늘, 오후 2:14",
    dateShort: "2:14 PM",
    duration: "34:12",
    durationSec: 34 * 60 + 12,
    size: "41.2 MB",
    status: "done",
    speakers: ["민지", "Alex", "Jordan", "Priya"],
    tags: ["미팅", "제품"],
    starred: true,
    tldr: "라이브러리 페이지 성능 이슈 해결을 위해 가상 스크롤과 썸네일 프리페치를 도입하기로 결정. iOS 퍼블릭 베타는 2주 내 목표.",
    bullets: [
      "라이브러리 스크롤 랙을 가상 스크롤로 해결 — Alex 담당",
      "썸네일 프리페치 정책을 3항목 선행으로 조정",
      "iOS 퍼블릭 베타 2주 내 목표, QA는 이번 주 금요일부터",
      "Android 파일럿은 다음 스프린트로 연기"
    ],
    chapters: [
      { t: "00:00", title: "지난 주 액션아이템 리뷰" },
      { t: "04:22", title: "라이브러리 성능 이슈" },
      { t: "11:50", title: "가상 스크롤 접근" },
      { t: "19:10", title: "iOS 베타 일정 조율" },
      { t: "27:02", title: "Android 파일럿 연기" },
      { t: "31:18", title: "다음 주 액션아이템" }
    ],
    actions: [
      { who: "Alex", text: "가상 스크롤 POC 목요일까지", due: "목요일" },
      { who: "Jordan", text: "QA 리그레션 스윕 시작", due: "금요일" },
      { who: "민지", text: "베타 런치 체크리스트 공유", due: "내일" },
      { who: "Priya", text: "Android 파일럿 타임라인 재조정", due: "다음 주" }
    ],
    transcript: [
      { t: "00:00", who: "민지", text: "안녕하세요 다들. 지난주 액션아이템 먼저 빠르게 훑고 시작할게요." },
      { t: "00:14", who: "Alex", text: "네, 저는 라이브러리 스크롤 프로파일링 끝냈고 병목이 거의 확실합니다." },
      { t: "00:32", who: "민지", text: "오 좋아요. 어디서 터졌어요?" },
      { t: "00:38", who: "Alex", text: "썸네일 디코딩이 메인 쓰레드에서 돌고 있었어요. 목록이 200개 넘어가면 프레임이 드롭됩니다." },
      { t: "01:05", who: "Jordan", text: "그게 지난주 버그 리포트랑 맞네요. iPad Pro에서도 비슷한 증상이었어요." },
      { t: "01:22", who: "Alex", text: "네. 해결 방향은 두 가지인데, 가상 스크롤로 가면서 프리페치 윈도우를 좁게 가져가는 걸 추천해요." },
      { t: "02:00", who: "Priya", text: "프리페치는 지금 10개 선행이죠? 몇 개로 줄일 생각이에요?" },
      { t: "02:10", who: "Alex", text: "3개면 충분할 것 같아요. 벤치마크 돌려봤는데 체감 차이 거의 없어요." }
    ]
  },
  {
    id: "r2",
    title: "김대표님 1:1",
    source: "Voice Memos",
    date: "오늘, 오전 10:02",
    dateShort: "10:02 AM",
    duration: "22:48",
    durationSec: 22 * 60 + 48,
    size: "26.7 MB",
    status: "analyzing",
    speakers: ["나", "김대표"],
    tags: ["1:1"],
    starred: false,
    progress: 0.62,
    tldr: null,
    bullets: [],
    chapters: [],
    actions: [],
    transcript: []
  },
  {
    id: "r3",
    title: "고객 인터뷰 — 수지네 꽃집",
    source: "AirDrop",
    date: "어제, 오후 4:30",
    dateShort: "Yesterday",
    duration: "48:05",
    durationSec: 48 * 60 + 5,
    size: "58.1 MB",
    status: "done",
    speakers: ["나", "수지"],
    tags: ["리서치", "고객"],
    starred: true,
    tldr: "주문 관리와 재고가 가장 큰 페인 포인트. 꽃 종류별 회전율 데이터가 없어 발주가 감에 의존 — 대시보드 수요 뚜렷.",
    bullets: [
      "매일 아침 발주를 손으로 계산 — 15~20분 소요",
      "꽃 종류별 회전율 데이터 없음, 감에 의존",
      "주말 주문 피크에 카톡/전화/DM 혼재로 놓치는 주문 多",
      "월 매출 대시보드 없음, 엑셀 수기 입력"
    ],
    chapters: [
      { t: "00:00", title: "가게 소개 & 일과" },
      { t: "08:15", title: "발주 프로세스" },
      { t: "18:40", title: "재고 관리 이슈" },
      { t: "29:12", title: "고객 주문 채널" },
      { t: "41:30", title: "원하는 기능" }
    ],
    actions: [
      { who: "나", text: "회전율 리포트 목업 공유", due: "다음 주" },
      { who: "나", text: "2주 뒤 베타 테스트 제안", due: "2주 후" }
    ],
    transcript: [
      { t: "00:00", who: "나", text: "수지님, 오늘 시간 내주셔서 감사드려요. 간단히 가게 소개 부탁드릴게요." },
      { t: "00:15", who: "수지", text: "네. 6년차 동네 꽃집이에요. 주로 동네 단골이랑 결혼식 부케 주문이 반반이에요." }
    ]
  },
  {
    id: "r4",
    title: "디자인 리뷰 드래프트",
    source: "iCloud",
    date: "어제, 오후 1:15",
    dateShort: "Yesterday",
    duration: "12:20",
    durationSec: 12 * 60 + 20,
    size: "14.8 MB",
    status: "done",
    speakers: ["나"],
    tags: ["메모"],
    starred: false,
    tldr: "새 온보딩 플로우 3안 중 B안이 가장 가벼움. 인지부하 관점에서 A는 과함, C는 스텝이 많음.",
    bullets: [
      "B안: 3스텝, 각 스텝당 단일 결정",
      "A안은 선택지가 너무 많음 — 분석 마비 우려",
      "C안은 플로우가 길어 이탈률 위험",
      "다음 주 유저테스트 3명과 비교 세션"
    ],
    chapters: [
      { t: "00:00", title: "B안 장점" },
      { t: "04:12", title: "A안 이슈" },
      { t: "08:30", title: "유저테스트 계획" }
    ],
    actions: [],
    transcript: []
  },
  {
    id: "r5",
    title: "팟캐스트 아이디어 브레인스토밍",
    source: "Voice Memos",
    date: "3일 전",
    dateShort: "Mon",
    duration: "18:55",
    durationSec: 18 * 60 + 55,
    size: "22.4 MB",
    status: "done",
    speakers: ["나"],
    tags: ["아이디어"],
    starred: false,
    tldr: "디자이너의 사이드 프로젝트를 인터뷰하는 포맷 — 매주 1인, 30분 내. 첫 게스트 후보 5명.",
    bullets: [], chapters: [], actions: [], transcript: []
  },
  {
    id: "r6",
    title: "엔지니어링 AMA",
    source: "AirDrop",
    date: "지난주",
    dateShort: "Last week",
    duration: "1:02:40",
    durationSec: 62 * 60 + 40,
    size: "74.9 MB",
    status: "done",
    speakers: ["팀 전체"],
    tags: ["팀", "미팅"],
    starred: false,
    tldr: "Q2 로드맵 공개, 채용 계획, 온콜 순환 개선안 논의.",
    bullets: [], chapters: [], actions: [], transcript: []
  },
  {
    id: "r7",
    title: "새벽 3시 아이디어 메모",
    source: "Voice Memos",
    date: "지난주",
    dateShort: "Last week",
    duration: "02:11",
    durationSec: 131,
    size: "2.6 MB",
    status: "done",
    speakers: ["나"],
    tags: ["메모"],
    starred: false,
    tldr: "아침형 리추얼 앱 컨셉 — 기상 직후 3줄 음성 저널링.",
    bullets: [], chapters: [], actions: [], transcript: []
  }
];

const SIDEBAR_NAV = [
  { id: "all", label: "모든 녹음", icon: "waveform", count: 7 },
  { id: "starred", label: "즐겨찾기", icon: "star", count: 2 },
  { id: "recent", label: "최근", icon: "clock", count: 4 },
  { id: "analyzing", label: "분석 중", icon: "sparkles", count: 1 }
];

const SIDEBAR_SOURCES = [
  { id: "icloud", label: "iCloud", icon: "cloud", count: 3 },
  { id: "voicememos", label: "Voice Memos", icon: "mic", count: 3 },
  { id: "airdrop", label: "AirDrop 폴더", icon: "airdrop", count: 1 }
];

const SIDEBAR_TAGS = [
  { id: "meeting", label: "미팅", color: "#E85A3C" },
  { id: "oneone", label: "1:1", color: "#0A84FF" },
  { id: "research", label: "리서치", color: "#22A06B" },
  { id: "idea", label: "아이디어", color: "#BF5AF2" },
  { id: "memo", label: "메모", color: "#8B8B93" }
];

// Fake CLI log lines for analyzing screen
const CLI_LOG = [
  { t: "10:02:14", k: "info", s: "claude-cli", m: "starting analyze task for 1-1_recording.m4a" },
  { t: "10:02:14", k: "dim",  s: "claude-cli", m: "detected: audio/m4a · 22m 48s · 26.7 MB" },
  { t: "10:02:15", k: "info", s: "transcribe", m: "uploading to whisper-large-v3 ..." },
  { t: "10:02:21", k: "ok",   s: "transcribe", m: "upload complete (chunked, 4 parts)" },
  { t: "10:02:22", k: "info", s: "transcribe", m: "chunk 1/4 ..." },
  { t: "10:03:04", k: "ok",   s: "transcribe", m: "chunk 1/4 done · 312 segments" },
  { t: "10:03:05", k: "info", s: "transcribe", m: "chunk 2/4 ..." },
  { t: "10:03:41", k: "ok",   s: "transcribe", m: "chunk 2/4 done · 288 segments" },
  { t: "10:03:42", k: "info", s: "diarize",    m: "identifying speakers ..." },
  { t: "10:04:02", k: "ok",   s: "diarize",    m: "2 speakers detected (나, 김대표)" },
  { t: "10:04:03", k: "info", s: "claude",     m: "drafting summary · claude-opus-4" },
  { t: "10:04:03", k: "dim",  s: "claude",     m: "prompt · 6,421 tokens · in" },
  { t: "10:04:19", k: "info", s: "claude",     m: "extracting chapters ..." },
];

Object.assign(window, {
  RECORDINGS, SIDEBAR_NAV, SIDEBAR_SOURCES, SIDEBAR_TAGS, CLI_LOG
});
