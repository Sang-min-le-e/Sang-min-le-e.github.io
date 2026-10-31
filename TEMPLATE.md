# 서버실 작성 템플릿

**면접까지 가는 컴퓨터 사이언스 서버실**은 CS 기초부터 백엔드, 인프라, CI/CD까지 직접 켜 보며 정리하는 공부 사이트입니다.

| 서버실 | 공부 | 예 |
|---|---|---|
| 랙 (`RACK-001` …) | 큰 주제 | RACK-001 · Computer Science |
| 서버 (`server-001` …) | 과목 | server-004 · Database |
| 램프 | 주제 하나 | 인덱스 |

이름은 불변 인프라(Immutable Infrastructure)처럼 번호로 붙입니다. 서버 번호는 랙을 넘어 이어지는 고유 일련번호이고, `topics.js`에 적힌 순서대로 자동으로 매겨집니다.

주제 하나를 **이해 → 직접 쓰기 → 만져 보기 → 면접 답변**까지 끝내는 방식입니다.
새 주제를 쓸 때마다 이 문서를 따라가세요.

---

## 1. 한 주제의 완료 기준

아래 네 가지가 모두 있으면 주제 하나가 끝난 것입니다.

- [ ] **내 말로 쓴 설명**: 01 정의, 02 왜 필요한가
- [ ] **만져 보는 실험 하나**: 값을 넣고 버튼을 누르면 동작이 보이는 것
- [ ] **면접 질문 2~3개와 내 답변**: 노트를 덮고 먼저 말해 본 뒤 적기
- [ ] **헷갈렸던 것 하나 이상**: 처음에 틀린 이해와 왜 틀렸는지

> AI가 쓴 설명을 그대로 붙이지 않습니다. AI는 검수, 시각화 코드, 면접 질문 목록 뽑기에만 씁니다.

---

## 2. 새 주제 추가 순서

1. **주제 고르기**: `assets/topics.js`에서 `status: "todo"`인 주제 중 하나
2. **파일 복사**: `_template.html` → `<과목폴더>/<slug>.html`
   - 예: 인덱스 → `db/index.html`
3. **파일 안 세 곳 바꾸기**
   - `<title>주제 이름 · CS 노트</title>`
   - `<body data-root="../" data-topic="db/index">`
   - `<h1>`과 `.lead` 문장
4. **목차 상태 바꾸기**: `assets/topics.js`에서 그 주제의 `status`를 `"draft"`로
   - 홈 링크, 진행도, 이전/다음 링크는 자동으로 바뀝니다.
5. **내용 채우기**: 아래 3장의 구성대로
6. **로컬에서 확인**: `cs-notes` 폴더에서 `python3 -m http.server` 실행 후 브라우저로 열기
7. **커밋**: `노트: <주제 이름> 초안` 같은 메시지로

### 과목 폴더와 slug

| 랙 | 서버 | 과목 | 폴더 | 예시 slug |
|---|---|---|---|---|
| RACK-001 · Computer Science | server-001 | Data Structure | `ds` | `hash-table`, `heap` |
| | server-002 | Algorithm | `algo` | `big-o`, `dp` |
| | server-003 | OS | `os` | `process-thread`, `deadlock` |
| | server-004 | Database | `db` | `index`, `transaction` |
| | server-005 | Network | `net` | `tcp-udp`, `http-https` |
| RACK-002 · Backend | server-006 | Spring | `spring` | `spring-di`, `jwt-auth` |
| | server-007 | Data Access | `data` | `jpa-n-plus-1`, `redis-cache` |
| RACK-003 · Infrastructure | server-008 | Linux | `linux` | `linux-basics` |
| | server-009 | Container | `container` | `docker-container` |
| | server-010 | Kubernetes | `k8s` | `pod-deployment`, `service` |
| | server-011 | Cloud | `cloud` | `vpc`, `load-balancer` |
| RACK-004 · CI/CD | server-012 | Git | `git` | `branch-strategy` |
| | server-013 | CI | `ci` | `github-actions` |
| | server-014 | CD | `cd` | `zero-downtime` |

- 폴더 이름은 랙이 달라도 겹치면 안 됩니다.
- 과목을 추가하려면 `topics.js`의 랙 `servers`에 하나 더 넣습니다. 랙에 서버가 한 칸 꽂힙니다.
- 큰 주제를 추가하려면 `RACKS`에 랙을 하나 더 넣습니다(`id`는 다음 번호, 예: `"005"`). 서버실에 랙이 한 대 늘어납니다.
- 서버를 중간에 끼워 넣으면 그 뒤 서버 번호가 하나씩 밀립니다. 번호를 고정하고 싶으면 새 서버는 맨 뒤 랙의 끝에 추가하세요.
- 홈은 서버실(랙들)과 모니터만 보여 줍니다. 랙을 누르면 그 랙 화면(`index.html#/rack/001`)으로, 서버를 누르면 랙 화면에서 그 서버 카드가 강조됩니다(`#/rack/001/ds`).
- 화면이 바뀔 때 누른 랙이 다음 화면의 랙 자리로 날아가는 전환 효과가 있습니다(View Transitions). 지원하지 않는 브라우저에서는 새 화면이 부드럽게 나타나기만 합니다.
- 다른 페이지에서 랙이나 서버로 링크할 때는 위 주소 형식을 씁니다.
- 모든 랙은 가장 서버가 많은 랙과 같은 높이로 그려지고, 남는 칸은 빈 패널로 채워집니다.

