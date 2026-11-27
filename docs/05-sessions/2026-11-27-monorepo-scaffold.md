# 세션 로그: 모노레포 뼈대

> 날짜: 2026-11-27 · 단계: Phase 3

## 목표
PROGRESS 다음 할 일 2번 — pnpm workspaces 뼈대, CI, test-plan 통합, ADR-0009 확인 항목(버전 고정·vaul·번들 크기).

## 한 일
- 최신 안정판 조사 후 정확한 버전으로 고정. TypeScript 7.0은 typescript-eslint(`<6.1`)·NestJS CLI(`~6.0`) 미지원 → **6.0.3**
- **vaul README에 "unmaintained" 명시**(마지막 배포 2024-12) 확인 → 사용자 승인으로 시트도 Radix Dialog (ADR-0009 개정)
- 테스트 도구 사용자 선택: **Vitest 통일** (ADR-0010)
- `packages/shared`: 도메인 상수, `defaultNineExtFee`·`roundIncome`·`roundHalfUnits`·`averagePerRound`·`formatRoundCount`, 에러 타입(ADR-0008), Health 타입 + 단위 테스트(AC-008·AC-011)
- `apps/api`: NestJS 12, `/api/health`(DB 없음, `no-store`) + Supertest E2E, `configureApp()` 공유, Dockerfile(`pnpm deploy`)
- `apps/web`: Vite 8 + React 19, React Router(통계 지연 로딩), TanStack Query 기본값(ADR-0009), 쿼리 키·무효화 함수 + 테스트, vanilla-extract 토큰(44px), Pages Functions 프록시, `_headers`
- CI(포맷·린트·타입·테스트·빌드·초기 JS 200KB 검사), PR 템플릿(NFR-003 체크리스트), docker-compose(postgres:17)
- `test-plan.md`: 설계 4종 테스트 표를 T-ID로 통합

## 확인 결과
- `pnpm check` 통과: 테스트 20개(shared 17, web 1, api 2)
- 초기 JS gzip **110KB** (목표 200KB)
- API 빌드 결과물을 `pnpm deploy`로 묶어 단독 실행 → `/api/health` 200
- **미확인**: Docker 이미지 빌드(로컬 Docker 데몬 꺼짐), CI 실제 실행, Pages·Render 배포

## 변경된 문서/파일
- 코드: 루트 설정, `apps/*`, `packages/shared`, `.github/`
- `docs/03-decisions/ADR-0010-test-and-tooling.md` 신규, `ADR-0009` 개정, `ADR-0007` 명령 이름
- `docs/04-test/test-plan.md` 작성
- `architecture.md`·`api-spec.md`·`data-model.md`·`ui-design.md` 변경 이력, `CLAUDE.md` §7, `PROGRESS.md`

## 결정 사항
- ADR-0009 개정(vaul 제외), ADR-0010(Vitest·TS 6.0·Node 24)

## 새로 생긴 질문
- 없음

## 다음 세션에 넘길 것
- PR 병합 후 CI 첫 실행 확인
- 첫 배포(test-plan §6): Render Docker + Pages(`caddy-haru`) → Pages 주소로 `/api/health` 200, 카카오 Redirect URI 교체
- 사용자: age 키 생성

## 추가: Pages → Workers 전환 (같은 날 이어서)
- Cloudflare 대시보드가 Pages를 "레거시"로 표시 → 사용자 승인으로 **ADR-0002 개정**: Workers 정적 자산 + 같은 Worker의 `/api/*` 프록시
- `apps/web/functions/` 삭제 → `apps/web/worker/index.ts` + `wrangler.jsonc`(SPA 폴백, `run_worker_first`, `keep_vars`), wrangler 4.168.0 고정
- 확인: `wrangler deploy --dry-run` 통과, 로컬 `wrangler dev`에서 `/api/health` 프록시 200 · SPA 폴백 200 · `_headers` 캐시 적용
- 문서: ADR-0002 개정 절, architecture §1·§5.1·§7·§8, api-spec, ADR-0007, test-plan(T-D01·T-D06), CLAUDE.md, README, PROGRESS
- 남은 것: 대시보드 Worker `caddy-haru` 빌드 설정 변경 → 첫 배포, 카카오 Redirect URI를 workers.dev 주소로
- 대시보드에 비프로덕션 배포 명령·빌드 변수 칸이 안 보임 → `apps/web/scripts/deploy.mjs`로 브랜치별 분기(main만 `wrangler deploy`), Node 버전은 `.nvmrc`
