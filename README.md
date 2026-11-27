# CaddyHaru · 캐디하루

캐디가 라운드별 캐디피·오버피·나인추가를 휴대폰으로 기록하고, 월·연 수입과 연간 총액(종합소득세 신고 참고용)을 확인하는 모바일 우선 웹앱.

- 상태: Phase 3 구현 중 — [진행 현황](docs/PROGRESS.md)
- 문서: [docs/README.md](docs/README.md) (요구사항 → 설계 → ADR → 세션 로그)
- 스택: React + Vite · NestJS · Neon(PostgreSQL) · Drizzle · Cloudflare Workers + Render 무료 ([ADR-0002](docs/03-decisions/ADR-0002-tech-stack.md))

## 로컬 실행

처음 한 번:

```bash
pnpm install
cp apps/api/.env.example apps/api/.env   # 카카오 키는 .env에만 (커밋 금지)
docker compose up -d db
(cd apps/api && set -a && . ./.env && set +a && pnpm db:migrate)
```

매번:

```bash
pnpm dev   # shared 빌드 → API(3000) + 웹(5173) 동시 실행, Ctrl+C로 둘 다 종료
```

http://localhost:5173 — `/api`는 Vite 프록시가 `X-Proxy-Secret`을 붙여 API로 보낸다 (architecture §5.1).
