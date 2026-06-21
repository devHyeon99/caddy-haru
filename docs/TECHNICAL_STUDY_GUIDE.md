# 캐디하루 기술 학습 가이드

- 기준 프로젝트: 캐디하루 웹 MVP
- 작성일: 2026-06-21
- 목적: 현재까지 사용한 기술과 배포 구조를 이해하고, 이후 기능 개발에 필요한 학습 순서를 정리한다.

## 1. 먼저 알아둘 현재 기술 구성

캐디하루에서 실제로 사용 중인 구성은 다음과 같다.

| 영역          | 사용 기술                      | 프로젝트에서의 역할                                          |
| ------------- | ------------------------------ | ------------------------------------------------------------ |
| 언어          | TypeScript                     | 화면, 도메인 타입, API 입출력의 오류를 개발 단계에서 검사    |
| UI            | React 19                       | 컴포넌트와 사용자 상호작용 구현                              |
| 프레임워크    | Next.js 16 App Router          | 라우팅, Server Component, Server Action, Route Handler, 빌드 |
| 스타일        | vanilla-extract                | TypeScript 기반 CSS와 디자인 토큰 구현                       |
| 서버 상태     | TanStack Query 5               | Supabase 데이터 조회, 캐시, 변경 상태 관리                   |
| 인증·DB       | Supabase                       | 카카오 OAuth, 세션, PostgreSQL, RLS 제공                     |
| 패키지 관리   | pnpm 11                        | 의존성 설치, 잠금 파일, 스크립트 실행                        |
| 번들링·컴파일 | Webpack + SWC                  | Next.js 번들 생성과 TypeScript/JSX 변환                      |
| 테스트        | Vitest, Testing Library, pgTAP | 유틸리티·컴포넌트·데이터베이스 정책 검증                     |
| 코드 품질     | ESLint, Prettier, TypeScript   | 정적 분석, 포맷, 타입 검사                                   |
| CI/CD         | GitHub Actions                 | PR 검증, DB 검증, 수동 운영 배포                             |
| 호스팅        | Cloudflare Workers + OpenNext  | Next.js 애플리케이션 실행 및 정적 자산 제공                  |

### 현재 사용하지 않는 기술

- **Yarn Berry**: 후보로 논의했지만 현재 프로젝트는 pnpm으로 통일했다. 두 패키지 관리자를 함께 사용하지 않는다.
- **Babel**: 별도 Babel 설정이 없다. Next.js 기본 SWC 컴파일러를 사용한다.
- **Vercel**: Next.js의 대표 호스팅이지만 현재 운영 대상은 Cloudflare Workers다.

`package.json`과 `pnpm-lock.yaml`이 현재 기술 선택의 기준이다. 문서나 과거 논의보다 실제 설정 파일을 우선한다.

## 2. 전체 구조 이해하기

```text
브라우저
  ├─ React / Next.js 화면
  ├─ TanStack Query 캐시
  └─ Supabase Browser Client
          │ HTTPS + 사용자 세션
          ▼
Supabase
  ├─ Kakao OAuth 인증
  ├─ PostgreSQL
  └─ RLS로 사용자별 데이터 격리

GitHub PR
  └─ GitHub Actions 검증
          │ merge 후 수동 배포
          ▼
OpenNext 빌드
  └─ Cloudflare Worker + 정적 자산
```

핵심 원칙은 다음과 같다.

1. 브라우저에 영구 저장하는 급여 데이터는 없다.
2. Supabase publishable key는 공개 가능한 키지만, 데이터 접근은 인증과 RLS로 제한한다.
3. 각 캐디는 자신의 `profiles`, `round_entries` 행에만 접근한다.
4. UI의 서버 상태는 TanStack Query가 관리하고, 실제 원본 데이터는 Supabase에 둔다.
5. 모든 변경은 브랜치와 PR을 거쳐 CI 통과 후 `main`에 반영한다.

## 3. TypeScript와 React

### 공부할 내용

- 기본 타입, 유니온, 인터페이스, 제네릭
- `Omit`, `Pick`, `as const` 같은 유틸리티 타입
- 함수 매개변수와 반환 타입
- React 컴포넌트, props, state, event
- `useState`, `useEffect`, `useMemo`, `useCallback`
- Context와 Provider
- controlled form과 비동기 UI 상태

