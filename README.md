# 캐디하루

캐디 개인이 라운드별 캐디피와 오버피를 기록하고 월간·연간 수입을 확인하는 모바일 우선 웹앱입니다.

## 기술 스택

- Next.js 16, React 19, TypeScript
- vanilla-extract
- TanStack Query
- pnpm
- Vitest

백엔드는 Supabase Auth, PostgreSQL, RLS를 사용하며 웹 배포는 Cloudflare Workers를 우선 검토합니다.

## 시작하기

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

`.env.local`의 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`에는 Supabase Dashboard의
Project Settings > API에서 확인한 Publishable key를 입력합니다. 카카오 로그인 콜백은
로컬 환경에서 `http://localhost:3000/auth/callback`을 사용합니다.

로컬 주소는 [http://localhost:3000](http://localhost:3000)입니다.

## 검증

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build:cloudflare
```

## Cloudflare Workers

OpenNext 어댑터를 사용해 Cloudflare Workers에 배포합니다.

```bash
cp .dev.vars.example .dev.vars
pnpm preview
```

운영 배포 전 Cloudflare Worker의 런타임 변수와 GitHub `production`
Environment secrets에 다음 값을 등록합니다.

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

최초 배포는 GitHub Actions의 `Deploy Cloudflare` 워크플로를 수동 실행합니다.
배포 후 발급된 운영 URL을 Supabase Auth의 Site URL과 Redirect URLs에
등록해야 카카오 로그인이 정상 동작합니다.

데이터베이스 검증에는 Docker가 필요합니다.

```bash
pnpm db:start
pnpm db:reset
pnpm db:test
```

제품 요구사항은 [docs/PRD.md](docs/PRD.md)를 참고하세요.
