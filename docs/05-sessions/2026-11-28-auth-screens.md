# 세션 로그: 인증 화면 구현 (FR-040)

> 날짜: 2026-11-28 · 단계: Phase 3

## 목표
인증 API(PR #4·#5, 운영 확인 완료)에 맞춰 `apps/web`의 인증 화면 흐름을 설계(ui-design §1.3·§1.4·§2·§3.1·§4.1·§4.2·§4.3·§4.10·§8, architecture §5.3, api-spec §6 B1~B4, ADR-0009)대로 구현하고 테스트한다. 백엔드는 바꾸지 않는다.

## 한 일
- **fetch 래퍼** `src/shared/api/client.ts`·`errors.ts`: `credentials: 'same-origin'`, ADR-0008 본문 → `ApiRequestError`(`kind`·`status`·`code`·`requestId`). 401 → `onUnauthorized`(캐시 비우고 `/login` replace, 이미 `/login`이면 무시). 502·503·504·시간 초과(10초)·네트워크 오류: 조회는 깨운 뒤 1회 재시도, 저장은 재전송 없이 `unavailable`. 마지막 응답 뒤 14분이 지났으면 요청 전에 A1(저장은 깨어난 뒤 한 번만)
- **깨우기 상태** `server-wake.ts`: 모듈 하나에 상태(`useSyncExternalStore`). A1 8초 제한·3초 간격·1.5초 뒤 표시·3분 뒤 실패·[다시 시도]·[취소]·오프라인 대기. 동시에 기다려도 A1 반복은 하나
- **화면** `src/features/auth/`: `RootLayout`(앱 시작 A1 → SCR-00), `WakeScreen`(SCR-00, 1분 뒤 추가 문구·진행 막대), `WakeOverlay`(SCR-00o, Radix Dialog), `LoginPage`(SCR-06, `/login?error=` 문구 후 주소에서 제거, B1 페이지 이동·버튼 비활성, bfcache 복원 시 재활성, 로그인 상태면 `/`), `RequireAuth`(B4 가드, 401 아닌 오류는 다시 시도 화면), `session.ts`(401 처리·로그아웃)
- **SCR-05 설정** `src/features/settings/`: "계정" 묶음(로그아웃·서버 버전)만. 임시 홈에 [통계]·[설정] 링크
- **라우터**: `app/routes.tsx`(테스트가 메모리 라우터로 같은 표를 씀) → `RootLayout` > `/login` | `RequireAuth` > `/`·`/stats`·`/settings`
- **테스트** web 43개(전체 107개) 통과: T-W04·05·08·09, AC-040-3·4·5. jsdom 31.0.1 + Testing Library 추가(정확한 버전, ADR-0010 변경 이력)
- `pnpm check`·`pnpm build` 통과. 초기 JS gzip 125,653바이트(약 123KB, 뼈대 110KB → Radix Dialog 등 추가), 200KB 이하
- **로컬 확인**(`docker compose` DB + API `node dist/main.js` + Vite 프록시, 360×640): `/settings` → `/login`, `?error=cancelled` 배너·주소 정리, 버튼 328×52, `scrollWidth 360`. DB에 테스트 세션을 넣어 로그인 상태 재현 → `/login` → `/` → 설정 → 로그아웃(B3 204) → `/login` → 뒤로 가기 → `/login`, 데이터 없음, B4 401. API를 끈 채 열기 → 1.5초 뒤 깨우기 화면 → API 켜기 → 로그인 화면. 테스트 사용자·세션은 확인 뒤 삭제

## 변경된 문서/파일
- `apps/web/src/shared/api/{client,errors,server-wake,use-wake-state}.ts`, `query-keys.ts`(`me`), `shared/lib/browser.ts`, `shared/ui/button.css.ts`, `layout.css.ts`
- `apps/web/src/features/auth/*`, `features/settings/*`, `features/home/HomePage.tsx`, `app/{App,router,routes}.tsx`
- `apps/web/src/test/*`, `*.test.ts(x)`, `apps/web/vitest.config.ts`(jsdom), `apps/web/package.json`, `pnpm-lock.yaml`
- `docs/02-design/ui-design.md` — 변경 이력(설계에 없던 세부 결정), §8 카카오 버튼
- `docs/04-test/test-plan.md` — §1 화면 컴포넌트 도구, T-W04·05·08·09 결과, T-W01 수동 메모, Playwright 미설정
- `docs/03-decisions/ADR-0010-test-and-tooling.md` — 화면 컴포넌트 도구 추가
- `docs/PROGRESS.md`

## 결정 사항
- 설계에 없던 세부(ui-design 변경 이력에 기록): 모든 서버 응답(4xx 포함)을 "마지막 응답"으로 침, 일반 요청 제한 10초, 14분 사전 확인은 모든 요청, 로그아웃도 사전 확인(서버 세션이 남지 않게), 오프라인 복귀 시 경과 시간 0부터, 오버레이 Esc = 취소·바깥 누르기 무시
- 화면 컴포넌트 테스트는 Vitest + jsdom + Testing Library (ADR-0010에 추가, 새 ADR 아님)

## 새로 생긴 질문
- 없음

## 다음 세션에 넘길 것
- PR 병합 뒤 운영 확인: 실기기 카카오 로그인 → 설정 → 로그아웃 → 뒤로 가기(AC-040-3), 15분 넘게 둔 뒤 열어 깨우기 화면(NFR-002)
- 카카오 로그인 버튼을 최신 디자인 가이드 원문과 대조(ui-design §8)
- Playwright 설정(T-W01·02 360px·44px 자동 검사) — 화면이 늘어나기 전에
- 골프장(FR-004·006): SCR-05 골프장 목록, 저장 버튼 진행 표시(0.3초)·"다시 저장" 배너(`ApiRequestError.kind === 'unavailable'`)