### 프로젝트에서 확인할 코드

- `src/lib/calendar.ts`: 핵심 라운드 타입과 날짜 계산
- `src/app/providers.tsx`: Query Client와 테마 Context
- `src/features/dashboard/calendar-dashboard.tsx`: 화면 상태와 CRUD 상호작용
- `src/features/onboarding/onboarding-form.tsx`: 폼 입력과 검증

### 이해해야 할 구분

React state는 모달 열림, 선택 날짜, 입력값 같은 **화면 상태**에 적합하다. Supabase에서 조회한 라운드 목록처럼 서버가 원본인 데이터는 React state에 중복 보관하기보다 TanStack Query로 관리한다.

## 4. Next.js App Router

### 공부할 내용

- `app` 디렉터리 기반 라우팅
- `layout.tsx`, `page.tsx`, `route.ts`의 차이
- Server Component와 Client Component의 경계
- `"use client"`와 `"use server"`
- Server Action과 Route Handler
- 쿠키를 사용하는 서버 인증
- middleware의 요청 전처리
- 정적 렌더링과 동적 렌더링

### 프로젝트에서 확인할 코드

- `src/app/layout.tsx`: 루트 레이아웃과 전역 Provider
- `src/app/page.tsx`: 인증 후 메인 캘린더 진입
- `src/app/login/page.tsx`: 로그인 화면
- `src/app/auth/actions.ts`: 로그아웃 Server Action
- `src/app/auth/callback/route.ts`: OAuth code를 세션으로 교환
- `src/middleware.ts`: 모든 주요 요청에서 Supabase 세션 갱신

### 현재의 Cloudflare 호환성 주의점

Next.js 16은 `proxy.ts`를 권장하지만 OpenNext의 현재 Edge 인증 처리와 맞추기 위해 `middleware.ts`를 사용한다. 빌드의 deprecation 경고는 알고 선택한 호환성 조치다. OpenNext가 Node.js proxy를 지원하게 되면 다시 검토한다.

## 5. pnpm, Webpack, SWC

### pnpm

공부할 내용:

- `package.json`과 `pnpm-lock.yaml`의 역할
- dependencies와 devDependencies의 차이
- `pnpm install --frozen-lockfile`
- npm scripts 실행 방식
- pnpm의 content-addressable store와 엄격한 의존성 접근
- 설치 스크립트 보안을 위한 `allowBuilds`

자주 쓰는 명령:

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

새 패키지는 `pnpm add 패키지명`, 개발 전용 패키지는 `pnpm add -D 패키지명`으로 추가한다. 다른 패키지 관리자로 lockfile을 만들지 않는다.

### Webpack과 SWC

- Webpack은 여러 모듈과 자산을 배포 가능한 번들로 묶는다.
- SWC는 TypeScript와 JSX를 빠르게 JavaScript로 변환하고 최적화한다.
- 현재 `next dev --webpack`, `next build --webpack`으로 Webpack 사용을 명시한다.
- Babel 설정은 없으며, 특별한 플러그인 요구가 생기기 전에는 추가하지 않는다.

초기 단계에서는 Webpack 설정을 직접 작성하는 법보다 Next.js가 빌드 파이프라인을 어떻게 감싸는지 이해하는 것이 우선이다.

## 6. vanilla-extract와 디자인 시스템

### 공부할 내용

- CSS Module 방식과 CSS-in-TS의 차이
- `style`, `styleVariants`, `globalStyle`
- `createTheme`과 시맨틱 디자인 토큰
- 라이트·다크 테마 전환
- 반응형 레이아웃과 모바일 우선 설계
- 접근성: 명암비, 포커스, 44px 이상 터치 영역

### 프로젝트에서 확인할 코드

- `src/styles/theme.css.ts`: 색상과 테마 토큰
- `src/features/auth/auth-shell.css.ts`: 최대 너비 480px 로그인 레이아웃
- `src/features/dashboard/calendar-dashboard.css.ts`: 캘린더 화면 스타일
- `src/app/theme-script.tsx`: 초기 테마 적용과 hydration 대응