slug는 영어 소문자와 `-`만 씁니다.

---

## 3. 주제 페이지 구성

모든 주제는 같은 다섯 단계로 씁니다.

| 단계 | 제목 | 쓰는 것 | 분량 |
|---|---|---|---|
| — | 제목과 한 줄 소개 | 비유가 들어간 한 문장 | 1문장 |
| 01 | 한 줄 정의 | 교과서 말이 아니라 내 말로 | 2~3문장 |
| 02 | 왜 필요한가 | 이게 없으면 생기는 문제부터 | 1~2문단 |
| 03 | 만져 보기 | 인터랙티브 실험 + 실험해 볼 것 목록 | 실험 1개 |
| 04 | 면접 질문 | 질문 2~3개, 펼치면 내 답변 | 질문당 3~5문장 |
| 05 | 헷갈렸던 것 | 틀린 이해 → 왜 틀렸나 → 바른 이해 | 1개 이상 |

### 마크업 조각

**단계 제목**
```html
<h2><span class="step">01</span>한 줄 정의</h2>
```

**메모 상자** (안내, 헷갈린 점)
```html
<div class="note"><strong>헷갈렸던 것.</strong> 처음엔 ~라고 생각했는데, 실제로는 ~였다.</div>
```

**면접 질문**
```html
<details class="qa">
  <summary>질문 내용</summary>
  <div class="answer">내 답변</div>
</details>
```

**코드**
```html
<pre><code>SELECT * FROM users WHERE id = 1;</code></pre>
```
문장 안에서는 `<code>O(1)</code>`처럼 씁니다.

---

## 4. 실험(Lab) 만드는 법

### 기본 틀

```html
<div class="lab">
  <div class="lab-head">
    <span class="eyebrow">Lab · 실험 이름</span>
    <div class="stats" id="stats"></div>      <!-- 선택: 상태 숫자 -->
  </div>
  <div class="lab-controls">
    <input type="text" id="input" placeholder="값 입력">
    <button class="btn primary" id="run">실행</button>
    <button class="btn" id="reset">비우기</button>
  </div>
  <div id="view"></div>                        <!-- 그림이 그려지는 곳 -->
  <div class="lab-log" id="log">동작 과정 설명</div>
</div>
<p class="lab-caption">그림을 읽는 법 한 줄.</p>
```

### 실험 설계 규칙

- **보여줄 것 하나만 정합니다.** 예: 해시 테이블은 "충돌이 생기면 비교 횟수가 늘어난다".
- **과정이 보이게** 합니다. 결과만 보여주지 말고 한 단계씩 강조합니다(`await sleep(350)`).
- **로그에 숫자를 남깁니다.** "4번 칸에서 2번 비교" 처럼 면접에서 말할 수 있는 형태로.
- **"일부러 망가뜨리기" 버튼**을 하나 둡니다. 예: 충돌 일으키기, 교착 상태 만들기, 인덱스 끄기.
- 페이지 전용 CSS는 그 페이지의 `<style>`에, 공통 스타일은 `assets/style.css`에 둡니다.

### 주제별 실험 아이디어

| 주제 | 실험 |
|---|---|
| 스택과 큐 | push/pop, enqueue/dequeue를 눌러 쌓이는 순서 비교 |
| 힙 | 값을 넣을 때 위로 올라가며 자리 바꾸는 과정 |
| 시간 복잡도 | n을 늘리면 O(n), O(n²), O(log n) 연산 횟수 막대 비교 |
| 그래프 탐색 | 같은 그래프에서 BFS와 DFS 방문 순서 비교 |
| CPU 스케줄링 | FCFS, SJF, RR 간트 차트와 평균 대기 시간 |
| 교착 상태 | 프로세스 두 개가 락을 하나씩 잡고 서로 기다리는 모습 |
| 인덱스 | 인덱스 없을 때 전체 스캔 vs B+Tree 탐색 비교 횟수 |
| 격리 수준 | 트랜잭션 두 개를 번갈아 실행하며 보이는 값 비교 |
| 3-way handshake | SYN, SYN-ACK, ACK 패킷이 오가는 시퀀스 |
| Docker 이미지 | 레이어가 쌓이고, 바뀐 레이어 위로만 다시 빌드되는 과정 |
| 쿠버네티스 Pod | 레플리카 수를 바꾸거나 Pod를 죽이면 다시 뜨는 모습 |
| 쿠버네티스 Service | 요청이 여러 Pod로 나뉘어 가는 모습 |
| CI/CD | 커밋 → 빌드 → 테스트 → 배포 단계가 차례로 켜지는 파이프라인 |
| JPA N+1 | 조회 버튼을 누르면 실행되는 쿼리 개수 카운트 |
| Redis 캐시 | 캐시 hit/miss에 따른 응답 시간 비교 |

