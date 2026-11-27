# 진행 현황

> 세션 시작 시 가장 먼저 읽고, 세션 종료 시 반드시 갱신한다.
> 최종 수정일: 2026-11-27

## 현재 단계

**Phase 3 — 구현** · M1 설계 확정 2026-11-27 달성 (목표 12-05보다 빠름) · 다음 목표: M3 실사용 2026-12-26

## 최근 완료

- [x] 2026-11-26 문서 체계 뼈대 구축 (CLAUDE.md, docs/ 구조, 템플릿, 세션 가이드)
- [x] 2026-11-26 1·2차 인터뷰: Q-001~Q-016 해결
- [x] 2026-11-26 Must 요구사항 인수 조건 작성 (SRS §5), Q-017~Q-020 해결
- [x] 2026-11-26 **M0 달성: Must 요구사항 확정**, 헌장 확정 → Phase 2 진입
- [x] 2026-11-26 확정 후 변경: **나인추가(FR-008)** 추가, Q-021~Q-024 해결
- [x] 2026-11-27 **ADR-0002 기술 스택 결정:** React(Vite) + NestJS + Neon, Cloudflare Pages + Render 무료. NFR-002 콜드 스타트 예외 추가
- [x] 2026-11-27 Q-025 해결: AC-N001-3은 서버가 깨어난 뒤부터 30초로 측정 (확정 후 변경, 사용자 승인)
- [x] 2026-11-27 **`architecture.md` 상세 작성 (검토중):** NestJS 모듈·레이어, NFR-003 강제·AC-N003 테스트 방식, 카카오 OAuth·DB 세션 시퀀스, 프록시·서버 깨우기, NFR 대응 표, 디렉터리 구조, 배포, 백업
- [x] 2026-11-27 ADR-0004 DB 세션 · ADR-0005 명시적 userId + 복합 FK · ADR-0006 백업(Neon 6시간 + 매일 암호화 pg_dump) · ADR-0007 pnpm workspaces
- [x] 2026-11-27 **`data-model.md` 작성 (검토중):** ERD, `users`·`sessions`·`golf_clubs`·`rounds` 컬럼별 요구사항 ID, 목표 DDL(CHECK·부분 유니크·복합 FK `RESTRICT`), 정수 집계(반 라운드 단위), 제약 테스트 목록
- [x] 2026-11-27 **ADR-0003 ORM = Drizzle** (Prisma·TypeORM과 비교, 버전 고정, SQL 마이그레이션 리뷰). Q-026 해결: 숨긴 골프장과 같은 이름 추가 **허용**
- [x] 2026-11-27 **`api-spec.md` 작성 (검토중):** 엔드포인트 17개(health·인증 4·골프장 4·라운드 5·월/연 통계·CSV), 요청/응답 JSON·검증 규칙·상태 코드·AC, 400(형식)/409(유니크)/422(업무 규칙) 구분, **남의 리소스 ID = 404**(403은 Origin·프록시 비밀에만), 테스트 연결. **ADR-0008 에러 형식 승인**, **Q-027 해결: 날짜 허용 범위 2000~2099**

- [x] 2026-11-27 **`ui-design.md` 작성 (검토중):** 화면 13개(SCR-00 깨우기·00o 오버레이·06 로그인·01 홈·02/02e 라운드 추가·수정·03/03d 달력·날짜 시트·04 통계·05/05f 설정·골프장, DLG-01·02), 화면 흐름도 2개, 360px 와이어프레임, 서버 에러 → 화면 매핑, `/login?error=` 문구, **30초 흐름 = 3탭 + 5키(약 10초)**, 검증 방법. SRS §6 "설계 문서" 칸 채움 → **설계 문서 4종 초안 완료**

