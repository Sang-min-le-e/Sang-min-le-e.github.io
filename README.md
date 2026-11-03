# My Compiled Datacenter

**https://sang-min-le-e.github.io/**

CS 기초부터 백엔드, 인프라, CI/CD까지 직접 만져 보며 정리하는 공부 사이트이자 포트폴리오입니다.
데이터센터를 컨셉으로, 공부한 주제는 랙의 램프로 켜지고 만든 프로젝트는 Production 랙에 꽂힙니다.

운영자: 이상민 · 경희대학교 소프트웨어융합학과 23학번 · [Profile](https://sang-min-le-e.github.io/#/profile)

## 데이터센터 구성

| 데이터센터 | 의미 | 예 |
|---|---|---|
| **Study Rack** (`RACK-001` ~ `RACK-004`) | 큰 주제 | Computer Science, Backend, Infrastructure, CI/CD |
| 서버 (`server-001` …) | 과목 | Data Structure, OS, Database, Kubernetes … |
| 램프 | 주제 하나 | 해시 테이블, 교착 상태, 인덱스 … |
| **Production Rack** (`prod-001` …) | 직접 만든 프로젝트 | 예술적인 소프트웨어 - TOMO |

램프는 공부한 정도에 따라 켜집니다.

| 램프 | 상태 | 기준 |
|---|---|---|
| 꺼짐 | 예정 | 아직 정리하지 않음 |
| 연한 블루 (깜빡임) | 초안 | 정리 중 |
| 블루 | 이해함 | 설명, 실험, 면접 질문, 헷갈린 점까지 정리함 |
| 초록 | 면접 가능 | 노트 없이 면접 질문에 답할 수 있음 |

주제마다 **직접 조작해 보는 실험**과 **내 말로 쓴 면접 답변**을 함께 둡니다.

## 기술

- HTML, CSS, JavaScript만으로 만든 정적 사이트 (프레임워크, 빌드 도구 없음)
- 화면 전환: 주소의 `#`로 화면을 바꾸고, [View Transitions API](https://developer.mozilla.org/docs/Web/API/View_Transitions_API)로 누른 랙이 다음 화면 자리로 이어지게 함
- 서버 랙 그림: 데이터(`assets/topics.js`)를 읽어 SVG로 그림
- Production 랙: GitHub API로 `projects/` 폴더의 파일 목록을 읽어 자동으로 배치
- 배포: GitHub Pages. `main`에 푸시하면 자동으로 다시 배포됨


## 내용 추가하기

- **주제**: `_template.html`을 `<과목폴더>/<이름>.html`로 복사해 쓰고, `assets/topics.js`에서 그 주제의 `status`를 바꿉니다.
- **면접 답변**: 주제 페이지 주소 끝에 `?edit`를 붙여 열고 GitHub 토큰으로 저장합니다. 저장하면 `assets/answers.json`에 커밋되어 다시 배포됩니다.
- **프로젝트**: `projects/_template.html`을 `projects/002-이름.html`로 복사해 쓰고 푸시하면 Production 랙에 자동으로 꽂힙니다.

자세한 규칙과 디자인 토큰은 [TEMPLATE.md](TEMPLATE.md)에 있습니다.

