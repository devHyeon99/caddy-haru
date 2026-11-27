# ADR-0010: 테스트·개발 도구 — Vitest 하나로 통일, TypeScript 6.0 고정

> 상태: 승인 · 날짜: 2026-11-27 (사용자 승인 2026-11-27: Vitest 통일)

## 배경 (Context)
- 테스트는 인수 조건 ID를 참조해야 하고(CLAUDE.md §4-7), 단위·통합·API E2E·화면 E2E가 필요하다(`docs/04-test/test-plan.md`).
- 패키지가 세 개(`apps/web`·`apps/api`·`packages/shared`)인데 도구가 패키지마다 다르면 설정·학습 비용이 늘어난다(ADR-0007).
- NestJS는 데코레이터 메타데이터(`emitDecoratorMetadata`)로 의존성을 주입한다. Vite/Vitest 기본 변환기(esbuild)는 이 메타데이터를 만들지 못한다.
- 2026-11-27 기준 TypeScript 최신판은 7.0(Go 포팅)이지만 typescript-eslint 8.74는 `<6.1`, NestJS CLI 12는 `~6.0`만 지원한다.

## 선택지 (Options)
| 선택지 | 장점 | 단점 |
|---|---|---|
| **A. 전부 Vitest** (api는 SWC 플러그인) | 도구 하나·설정 방식 하나. 빠름. web은 Vite 설정 공유 | NestJS 공식 문서·예제는 Jest 기준이라 옮겨 읽어야 함. `unplugin-swc` 의존 |
| B. api는 Jest, 나머지 Vitest | NestJS 문서를 그대로 따라 하기 쉬움 | 도구 2개, 설정 2벌, `expect` API 차이 |

## 결정 (Decision)
| 항목 | 선택 |
|---|---|
| 단위·통합·API E2E | **Vitest** (모든 패키지). api는 `unplugin-swc`로 데코레이터 메타데이터 생성 |
| 화면 컴포넌트 (2026-11-28 추가) | Vitest + **jsdom** 31.0.1 + **Testing Library** (`@testing-library/react` 16.3.3·`dom` 10.4.2·`user-event` 14.6.13). web의 Vitest 환경은 jsdom. 같은 Vitest 안이라 이 ADR의 "도구 하나" 원칙을 유지한다 |
| API E2E 방식 | `@nestjs/testing`으로 앱을 메모리에서 띄우고 **Supertest**로 호출. `main.ts`와 같은 설정은 `configureApp()` 하나로 공유 |
| 화면 E2E | **Playwright** (ui-design §6 그대로, 화면 구현 때 추가) |
| 린트·포맷 | ESLint(flat config) + typescript-eslint + react-hooks, Prettier |
| TypeScript | **6.0.3 고정**. 7.x는 typescript-eslint·NestJS CLI가 지원하면 별도 PR로 올린다 |
| Node | **24** (`.nvmrc`, `engines`, Docker `node:24-slim`) |
| 모듈 방식 | `shared`·`web`은 ESM. `api`는 CommonJS(NestJS 기본)이고, Node 24의 `require(esm)`으로 `shared`를 불러온다 |
| 의존성 버전 | `.npmrc`의 `save-exact=true`로 정확한 버전 고정(ADR-0003·0009). pnpm 기본 `minimumReleaseAge`를 유지해 갓 나온 판은 설치하지 않는다 |

## 근거 / 결과 (Consequences)
- 좋은 점: `pnpm test` 하나로 세 패키지를 같은 방식으로 돌린다. 테스트 문법이 하나라 배우기 쉽다.
- 감수할 점: NestJS 예제의 `jest.fn()` 등은 `vi.fn()`으로 바꿔 읽는다. `unplugin-swc`가 Vitest 주 버전을 따라오는지 올릴 때 확인한다.
- 해야 할 일: DB 통합 테스트를 시작할 때 CI에 `postgres:17` 서비스 컨테이너를 추가한다(architecture §4).

## 변경 이력
- 2026-11-28 화면 컴포넌트 테스트 도구(jsdom + Testing Library) 추가 — 인증 화면 구현(T-W04·05·08·09)
