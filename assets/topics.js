// 사이트 전체 목차. 새 주제를 쓰면 여기서 status만 바꾸면 홈과 이전/다음 링크가 자동으로 바뀐다.
// status: "todo"(예정, 링크 없음) | "draft"(초안) | "understood"(이해함) | "interview"(면접 가능)
// 파일 위치: <chapter.dir>/<topic.slug>.html
window.TOPICS = [
  {
    dir: "ds", title: "자료구조", desc: "데이터를 담는 그릇과 그 그릇을 고르는 기준",
    topics: [
      { slug: "array-vs-list", name: "배열과 연결 리스트", hook: "붙어 사는 집, 쪽지로 이어진 집", status: "todo" },
      { slug: "stack-queue", name: "스택과 큐", hook: "나중에 온 사람 먼저 vs 줄 선 순서대로", status: "todo" },
      { slug: "hash-table", name: "해시 테이블", hook: "이름만 대면 바로 꺼내는 사물함", status: "draft" },
      { slug: "tree-bst", name: "트리와 이진 탐색 트리", hook: "반씩 버리며 찾기", status: "todo" },
      { slug: "heap", name: "힙", hook: "제일 급한 일부터", status: "todo" },
    ],
  },
  {
    dir: "algo", title: "알고리즘", desc: "문제를 푸는 절차와 그 빠르기를 재는 법",
    topics: [
      { slug: "big-o", name: "시간 복잡도", hook: "입력이 10배 늘면 몇 배 느려질까", status: "todo" },
      { slug: "sorting", name: "정렬", hook: "퀵, 병합, 그리고 언제 무엇을", status: "todo" },
      { slug: "graph-search", name: "그래프 탐색", hook: "BFS는 물결, DFS는 미로", status: "todo" },
      { slug: "dp", name: "동적 계획법", hook: "한 번 푼 건 다시 안 푼다", status: "todo" },
      { slug: "shortest-path", name: "최단 경로", hook: "다익스트라의 욕심", status: "todo" },
    ],
  },
  {
    dir: "os", title: "운영체제", desc: "여러 프로그램이 컴퓨터 하나를 나눠 쓰는 법",
    topics: [
      { slug: "process-thread", name: "프로세스와 스레드", hook: "집 한 채와 그 안의 식구들", status: "todo" },
      { slug: "scheduling", name: "CPU 스케줄링", hook: "누구에게 CPU를 줄까", status: "todo" },
      { slug: "sync", name: "동기화와 경쟁 상태", hook: "동시에 고치면 생기는 일", status: "todo" },
      { slug: "deadlock", name: "교착 상태", hook: "서로 양보 안 하는 교차로", status: "todo" },
      { slug: "virtual-memory", name: "가상 메모리", hook: "모두가 메모리를 독차지한 척", status: "todo" },
    ],
  },
  {
    dir: "db", title: "데이터베이스", desc: "많은 데이터를 빠르고 안전하게 다루는 법",
    topics: [
      { slug: "index", name: "인덱스", hook: "책 뒤의 찾아보기, B+Tree", status: "todo" },
      { slug: "transaction", name: "트랜잭션과 ACID", hook: "전부 하거나, 아예 안 하거나", status: "todo" },
      { slug: "isolation", name: "격리 수준", hook: "남의 작업이 어디까지 보일까", status: "todo" },
      { slug: "normalization", name: "정규화", hook: "같은 정보는 한 곳에만", status: "todo" },
      { slug: "join", name: "조인", hook: "두 표를 엮는 세 가지 방법", status: "todo" },
    ],
  },
  {
    dir: "net", title: "네트워크", desc: "전선 위의 비트에서 웹 페이지까지",
    topics: [
      { slug: "layers", name: "프로토콜 계층", hook: "편지 봉투 속 봉투", status: "todo" },
      { slug: "tcp-udp", name: "TCP와 UDP", hook: "등기우편과 전단지", status: "todo" },
      { slug: "handshake", name: "3-way handshake", hook: "들려? 들려! 그래 시작하자", status: "todo" },
      { slug: "http-https", name: "HTTP와 HTTPS", hook: "엽서와 잠긴 상자", status: "todo" },
      { slug: "dns", name: "DNS", hook: "인터넷의 전화번호부", status: "todo" },
    ],
  },
  {
    dir: "stack", title: "내 기술 스택", desc: "프로젝트에서 직접 부딪히며 배운 것들",
    topics: [
      { slug: "spring-request", name: "Spring 요청 흐름", hook: "요청이 컨트롤러에 닿기까지", status: "todo" },
      { slug: "spring-di", name: "DI와 IoC", hook: "객체를 내가 안 만드는 이유", status: "todo" },
      { slug: "jpa-n-plus-1", name: "JPA N+1 문제", hook: "쿼리 한 번이 백한 번이 될 때", status: "todo" },
      { slug: "redis-cache", name: "Redis 캐시", hook: "자주 찾는 건 집 앞에", status: "todo" },
      { slug: "docker", name: "Docker", hook: "내 컴퓨터에선 되는데요, 를 없애기", status: "todo" },
    ],
  },
];
