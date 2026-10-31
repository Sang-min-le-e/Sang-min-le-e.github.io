// Production 랙에 꽂히는 프로젝트 목록. 서버 이름은 prod-001부터 순서대로 자동으로 붙는다.
// status: "live"(운영 중) | "dev"(개발 중) | "archived"(보관)
// sample: true 이면 화면에 "예시" 표시가 붙는다.
// 링크가 아직 없으면 빈 문자열로 두면 "준비 중"으로 표시된다.
// features, troubles가 비어 있으면 그 칸은 화면에 나오지 않는다.
// 트러블슈팅처럼 긴 글은 troubles 대신 doc에 마크다운 파일로 써도 된다.
window.PROJECTS = [
  {
    id: "001",
    name: "예술적인 소프트웨어 - TOMO",
    summary: "지적장애인 자녀를 둔 보호자를 위한 루틴 관리 앱",
    status: "dev",
    period: "2026.09 – 진행 중",
    role: "앱 프론트엔드 (Flutter)",
    team: "6인 팀 · 경희대 예술적인 소프트웨어 수업",
    // 상세 화면 맨 위에 나오는 소개 문단
    intro: "6인 팀에서 Flutter 앱 프론트엔드를 맡아, 팀의 Spring Boot 백엔드와 REST API로 연동했습니다. 로그인, 내 정보, 자녀, 루틴, 루틴 템플릿 API를 화면에 연결했고, 저장하면 관련된 화면(달력, 오늘 할 일, 홈)이 서버 데이터를 다시 불러오도록 Riverpod 상태 흐름을 설계했습니다.",
    // 마크다운 본문(선택). 파일을 만들고 경로를 적으면 상세 화면 아래에 이어서 나온다. 예: "projects/001.md"
    doc: "",
    stack: ["Flutter", "Dart", "Riverpod", "go_router", "Dio", "Hive", "BLE"],
    links: { github: "https://github.com/Sang-min-le-e/pretty_sw", demo: "" },
    // 저장 요청이 흘러가는 순서대로
    architecture: ["Flutter 화면", "Riverpod Actions", "Repository", "Dio · REST API", "Spring Boot 백엔드"],
    features: [
      "로그인과 첫 로그인 3단계 설정(보호자, 자녀 정보)",
      "자녀 등록과 자녀별 루틴 관리",
      "루틴 달력, 추가, 수정, 삭제, 템플릿",
      "기기 연결을 위한 BLE 스캔 (연동 진행 중)",
      "프로필 사진, 회원 탈퇴",
      "Figma 디자인을 기준으로 화면 구현",
    ],
    troubles: [],
  },
];