컴포넌트에서 색상 hex 값을 직접 반복하지 않고 `background`, `textPrimary`, `actionPrimary` 같은 의미 기반 토큰을 사용해야 한다. 이후 React Native로 확장할 때도 토큰 이름은 공유할 수 있지만 CSS 구현 자체는 공유할 수 없다.

## 7. TanStack Query와 CRUD

### 공부할 내용

- 서버 상태와 클라이언트 상태의 차이
- Query key 설계
- `useQuery`, `useMutation`, `useQueryClient`
- stale time, retry, refetch 정책
- mutation 성공 후 캐시 갱신과 invalidation
- 낙관적 업데이트와 롤백
- loading, error, empty state

### 현재 데이터 흐름

1. `useRoundEntries(year, courseName)`이 연도별 query key를 만든다.
2. `listRoundEntries`가 Supabase에서 해당 연도 데이터를 조회한다.
3. 생성·수정·삭제 mutation이 Supabase 요청을 실행한다.
4. 성공하면 `setQueryData`로 현재 캐시를 갱신한다.
5. 캘린더는 갱신된 목록을 기준으로 일·월 수입을 다시 계산한다.

관련 코드:

- `src/features/rounds/round-entry-api.ts`
- `src/features/rounds/use-round-entries.ts`
- `src/app/providers.tsx`

다음 단계에서는 네트워크 실패 시 입력값 유지, 재시도 UI, 낙관적 업데이트 실패 롤백을 추가하며 학습하는 것이 좋다.

## 8. Supabase 인증

### 카카오 로그인 흐름

```text
로그인 버튼
  → Supabase Auth
  → Kakao 동의 화면
  → Supabase callback
  → /auth/callback?code=...
  → code를 세션 쿠키로 교환
  → 온보딩 또는 캘린더
```

### 공부할 내용

- OAuth 2.0 Authorization Code 흐름
- provider callback URL과 앱 callback URL의 차이
- access token과 refresh token
- HTTP-only cookie와 세션 갱신
- CSRF와 open redirect 방어
- publishable key와 service role key의 차이

### 프로젝트의 보안 규칙

- 브라우저에는 publishable key만 사용한다.
- `SUPABASE_SERVICE_ROLE_KEY`는 브라우저 코드와 `NEXT_PUBLIC_*` 환경 변수에 절대 넣지 않는다.
- callback의 `next` 값은 내부 안전 경로만 허용한다.
- 만료되거나 사라진 refresh token 쿠키는 middleware에서 제거한다.

관련 코드:

- `src/shared/api/supabase/client.ts`
- `src/shared/api/supabase/server.ts`
- `src/shared/api/supabase/proxy.ts`
- `src/features/auth/redirect.ts`

## 9. PostgreSQL, Migration, RLS

### 공부할 내용

- 테이블, 행, 열, 기본키, 외래키, 인덱스
- enum과 check constraint
- transaction과 데이터 무결성
- migration의 목적과 순방향 변경 방식
- PostgreSQL function과 trigger
- Supabase `auth.uid()`
- Row Level Security와 policy
- 최소 권한 원칙

### 현재 데이터 모델

`profiles`:

- 사용자별 골프장, 기본 캐디피, 오버피 프리셋, 테마 설정
- `auth.users`와 1:1 관계

`round_entries`:

- 한 행이 한 번의 라운드
- 하루 여러 라운드를 별도 행으로 저장
- 캐디피, 오버피, 결제 수단, 메모 저장
- 당시 골프장명을 snapshot으로 보존

RLS policy는 `auth.uid() = user_id` 조건으로 자신의 행만 CRUD할 수 있게 한다. 프론트엔드에서 `.eq("user_id", ...)`를 빠뜨려도 DB가 최종 보안 경계가 되어야 한다.

관련 파일:

- `supabase/migrations/20260619050315_create_initial_schema.sql`
- `supabase/tests/database/initial_schema.test.sql`
- `supabase/seed.sql`

로컬 DB 학습 명령:

```bash
pnpm db:start
pnpm db:reset
pnpm db:test
```

