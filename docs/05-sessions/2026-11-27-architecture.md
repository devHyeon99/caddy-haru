# 세션 로그: 시스템 아키텍처 상세 설계

> 날짜: 2026-11-27 · 단계: Phase 2

## 목표
ADR-0002를 기준으로 `docs/02-design/architecture.md`를 완성한다. 대상은 NestJS 모듈·레이어, NFR-003 강제·테스트, 카카오 OAuth·쿠키 시퀀스, 프록시·서버 깨우기, NFR 대응 표, 백업, 디렉터리 구조다. 트레이드오프가 있는 선택은 사용자에게 묻고 ADR로 남긴다.

## 한 일
- CLAUDE.md와 PROGRESS.md를 읽고 현재 상태(Phase 2, M1 2026-12-05 목표)를 요약했다.
- 공식 문서로 확인했다(2026-11-27).
  - Neon 무료 플랜의 즉시 복원 기간은 **6시간**(1GB 상한)이다. 예전 문서의 24시간은 지금 기준이 아니다.
  - 공개 저장소의 GitHub Actions 아티팩트는 로그인한 누구나 받을 수 있다 → 암호화가 필수다.
- 트레이드오프 4건을 비교해 사용자에게 물었다. 세션 방식은 사용자가 차이를 물어서 쉬운 비유(번호표 vs 서명된 신분증)와 안정성·난이도·학습 가치 표로 다시 설명한 뒤 골랐다.
- `architecture.md`를 작성했다(상태: 검토중).
  - §3: 모듈 표, 레이어 책임, 예외 → HTTP 매핑, NFR-003 네 겹 장치와 AC-N003-1·2 테스트 방식(격리 E2E, `:id` 라우트 누락 감지, Repository·FK 테스트)
  - §4: 카카오 로그인 시퀀스(state 쿠키, 토큰 교환, 회원번호 upsert, 세션 발급), 이후 요청 인증·로그아웃 시퀀스, 쿠키 속성
  - §5: Pages Functions 프록시 코드 요점(`redirect: 'manual'`, 비밀 헤더), `/api/health`(세션 조회도 금지, lazy DB 연결), "서버 깨우는 중" 시퀀스와 사용 중 다시 잠들었을 때의 처리
  - §6: NFR-001~008 대응 표. NFR-005는 반 라운드 단위 정수 계산으로 부동소수 오차를 없앴다
  - §7~9: 디렉터리 구조, 환경 변수·배포 흐름(Actions에서 마이그레이션 → Render 배포 훅), 백업·복원 절차
- ADR-0004~0007을 작성하고, ADR-0002·CLAUDE.md §7에 링크와 요약을 추가했다.

## 변경된 문서/파일
- `docs/02-design/architecture.md` — 상세 설계 전체 작성, 상태 "검토중"
- `docs/03-decisions/ADR-0004-session-management.md` — 신규
- `docs/03-decisions/ADR-0005-data-isolation-enforcement.md` — 신규
- `docs/03-decisions/ADR-0006-backup-strategy.md` — 신규
- `docs/03-decisions/ADR-0007-monorepo-tooling.md` — 신규
- `docs/03-decisions/ADR-0002-tech-stack.md` — 백업 결정 링크, 변경 이력
- `CLAUDE.md` — §7에 세션·분리·백업·모노레포 요약, lazy DB 연결 규칙 추가
- `docs/PROGRESS.md` — 완료·핵심 사항·다음 할 일 갱신

## 결정 사항
- ADR-0004: **DB 세션**(불투명 토큰, SHA-256 해시 저장, `__Host-sid`, 30일 슬라이딩). JWT는 Spring 재구현 때 학습 과제로 남긴다
- ADR-0005: Repository 첫 인자 **명시적 `userId: UserId`**, `WHERE id AND user_id`, 남의 데이터는 404, 복합 FK
- ADR-0006: **Neon 즉시 복원(6시간) + 매일 age 암호화 `pg_dump`(90일)**, 개인키는 GitHub 밖에 보관, 분기마다 복원 연습
- ADR-0007: **pnpm workspaces**, Turborepo 없음, `packages/shared`
- 설계 규칙 추가(ADR 아님, architecture에 기록): 서버 시작 시 DB 연결·마이그레이션을 하지 않는다. 마이그레이션은 GitHub Actions에서 실행한다

## 새로 생긴 질문
- 없음 (도메인 질문 없음). 구현 전에 기술적으로 확인할 항목은 architecture §8.2와 PROGRESS 다음 할 일 7번에 적었다

## 다음 세션에 넘길 것
- `data-model.md` + ADR-0003(ORM). 복합 FK, 유니크 `(user_id, played_on, slot)`, `users`·`sessions` 테이블 포함
- `api-spec.md`, `ui-design.md` → 끝나면 architecture를 "확정"으로 바꾸고 M1 달성
- 사용자 할 일: age 키 쌍 생성과 개인키 보관