- [x] 2026-11-27 **M1 달성: 설계 4종 확정** (architecture·data-model·api-spec·ui-design, 사용자 승인) → **Phase 3 진입**
- [x] 2026-11-27 **모노레포 뼈대** (브랜치 `chore/monorepo-scaffold`): pnpm workspaces, `packages/shared`(도메인 상수·계산식·에러 타입, 단위 테스트 17개), `apps/api`(NestJS 12, `/api/health` + E2E), `apps/web`(Vite 8·React 19·Router·Query·vanilla-extract, Worker 프록시), CI, Dockerfile, PR 템플릿. 초기 JS **gzip 110KB**
- [x] 2026-11-27 **ADR-0010** 테스트·도구(Vitest 통일, TypeScript 6.0 고정, Node 24). **ADR-0009 개정**: vaul 유지보수 중단 → 시트도 Radix Dialog. `test-plan.md`에 설계 4종 테스트 표 통합(T-U·I·E·W·D)
- [x] 2026-11-27 **ADR-0002 개정: Cloudflare Pages → Workers 정적 자산** (대시보드에서 Pages가 "레거시"로 표시). Worker 1개가 SPA + `/api/*` 프록시(`run_worker_first`). 로컬 `wrangler dev`로 프록시·SPA 폴백 확인
- [x] 2026-11-27 **앱 이름 = 캐디하루** (영문 CaddyHaru, 식별자 `caddy-haru`, 헌장 §0). GitHub 공개 저장소 `devHyeon99/caddy-haru` 생성
- [x] 2026-11-27 **ADR-0009 프론트 라이브러리 결정:** React Router · TanStack Query(메모리 캐시만, 저장 재시도 없음, 포커스 시 재요청 끔) · vanilla-extract · Radix Dialog + vaul. 시트 열림 = 주소 `date`, 뒤로 가기 = 닫기

## 확정된 핵심 사항 (요약)

- 사용자: 지인 캐디 몇 명, **카카오 로그인**, 데이터 **완전 분리**(골프장 목록 포함), 여러 골프장
- 기기: 거의 휴대폰 (모바일 우선, 360px), 집에서 기록 → 오프라인 불필요
- 라운드: 날짜 · **1부/2부/3부** · 골프장 · 캐디피 · 오버피 (그 외 정보 없음, 항상 18홀)
- 규칙: 같은 날짜·부 중복 금지, 미래 날짜 허용, 삭제는 확인 창, 라운드 있는 골프장은 숨기기
- 캐디피: **골프장마다 기본값 저장**, 기본값을 바꿔도 지난 기록은 그대로
- 나인추가: **1부만**, **최대 2회**, 1회당 캐디피 절반 자동(원 단위 내림, 수정 가능, 고친 금액은 유지), 통계는 따로 합계 + 1회 = **0.5라운드**
- 제외: 지출, 세액 계산, 데이터 가져오기, 부가 정보, 데이터 공유
- 세금: 연간 총액 요약만 / 비용: 무료 티어만
- 스택: React + NestJS + Neon, Cloudflare Workers(정적 자산 + `/api` 프록시, ADR-0002 개정) + Render 무료 — 첫 요청 약 1분 지연 감수, 크론 상시 기동은 일단 안 씀 (ADR-0002)
- 인증: 카카오 회원번호로 가입(이메일·동의 항목 없음), **DB 세션** 30일 슬라이딩 (ADR-0004)
- 분리: Repository 첫 인자 `userId`, 남의 ID는 404(없는 ID와 응답이 똑같음, 본문의 `golfClubId`도 404), 복합 FK, `:id` 라우트 누락 감지 테스트 (ADR-0005, api-spec §3)
- API: `/api` 아래 REST, 금액은 JSON 정수, 환산 라운드 수는 `roundHalfUnits` 정수, 에러는 `{ error: { code, message, fields?, requestId } }` (api-spec, ADR-0008)
- 백업: Neon 즉시 복원 6시간 + GitHub Actions 매일 age 암호화 `pg_dump` 90일 (ADR-0006)
- 프론트: React Router · TanStack Query · vanilla-extract(토큰에 44px 등) · Radix Dialog(DLG·시트, vaul 제외) (ADR-0009)
- 도구: Vitest 전 패키지 + Supertest, Playwright, TypeScript 6.0, Node 24, 정확한 버전 고정 (ADR-0010)
- 모노레포: pnpm workspaces, `packages/shared`에 계산식·상수·API 타입 (ADR-0007)
- ORM: **Drizzle**, 스키마 = `data-model.md` §4 DDL, 마이그레이션은 생성 SQL을 PR에서 리뷰 후 Actions에서 적용 (ADR-0003)
- 데이터: 금액은 라운드에 복사 저장(FR-007), `UNIQUE (user_id, played_on, slot)`, 골프장 숨김은 `hidden_at` + 복합 FK `RESTRICT`, 기본 골프장은 `is_default` 부분 유니크
- UI: 하단 탭 4개(홈·달력·통계·설정), 홈에서 C1·D1 미리 불러와 폼 즉시 채움, 저장 버튼은 상단 바 + 폼 하단 두 곳, 달력 칸은 만 원 축약(정확한 금액은 시트), 깨우기 화면은 1.5초 뒤부터·3분 뒤 실패, 사용 중 오버레이는 깨어난 뒤 저장을 한 번만 전송 (ui-design)
- 일정: **1개월 안 실사용** (M3 2026-12-26)
- 목적: 실사용 + 학습/포트폴리오

