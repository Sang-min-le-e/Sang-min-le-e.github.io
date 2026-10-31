// 사이트 전체 목차: 랙(큰 주제) → 서버(과목) → 램프(주제).
// 새 주제를 쓰면 여기서 status만 바꾸면 홈의 램프, 모니터, 이전/다음 링크가 자동으로 바뀐다.
// status: "todo"(예정, 링크 없음) | "draft"(초안) | "understood"(이해함) | "interview"(면접 가능)
// 파일 위치: <server.dir>/<topic.slug>.html   (dir은 랙이 달라도 겹치면 안 된다)window.RACKS = [
  {
    id: "001", name: "Computer Science", desc: "면접 CS 질문의 뿌리. 모든 랙이 이 위에 선다.",
    servers: [
      {
        dir: "ds", title: "Data Structure", desc: "데이터를 담는 그릇과 그 그릇을 고르는 기준",
        topics: [
          { slug: "array-vs-list", name: "배열과 연결 리스트", hook: "붙어 사는 집, 쪽지로 이어진 집", status: "todo" },
          { slug: "stack-queue", name: "스택과 큐", hook: "나중에 온 사람 먼저 vs 줄 선 순서대로", status: "todo" },
          { slug: "hash-table", name: "해시 테이블", hook: "이름만 대면 바로 꺼내는 사물함", status: "draft" },
          { slug: "tree-bst", name: "트리와 이진 탐색 트리", hook: "반씩 버리며 찾기", status: "todo" },
          { slug: "heap", name: "힙", hook: "제일 급한 일부터", status: "todo" },
        ],
      },
      {
        dir: "algo", title: "Algorithm", desc: "문제를 푸는 절차와 그 빠르기를 재는 법",
        topics: [
          { slug: "big-o", name: "시간 복잡도", hook: "입력이 10배 늘면 몇 배 느려질까", status: "todo" },
          { slug: "sorting", name: "정렬", hook: "퀵, 병합, 그리고 언제 무엇을", status: "todo" },
          { slug: "graph-search", name: "그래프 탐색", hook: "BFS는 물결, DFS는 미로", status: "todo" },
          { slug: "dp", name: "동적 계획법", hook: "한 번 푼 건 다시 안 푼다", status: "todo" },
          { slug: "shortest-path", name: "최단 경로", hook: "다익스트라의 욕심", status: "todo" },
        ],
      },
      {
        dir: "os", title: "OS", desc: "여러 프로그램이 컴퓨터 하나를 나눠 쓰는 법",
        topics: [
          { slug: "process-thread", name: "프로세스와 스레드", hook: "집 한 채와 그 안의 식구들", status: "todo" },
          { slug: "scheduling", name: "CPU 스케줄링", hook: "누구에게 CPU를 줄까", status: "todo" },
          { slug: "sync", name: "동기화와 경쟁 상태", hook: "동시에 고치면 생기는 일", status: "todo" },
          { slug: "deadlock", name: "교착 상태", hook: "서로 양보 안 하는 교차로", status: "todo" },
          { slug: "virtual-memory", name: "가상 메모리", hook: "모두가 메모리를 독차지한 척", status: "todo" },
        ],
      },
      {
        dir: "db", title: "Database", desc: "많은 데이터를 빠르고 안전하게 다루는 법",
        topics: [
          { slug: "index", name: "인덱스", hook: "책 뒤의 찾아보기, B+Tree", status: "todo" },
          { slug: "transaction", name: "트랜잭션과 ACID", hook: "전부 하거나, 아예 안 하거나", status: "todo" },
          { slug: "isolation", name: "격리 수준", hook: "남의 작업이 어디까지 보일까", status: "todo" },
          { slug: "normalization", name: "정규화", hook: "같은 정보는 한 곳에만", status: "todo" },
          { slug: "join", name: "조인", hook: "두 표를 엮는 세 가지 방법", status: "todo" },
        ],
      },
      {
        dir: "net", title: "Network", desc: "전선 위의 비트에서 웹 페이지까지",
        topics: [
          { slug: "layers", name: "프로토콜 계층", hook: "편지 봉투 속 봉투", status: "todo" },
          { slug: "tcp-udp", name: "TCP와 UDP", hook: "등기우편과 전단지", status: "todo" },
          { slug: "handshake", name: "3-way handshake", hook: "들려? 들려! 그래 시작하자", status: "todo" },
          { slug: "http-https", name: "HTTP와 HTTPS", hook: "엽서와 잠긴 상자", status: "todo" },
          { slug: "dns", name: "DNS", hook: "인터넷의 전화번호부", status: "todo" },
        ],
      },
    ],
  },
  {
    id: "002", name: "Backend", desc: "요청을 받아 데이터를 꺼내고 응답하기까지",
    servers: [
      {
        dir: "spring", title: "Spring", desc: "요청이 들어와서 응답이 나가기까지",
        topics: [
          { slug: "spring-request", name: "Spring 요청 흐름", hook: "요청이 컨트롤러에 닿기까지", status: "todo" },
          { slug: "spring-di", name: "DI와 IoC", hook: "객체를 내가 안 만드는 이유", status: "todo" },
          { slug: "jwt-auth", name: "JWT 인증", hook: "로그인 상태를 서버가 기억하지 않는 법", status: "todo" },
        ],
      },
      {
        dir: "data", title: "Data Access", desc: "DB를 덜 부르고, 똑똑하게 부르는 법",
        topics: [
          { slug: "jpa-n-plus-1", name: "JPA N+1 문제", hook: "쿼리 한 번이 백한 번이 될 때", status: "todo" },
          { slug: "redis-cache", name: "Redis 캐시", hook: "자주 찾는 건 집 앞에", status: "todo" },
        ],
      },
    ],
  },
  {
    id: "003", name: "Infrastructure", desc: "만든 서버를 띄우고, 늘리고, 지키는 법",
    servers: [
      {
        dir: "linux", title: "Linux", desc: "화면 없는 서버와 대화하는 법",
        topics: [
          { slug: "linux-basics", name: "리눅스 기본", hook: "서버에는 화면이 없다", status: "todo" },
          { slug: "process-port", name: "프로세스와 포트", hook: "누가 8080을 쓰고 있지?", status: "todo" },
        ],
      },
      {
        dir: "container", title: "Container", desc: "어디서든 똑같이 돌아가게 포장하기",
        topics: [
          { slug: "docker-container", name: "Docker 이미지와 컨테이너", hook: "내 컴퓨터에선 되는데요, 를 없애기", status: "todo" },
          { slug: "docker-network", name: "Docker 네트워크와 볼륨", hook: "컨테이너끼리 말 걸기, 꺼져도 남기기", status: "todo" },
        ],
      },
      {
        dir: "k8s", title: "Kubernetes", desc: "컨테이너 여러 개를 알아서 돌보기",
        topics: [
          { slug: "pod-deployment", name: "Pod와 Deployment", hook: "죽으면 알아서 다시 뜨는 서버", status: "todo" },
          { slug: "service", name: "Service", hook: "여러 Pod에 요청 나눠 주기", status: "todo" },
        ],
      },
      {
        dir: "cloud", title: "Cloud", desc: "남의 데이터센터에 내 서버 세우기",
        topics: [
          { slug: "vpc", name: "VPC와 서브넷", hook: "클라우드 안에 내 동네 만들기", status: "todo" },
          { slug: "load-balancer", name: "로드밸런서", hook: "손님을 여러 창구로 안내하기", status: "todo" },
        ],
      },
    ],
  },
  {
    id: "004", name: "CI/CD", desc: "코드가 커밋에서 운영 서버까지 가는 길",
    servers: [
      {
        dir: "git", title: "Git", desc: "여럿이 한 코드를 안 깨고 고치는 법",
        topics: [
          { slug: "branch-strategy", name: "브랜치 전략", hook: "main을 지키는 규칙", status: "todo" },
          { slug: "pull-request", name: "PR과 코드 리뷰", hook: "합치기 전에 한 번 더 보기", status: "todo" },
        ],
      },
      {
        dir: "ci", title: "CI", desc: "커밋할 때마다 빌드하고 테스트하기",
        topics: [
          { slug: "github-actions", name: "GitHub Actions", hook: "커밋이 방아쇠", status: "todo" },
          { slug: "test-automation", name: "테스트 자동화", hook: "깨지면 바로 알려 주기", status: "todo" },
        ],
      },
      {
        dir: "cd", title: "CD", desc: "사람 손 안 대고 안전하게 배포하기",
        topics: [
          { slug: "deploy-pipeline", name: "배포 파이프라인", hook: "빌드 결과물이 서버까지", status: "todo" },
          { slug: "zero-downtime", name: "무중단 배포", hook: "손님이 모르게 서버 바꾸기", status: "todo" },
        ],
      },
    ],
  },
];