---

## 5. 상태 단계

`assets/topics.js`의 `status` 값입니다.

| 값 | 표시 | 랙 램프 | 기준 |
|---|---|---|---|
| `todo` | 예정 (회색) | 꺼짐 | 아직 파일 없음. 홈에서 링크되지 않음 |
| `draft` | 초안 (테두리) | 연한 블루, 깜빡임 | 파일은 있지만 완료 기준 네 가지 중 빠진 게 있음 |
| `understood` | 이해함 (블루) | 블루 | 완료 기준 네 가지를 다 채움 |
| `interview` | 면접 가능 (초록) | 초록 | 노트 없이 면접 질문에 막힘없이 답할 수 있음 |

서버 왼쪽 위 전원 램프는 그 과목에서 주제를 하나라도 시작하면 초록으로 켜집니다.

`understood` → `interview`로 올리기 전에 **노트를 덮고 소리 내어 답해 보세요.**

---

## 6. 디자인 규칙 (요약)

라이트 모드 전용입니다. 다크 모드는 만들지 않습니다.

### 색

| 용도 | 토큰 | 값 |
|---|---|---|
| 강조, 링크, 기본 버튼 | `--primary` | `#2560ff` |
| 기본 버튼 테두리 | `--primary-dark` | `#003db5` |
| 링크 hover | `--link-hover` | `#3860be` |
| 포커스 링, 진행 중 강조 | `--focus-tint` | `#c0e0fa` |
| 완료/정답 강조 (채움 전용) | `--accent` | `#68b631` |
| 페이지 배경 | `--bg` | `#f9fafb` |
| 카드, 실험 상자 | `--surface` | `#ffffff` |
| 코드, 메모 상자 | `--code-bg` | `#e7eaef` |
| 테두리 | `--border` | `#c8cfda` |
| 본문 | `--text` | `#2c333f` |
| 설명 텍스트 | `--text-2` | `#434c5f` |
| 보조 텍스트 | `--text-3` | `#566581` |

| 서버 랙 프레임 | `--rack` | `#2c333f` |
| 서버 본체 | `--rack-2` | `#434c5f` |
| 레일, 명판, 꺼진 램프 테두리 | `--rack-3` | `#566581` |

- 초록(`--accent`)은 **글자색으로 쓰지 않습니다.** 배경으로 칠하고 글자는 `#2c333f`.
- 새 색을 추가하지 말고 위 토큰만 씁니다.
- 어두운 슬레이트는 홈의 랙 그림에만 씁니다. 장비 목록 같은 페이지 요소는 흰 카드와 1px 테두리, 블루 라벨로 처리합니다.
- 블루는 버튼, 링크, 라벨, 램프에만 씁니다.

### 형태

- 버튼 라운드 4px, 배지 2px
- 테두리는 1px
- 버튼과 입력창 높이는 최소 44px
- 그림자는 거의 쓰지 않습니다. 기본 버튼의 안쪽 링(`--shadow-ring`)만 씁니다.
- 간격은 4의 배수(4, 8, 12, 16, 24, 32, 48, 64)

### 글자

| 용도 | 크기 / 굵기 |
|---|---|
| 페이지 제목 | 48px / 500 |
| 단계 제목 | 24px / 600 |
| 본문 (주제 페이지) | 17px / 400, 행간 1.75 |
| UI, 버튼 | 14px / 600 |
| 작은 라벨 (eyebrow) | 12px / 600, 대문자, 자간 0.08em |

### 공통 클래스

| 클래스 | 쓰임 |
|---|---|
| `.btn`, `.btn.primary` | 보조 버튼, 기본 버튼 |
| `.badge.todo/.draft/.understood/.interview` | 상태 배지 |
| `.eyebrow` | 섹션 위 작은 라벨 |
| `.note` | 회색 메모 상자 |
| `.lab`, `.lab-controls`, `.lab-log`, `.lab-caption` | 실험 영역 |
| `.qa` | 면접 질문 접기 |
| `.led-dot.todo/.draft/.understood/.interview` | 목록과 범례의 램프 점 |
| `.card` | 일반 카드 |

---

## 7. 작성 체크리스트 (복사해서 쓰기)

```
주제: 
파일: 

[ ] topics.js status를 draft로 바꿈
[ ] 01 정의를 내 말로 씀
[ ] 02 왜 필요한가를 "없으면 생기는 문제"부터 씀
[ ] 03 실험: 보여줄 것 하나를 정함
[ ] 03 실험: 일부러 망가뜨리는 버튼이 있음
[ ] 03 실험: 로그에 숫자가 남음
[ ] 04 면접 질문 2~3개, 노트 덮고 먼저 답해 봄
[ ] 05 헷갈렸던 것 1개 이상
[ ] 로컬에서 열어 보고 휴대폰 너비에서도 확인
[ ] 다 채웠으면 status를 understood로
[ ] 커밋
```
