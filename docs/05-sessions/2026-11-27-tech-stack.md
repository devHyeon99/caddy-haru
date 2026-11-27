# 세션 로그: 기술 스택 결정 (ADR-0002)

> 날짜: 2026-11-26 ~ 2026-11-27 · 단계: Phase 2

## 목표
기술 스택 선택지를 비교하고, 사용자가 고른 안을 ADR-0002로 남긴다.
조건: 카카오 로그인, 무료 티어만, 모바일 웹, 서버 측 데이터 분리(NFR-003), 1개월 MVP.

## 한 일
- 처음 제안한 3안(Supabase / Next.js + Neon / Firebase)을 비교했다.
- 사용자 목표를 반영해 방향을 다시 잡았다. 사용자는 백엔드 학습, 풀스택 취업("Node.js / NestJS 백엔드 API 개발 경험"), 나중에 Spring 재구현을 원했다.
- 호스팅 제약을 확인했다.
  - Vercel은 기존 프로젝트와 한도를 나눠 써야 해서 제외했다.
  - 계정을 새로 만드는 방법은 약관 위반이고 포트폴리오에도 손해라서 제외했다.
- 무료 호스팅을 공식 문서로 조사했다(2026-11-27): Render, Railway, 클라우드타입, Netlify, Cloudflare Workers, Oracle Always Free, Neon.
- 사용자가 **React + NestJS + Neon, Render 무료(크론 없이 시작)**를 선택했고, ADR-0002를 작성했다.

## 변경된 문서/파일
- `docs/03-decisions/ADR-0002-tech-stack.md` — 신규. 선택지, 결정, 설계 규칙, 무료 한도·사용량 계산(AC-N007-1)
- `docs/01-requirements/srs.md` — NFR-002(Should·초안)에 콜드 스타트 예외 추가, 변경 이력
- `docs/01-requirements/open-questions.md` — Q-025 추가
- `docs/02-design/architecture.md` — 구성도, 기술 스택 표
- `CLAUDE.md` — §7 기술 스택 요약
- `docs/PROGRESS.md` — 완료·다음 할 일 갱신

## 결정 사항
- ADR-0002: React(Vite) → Cloudflare Pages, NestJS → Render 무료(Dockerfile), Neon PostgreSQL, 카카오 OAuth + httpOnly 쿠키, 모노레포
- `/api/*`는 Pages Functions 프록시로 같은 도메인 유지 (Safari 쿠키, CORS 대응)
- `/api/health`는 DB 접근 금지. 크론을 쓰면 Neon이 24시간 켜져 약 16일째에 한도를 넘기 때문
- 크론 상시 기동은 처음에는 쓰지 않는다. 느리면 그때 검토하거나 유료로 전환한다
- ORM은 ADR-0003에서 결정

## 새로 생긴 질문
- Q-025: AC-N001-3 측정 시작점 → **같은 세션에서 해결** (서버가 깨어난 뒤부터 30초, SRS 확정 후 변경 이력에 기록)

## 다음 세션에 넘길 것
- architecture.md 상세: NestJS 레이어, 인증 흐름, 백업 방식
- data-model.md + ADR-0003(ORM)
- 일정 위험: 백엔드 학습 때문에 M3가 1~2주 밀릴 수 있다. 1주차에 로그인 → API → DB 저장을 끝까지 연결한다
