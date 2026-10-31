// Production 랙에 꽂히는 프로젝트 목록. 서버 이름은 prod-001부터 순서대로 자동으로 붙는다.
// status: "live"(운영 중) | "dev"(개발 중) | "archived"(보관)
// sample: true 이면 화면에 "예시" 표시가 붙는다. 실제 프로젝트로 바꾸면 지운다.
// 링크가 아직 없으면 빈 문자열로 두면 "준비 중"으로 표시된다.
window.PROJECTS = [
  {
    id: "001",
    sample: true,
    name: "FitLog",
    summary: "운동 기록과 AI 루틴 추천 서비스",
    status: "dev",
    period: "2026.12 – 2027.02 (예정)",
    role: "백엔드 1인 개발",
    team: "개인 프로젝트",
    stack: ["Java 17", "Spring Boot", "JPA", "MySQL", "Redis", "Docker", "NCP", "GitHub Actions"],
    links: { github: "", demo: "" },
    // 요청이 흘러가는 순서대로
    architecture: ["Client", "Nginx", "Spring Boot API", "MySQL", "Redis (캐시)", "LLM API"],
    features: [
      "운동 기록 CRUD와 주간 통계",
      "JWT 로그인",
      "최근 기록을 바탕으로 한 AI 루틴 추천",
      "GitHub Actions로 NCP 서버에 자동 배포",
    ],
    troubles: [
      {
        title: "기록 목록 조회가 느려짐",
        problem: "운동 기록 30개를 불러오는 API가 1초 넘게 걸렸다.",
        cause: "기록마다 운동 종목을 따로 불러오는 JPA N+1 쿼리가 31번 실행되고 있었다.",
        solution: "fetch join으로 한 번에 불러오도록 바꾸고, 쿼리 로그로 실행 횟수를 확인했다.",
        result: "쿼리 31번 → 1번, 응답 시간 [측정값] ms",
      },
    ],
  },
];