Docker가 필요하다. 이미 원격에 적용한 migration 파일을 수정하기보다 새 migration을 추가하는 방식을 사용한다.

## 10. 테스트와 품질 관리

### 테스트 계층

| 계층        | 도구                    | 검증 대상                             |
| ----------- | ----------------------- | ------------------------------------- |
| 단위 테스트 | Vitest                  | 날짜 계산, redirect 검증, 데이터 변환 |
| UI 테스트   | Testing Library + jsdom | 사용자 관점의 컴포넌트 동작           |
| DB 테스트   | Supabase CLI + pgTAP    | constraint, RLS, migration            |
| 정적 검사   | ESLint + TypeScript     | 코드 규칙과 타입 오류                 |
| 포맷 검사   | Prettier                | 일관된 코드 형식                      |
| 빌드 검사   | Next.js + OpenNext      | 일반 빌드 및 Workers 호환성           |

PR 전 실행 순서:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build:cloudflare
```

기능을 추가할 때 정상 경로뿐 아니라 잘못된 입력, 권한 없는 접근, 네트워크 실패, 빈 데이터도 테스트한다.

## 11. Git과 GitHub 협업

### 기본 작업 흐름

```bash
git switch main
git pull --ff-only
git switch -c codex/feat-작업명

# 작업 및 검증

git add <변경 파일>
git commit -m "feat: 작업 설명"
git push -u origin codex/feat-작업명
gh pr create --base main
```

### 공부할 내용

- working tree, staging area, commit
- branch와 merge
- rebase와 merge commit의 차이
- PR review와 required check
- squash merge를 사용하는 이유
- merge 후 로컬·원격 브랜치 정리

현재 CI는 PR과 `main` push에서 포맷, lint, 타입, 테스트, 두 종류의 빌드를 검사한다. Supabase 파일이 바뀌면 별도 Database workflow가 실행된다.

## 12. Cloudflare Workers 배포

### 구성 요소

- **OpenNext**: Next.js 결과물을 Cloudflare Workers 형식으로 변환
- **Wrangler**: Cloudflare 로컬 실행, 타입 생성, 업로드, 배포 CLI
- **Workers**: 서버 렌더링과 Route Handler 실행
- **Workers Assets**: Next.js 정적 파일 제공

관련 파일:

- `open-next.config.ts`
- `wrangler.jsonc`
- `public/_headers`
- `.github/workflows/deploy-cloudflare.yml`
- `next.config.ts`

### 배포 과정

```text
pnpm deploy
  → Next.js production build
  → OpenNext Worker bundle 생성
  → Wrangler가 Worker와 정적 자산 업로드
  → Cloudflare Workers URL에서 서비스
