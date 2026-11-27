# 캐디하루 (CaddyHaru) — 프로젝트 규칙 (모든 세션 필독)

이 파일은 Claude 세션이 시작될 때 자동으로 읽힌다. 모든 작업은 아래 규칙을 따른다.

## 1. 프로젝트 한 줄 요약
**캐디하루**(영문 표기 `CaddyHaru`, 식별자 `caddy-haru`) — 저장소 `devHyeon99/caddy-haru`.
지인 캐디 몇 명이 각자 계정으로 라운드별 캐디피·오버피를 휴대폰으로 기록하고,
월/연 수입 통계와 연간 총액(종합소득세 신고 참고용)을 확인하는 모바일 우선 웹앱.
운영비 0원(무료 티어) 제약. 목적은 실사용 + 학습/포트폴리오.

## 2. 현재 단계
> 단계가 바뀔 때마다 이 줄을 갱신한다.

**현재: Phase 3 — 구현** · Must 요구사항 확정 2026-11-26 · 설계 확정(M1) 2026-11-27

| Phase | 이름 | 산출물 | 상태 |
|---|---|---|---|
| 0 | 기획 | `docs/00-overview/` | 완료 |
| 1 | 요구사항 정의 | `docs/01-requirements/` | 완료 (Must 확정) |
| 2 | 설계 | `docs/02-design/` | 완료 (설계 4종 확정) |
| 3 | 구현 | `src/` + 테스트 | 진행 중 |
| 4 | 검증/배포 | `docs/04-test/`, 배포 문서 | 대기 |

## 3. 문서 지도 (어디에 무엇이 있나)
- 전체 목차: `docs/README.md`
- 진행 상황/다음 할 일: `docs/PROGRESS.md` ← **세션 시작 시 가장 먼저 읽기**
- 세션 지시 방법: `docs/SESSION_GUIDE.md`
- 결정 기록(ADR): `docs/03-decisions/`
- 세션 작업 로그: `docs/05-sessions/`

## 4. 작업 원칙 (소프트웨어 공학 규칙)
1. **문서 먼저, 코드 나중.** 요구사항(FR/NFR) ID가 없는 기능은 구현하지 않는다.
2. **추적성 유지.** 요구사항 → 설계 → 코드 → 테스트가 ID로 연결된다.
   - 요구사항: `FR-001`, `NFR-001` / 유스케이스: `UC-01` / 결정: `ADR-0001`
   - 커밋 메시지와 코드 주석에 관련 ID를 적는다. 예: `feat(round): 라운드 등록 (FR-001)`
3. **결정은 ADR로 남긴다.** 기술 스택, 구조, 트레이드오프가 있는 선택은 `docs/03-decisions/`에 기록.
4. **추측 금지.** 도메인(캐디 업무, 세금) 관련 불확실한 내용은 `docs/01-requirements/open-questions.md`에 질문으로 남기고 사용자에게 확인한다.
5. **변경 시 문서 동기화.** 코드가 설계와 달라지면 설계 문서를 먼저(또는 같이) 고친다.
6. **확정된 요구사항 변경은 사용자 승인 필수.** `srs.md`에서 상태가 "확정"인 요구사항·인수 조건은 사용자에게 먼저 묻고, 승인받으면 SRS 변경 이력에 남긴다.
7. **테스트는 인수 조건 ID를 참조한다.** 예: 테스트 이름이나 주석에 `AC-005-3`.

## 5. 세션 종료 시 반드시 할 일
1. `docs/PROGRESS.md`의 "최근 완료 / 다음 할 일" 갱신
2. `docs/05-sessions/YYYY-MM-DD-주제.md`에 세션 로그 작성 (템플릿: `docs/templates/session-log.md`)
3. 새 결정이 있었으면 ADR 추가, 새 질문이 있었으면 open-questions에 추가

## 6. 문서 작성 규칙
- **사용자에게 하는 설명·답변·요약·질문은 무조건 한국어로 한다.** (작업 완료 보고, 선택지 질문, 다음 단계 안내 포함. 코드 식별자·기술 용어는 영어 허용)
- 언어: 한국어 (코드 식별자·기술 용어는 영어 허용)
- 형식: Markdown, 다이어그램은 Mermaid
- 각 문서 상단에 `상태(초안/검토중/확정)`, `최종 수정일` 표기
- 확정된 문서를 바꿀 때는 문서 하단 "변경 이력"에 한 줄 추가

## 7. 기술 스택
> 상세와 근거: `docs/03-decisions/ADR-0002-tech-stack.md`
- 프론트엔드: React + Vite + TypeScript (SPA) → Cloudflare Pages · React Router · TanStack Query(메모리 캐시만) · vanilla-extract · Radix Dialog(시트 포함) (ADR-0009)
- 테스트·도구: Vitest 전 패키지(api는 SWC) + Supertest, 화면 E2E Playwright, TypeScript **6.0 고정**, Node 24, 의존성 정확한 버전 (ADR-0010). 테스트 목록은 `docs/04-test/test-plan.md`
- 백엔드: NestJS + TypeScript (REST API) → Render 무료 (Dockerfile)
- DB: Neon (PostgreSQL) · ORM: **Drizzle** (버전 고정, 스키마는 `docs/02-design/data-model.md` §4 DDL과 일치, ADR-0003)
- 인증: 카카오 OAuth(이메일 없이 회원번호) + **DB 세션**(`__Host-sid` httpOnly 쿠키, 토큰은 SHA-256 해시로 저장, ADR-0004). `/api/*`는 Pages Functions 프록시로 같은 도메인 유지
- 데이터 분리: Repository 메서드 첫 인자 `userId: UserId` 필수, `WHERE id AND user_id`, 복합 FK (ADR-0005)
- 백업: Neon 즉시 복원(6시간) + GitHub Actions 매일 age 암호화 `pg_dump`(90일), 개인키는 GitHub 밖 (ADR-0006)
- 저장소: pnpm workspaces 모노레포 `apps/web`, `apps/api`, `packages/shared` (ADR-0007). 상세 설계: `docs/02-design/architecture.md`
- 지켜야 할 규칙: `/api/health`는 DB 접근 금지, 서버 메모리에 상태 저장 금지, 서버 시작 시 DB 연결·마이그레이션 금지(lazy 연결), 모든 쿼리에 사용자 ID 강제(NFR-003), Render 무료 서비스는 1개만
