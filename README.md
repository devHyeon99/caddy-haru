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
```

데이터베이스 검증에는 Docker가 필요합니다.

```bash
pnpm db:start
pnpm db:reset
pnpm db:test
```

제품 요구사항은 [docs/PRD.md](docs/PRD.md)를 참고하세요.