```

주요 명령:

```bash
pnpm build:cloudflare
pnpm preview
pnpm deploy
pnpm cf-typegen
```

### 환경 변수와 GitHub Secrets

GitHub의 `production` Environment에 다음 secret이 필요하다.

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

로컬 `.env`, `.dev.vars`와 실제 secret 값은 Git에 커밋하지 않는다. 예제 파일에는 변수 이름과 안전한 예시만 둔다.

현재 배포 workflow는 `workflow_dispatch` 방식이다. 즉, PR을 merge한 뒤 GitHub Actions 화면에서 사람이 운영 배포를 실행한다. 초기 서비스에서는 의도치 않은 자동 배포를 막고 비용과 오류를 확인하기 좋은 방식이다.

### 운영 URL 등록

배포 도메인이 바뀌면 다음 설정을 함께 갱신해야 한다.

1. Supabase Auth Site URL
2. Supabase Auth Redirect URLs의 `/auth/callback`
3. 필요할 경우 Kakao 개발자 콘솔의 허용 도메인

운영 장애를 볼 때는 브라우저 오류만 확인하지 말고 GitHub Actions 로그, Cloudflare Worker 로그, Supabase Auth·Database 로그를 함께 확인한다.

## 13. React Native 확장을 위해 미리 공부할 것

웹 MVP 이후 React Native 앱으로 확장할 때 우선순위는 다음과 같다.

1. React의 상태와 컴포넌트 설계를 충분히 이해한다.
2. 데이터 타입과 계산 로직을 UI에서 분리한다.
3. Supabase API와 TanStack Query query key 규칙을 유지한다.
4. React Native navigation과 secure storage를 학습한다.
5. Kakao 네이티브 로그인과 deep link callback을 별도로 설계한다.

공유하기 쉬운 부분:

- TypeScript 도메인 타입
- 금액과 날짜 계산 함수
- 입력 검증 규칙
- Supabase 테이블 구조
- Query key와 일부 API 함수

그대로 공유하기 어려운 부분:

- Next.js 라우팅과 Server Action
- vanilla-extract로 만든 웹 CSS
- 브라우저 cookie 기반 인증 처리
- DOM 전용 컴포넌트

React Native를 고려한다는 이유로 지금부터 무리하게 모노레포를 만들 필요는 없다. 공유할 코드가 실제로 늘어난 시점에 패키지 경계를 만드는 편이 안전하다.

## 14. 권장 학습 순서

### 1단계: 프론트엔드 기초

1. TypeScript 기본 타입과 함수
2. React 컴포넌트, state, event, form
3. Next.js App Router와 client/server 경계
4. vanilla-extract와 반응형 CSS

완료 기준: 기존 로그인·온보딩·캘린더 화면을 읽고 작은 UI 변경을 독립적으로 구현할 수 있다.

### 2단계: 데이터와 인증

1. HTTP 요청과 JSON
2. TanStack Query 조회·mutation·캐시
3. SQL과 PostgreSQL 기본
4. Supabase Auth와 OAuth
5. RLS와 DB 테스트

완료 기준: 새 테이블 migration, RLS policy, CRUD hook, 실패 UI를 한 흐름으로 구현할 수 있다.

### 3단계: 품질과 협업

1. Vitest와 Testing Library
2. Git branch, commit, PR, review
3. GitHub Actions YAML
4. 환경 변수와 secret 관리

완료 기준: 기능 PR을 만들고 CI 실패 원인을 로그로 찾아 수정할 수 있다.

### 4단계: 배포와 운영

1. Next.js production build
2. Edge runtime과 Node.js runtime 차이
3. OpenNext와 Wrangler
4. Cloudflare Workers 로그와 제한
5. Supabase·Cloudflare 장애 진단

완료 기준: preview에서 검증하고 운영 배포한 뒤 인증 callback과 DB 접근을 점검할 수 있다.

## 15. 다음 기능으로 해볼 실습

학습과 제품 개발을 함께 진행하려면 다음 순서가 적합하다.

1. 라운드 저장 실패 메시지와 재시도 UI 추가
2. 월별 수입 집계 테스트 보강
3. 연간 월별 수입 추이 화면 구현
4. 설정에서 기본 캐디피와 오버피 프리셋 수정
5. CSV 내보내기 구현
6. 계정 및 전체 데이터 삭제 구현
7. Playwright 기반 핵심 사용자 흐름 E2E 테스트 추가

각 작업은 UI만 만들지 말고 타입, API, DB 권한, 오류 상태, 테스트, 배포 영향까지 한 묶음으로 검토한다.

## 16. 체크리스트

새 기능을 시작할 때:

- 이 데이터의 원본이 브라우저인지 서버인지 구분했는가?
- 사용자별 RLS가 필요한가?
- Server Component와 Client Component 경계를 설명할 수 있는가?
- 로딩·실패·빈 상태가 정의되어 있는가?
- 환경 변수나 secret을 코드에 넣지 않았는가?
- 단위 테스트와 DB 테스트 중 무엇이 필요한가?
- Cloudflare Workers runtime에서 동작하는 API인가?
- 모바일 480px 이하와 데스크톱에서 레이아웃을 확인했는가?

배포 전에:

- `pnpm format:check`, `lint`, `typecheck`, `test`가 통과하는가?
- Next.js와 OpenNext 빌드가 모두 통과하는가?
- migration과 RLS 테스트가 통과하는가?
- Supabase callback URL이 운영 도메인과 일치하는가?
- GitHub Actions와 Cloudflare 로그에서 오류가 없는가?
- 실제 카카오 로그인과 라운드 CRUD를 운영 환경에서 확인했는가?
