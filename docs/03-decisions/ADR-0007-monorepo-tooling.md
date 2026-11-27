# ADR-0007: 모노레포 도구 — pnpm workspaces (Turborepo 없음) + packages/shared

> 상태: 승인 · 날짜: 2026-11-27

## 배경 (Context)
ADR-0002에서 저장소 하나에 `apps/web`(React)과 `apps/api`(NestJS)를 두기로 했다. 패키지 관리 도구와, 프론트·백엔드가 같이 쓰는 코드를 어디에 둘지 정해야 한다.
- 나인추가 기본 금액(⌊캐디피 ÷ 2⌋ × 횟수, AC-008-9), 반 라운드 단위 계산(NFR-005), 금액 상한·부(1·2·3부)·나인추가 최대 2회 같은 규칙을 프론트(자동 채움·즉시 안내)와 백엔드(최종 강제) 양쪽에서 똑같이 써야 한다.
- **NFR-006** 추적성, 1개월 일정, 앱은 2개뿐.

## 선택지 (Options)
| 선택지 | 장점 | 단점 |
|---|---|---|
| **pnpm workspaces** | 설치가 빠르고 디스크를 적게 씀. 선언하지 않은 의존성은 쓸 수 없어서(엄격) 실수를 막음. `workspace:*`로 내부 패키지 연결 | pnpm을 따로 설치해야 함(Corepack으로 해결) |
| npm workspaces | 추가 설치 없음 | 의존성이 덜 엄격해서 선언 안 한 패키지가 우연히 동작할 수 있음 |
| pnpm + Turborepo | 빌드 캐시, 작업 순서 관리 | 앱 2개에는 과함. 배울 것만 늘어남 |

## 결정 (Decision)
**pnpm workspaces를 채택한다.** Turborepo 없이 시작한다. (사용자 선택, 2026-11-27)

- `pnpm-workspace.yaml`: `apps/*`, `packages/*`
- `packages/shared`: 런타임 의존성 없는 순수 TypeScript. 도메인 상수, 계산 함수, API 요청·응답 타입
- 루트 `package.json`의 `packageManager` 필드로 pnpm 버전을 고정(Corepack)
- Render Docker 빌드는 저장소 루트를 컨텍스트로 잡고 `pnpm --filter api... build`로 shared까지 빌드한다. Cloudflare Pages는 루트에서 `pnpm --filter web build`
- 디렉터리 구조: `docs/02-design/architecture.md` §7

## 근거 / 결과 (Consequences)
**좋은 점**
- 계산식이 한 곳에만 있어서 프론트 자동 채움과 서버 검증이 어긋나지 않는다(NFR-005). 단위 테스트도 한 번만 쓴다.
- 엄격한 의존성 관리로 "내 컴퓨터에서는 되는데 배포하면 안 되는" 문제가 줄어든다.

**감수할 점**
- Cloudflare Pages·Render 빌드 설정이 모노레포를 인식하도록 맞춰야 한다(구현 1주차에 확인).
- 빌드가 느려지면 그때 Turborepo를 검토한다.

## 변경 이력
- 2026-11-27 작성·승인 (사용자 선택: pnpm workspaces)