## 다음 할 일 (우선순위 순)

1. [x] ~~`docs/phase2-architecture` → main 병합~~ (PR #1, 2026-11-27)
2. [ ] 모노레포 뼈대 PR(`chore/monorepo-scaffold`) 리뷰·병합 → CI 첫 실행 확인
3. [ ] 첫 배포 확인 (test-plan §6): Render(Docker, `apps/api/Dockerfile`) + Cloudflare Worker(`caddy-haru`, Workers Builds) → `/api/health`가 workers.dev 주소로 200. 이어서 카카오 Redirect URI 교체
4. [ ] Must 구현 (권장 순서: 인증(DB·세션) → 골프장 → 라운드 → 달력·통계)
5. [ ] (병행, Should) `use-cases.md`의 UC-00, UC-02 ~ UC-07 작성
6. [ ] 사용자 할 일 (구현 시작 전까지)
   - [x] 카카오 개발자 콘솔 앱 등록 (2026-11-27, **Redirect URI는 임시 주소**)
   - [x] Cloudflare·Render·Neon 계정 준비 (2026-11-27)
   - [ ] **age 키 쌍 생성** 후 개인키를 비밀번호 관리자 + 오프라인에 보관, 공개키(`age1…`)만 GitHub Secret `BACKUP_AGE_RECIPIENT`로 (ADR-0006)
   - [ ] Worker 첫 배포 뒤 카카오 Redirect URI를 `https://caddy-haru.<계정 서브도메인>.workers.dev/api/auth/kakao/callback`으로 바꾸기
7. [ ] 구현 1주차에 확인: Drizzle 최신 안정판 버전 고정, Render 무료 배포 훅·자동 배포 끄기, 카카오 동의 항목 없이 로그인, Worker 프록시 `redirect: 'manual'`·여러 `Set-Cookie` 전달 (architecture §8.2), 카카오 로그인 버튼 가이드·iOS 키패드 위 저장 버튼 (ui-design §8)

## 막힌 것 / 사용자 결정 필요

- 없음

## 설계 단계에서 정할 것

- ~~데이터 백업 방식 (AC-N004-2)~~ → ADR-0006 결정 완료
- ~~ORM (ADR-0003)~~ → Drizzle 결정 완료
- ~~무료 티어 한도 검증 (AC-N007-1)~~ → ADR-0002에 기록 완료. Workers 정적 자산 한도는 첫 배포 때 재확인

## 단계 전환 체크리스트

- Phase 0 → 1: 헌장의 목적·범위·성공 기준이 "확정" — ✅
- Phase 1 → 2: SRS의 Must 요구사항 전부 "확정", open-questions에 Must 관련 미해결 없음 — ✅
- Phase 2 → 3 (2026-11-27): ✅ **통과**
  - ✅ 설계 문서 4종 작성: architecture · data-model · api-spec · ui-design
  - ✅ 4종 상태 "확정" (2026-11-27 사용자 승인)
  - ✅ 기술 스택 ADR (ADR-0002, ORM ADR-0003, 인증·분리·백업·모노레포·에러 ADR-0004~0008)
  - ✅ Must 요구사항 전부 설계에 연결 (SRS §6 "설계 문서" 칸 11개 모두 채움)
  - ✅ open-questions 미해결 0개
  - ⬜ (구현 전 준비, 전환 조건은 아님) 사용자 계정·카카오 앱 등록·age 키 · ✅ 프론트 라이브러리 결정(ADR-0009)
- Phase 3 → 4: Must 요구사항 전부 구현 + 테스트 통과
