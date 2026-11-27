# 세션 로그: 데이터 모델(ERD·엔티티) 작성과 ORM 선택

> 날짜: 2026-11-27 · 단계: Phase 2

## 목표
SRS·glossary·architecture를 기준으로 `docs/02-design/data-model.md`의 ERD(Mermaid)와 엔티티 정의를 작성하고, 컬럼마다 관련 요구사항 ID를 적는다. NestJS용 ORM 2~3개를 비교하고, 사용자가 고른 것을 ADR-0003으로 남긴다.

## 한 일
- CLAUDE.md, PROGRESS.md, SRS, glossary, architecture, ADR-0004·0005를 읽었다.
- `data-model.md`를 작성했다(상태: 검토중).
  - ERD: `users`, `sessions`, `golf_clubs`, `rounds`. 지출·수입 항목 테이블은 범위 밖이라 뺐다.
  - 테이블마다 컬럼·타입·NULL·기본값·제약·관련 요구사항 ID 표를 만들었다.
  - **FR-007**: `rounds.caddy_fee`·`nine_ext_fee`에 금액을 복사 저장한다. 골프장 기본값과는 독립이다.
  - **Q-017**: `UNIQUE (user_id, played_on, slot)`. 이 인덱스를 월 범위 조회에도 쓴다.
  - **Q-018**: `golf_clubs.hidden_at`을 두고, 복합 FK에 `ON DELETE RESTRICT`를 걸어 라운드가 있는 골프장은 DB에서도 물리 삭제할 수 없게 했다. 동시 요청 때 FK 위반이 나면 숨기기로 다시 처리한다.
  - **FR-008**: `nine_ext_count` 0~2, `CHECK (slot = 1 OR nine_ext_count = 0)`, 횟수와 금액의 일관성 CHECK.
  - **NFR-005**: 모든 금액을 `integer`로 두고 범위 CHECK를 걸었다. 집계는 "반 라운드" 정수 단위로 해서 부동소수를 쓰지 않는다. `SUM`이 bigint 문자열로 돌아오는 점도 적었다.
  - **NFR-003**: 모든 사용자 데이터 테이블에 `user_id NOT NULL`, 인덱스는 `user_id`로 시작, 복합 FK(ADR-0005). `sessions`만 토큰 해시로 조회하는 예외다.
  - 기본 골프장은 `users.default_golf_club_id` 대신 `golf_clubs.is_default` + 부분 유니크 인덱스로 두었다. 이렇게 하면 순환 FK가 없고, "숨긴 골프장은 기본일 수 없음"(AC-004-5)을 CHECK로 막을 수 있다.
  - 나인추가 금액을 "직접 고쳤는지" 여부는 저장하지 않는다. 기본 계산값과 다르면 직접 고친 것으로 보고 화면에서 처리한다(AC-008-5).
  - §4 목표 DDL, §5 집계 쿼리, §6 요구사항 추적표, §7 제약 테스트 목록을 썼다.
- 도메인 질문 Q-026(숨긴 골프장과 같은 이름의 골프장 추가)을 등록하고 사용자에게 물었다 → **허용**. 이름 유니크 인덱스는 `WHERE hidden_at IS NULL`인 부분 유니크로 정했다.
- ORM 비교: Prisma v7, TypeORM v1.x, Drizzle. 기준은 학습 곡선, 국내 채용 수요(정성 평가), Neon 호환성, 마이그레이션 관리에 더해 복합 FK·CHECK·부분 인덱스 표현, lazy 연결이다. 최신 상태는 웹에서 확인했다: Prisma 부분 인덱스는 v7.4 preview이고 CHECK는 스키마에 없다. TypeORM은 2026-05에 1.0이 나왔다. Drizzle v1은 아직 RC다.
- 사용자가 **Drizzle**을 골랐고, ADR-0003으로 승인했다.

## 변경된 문서/파일
- `docs/02-design/data-model.md` — 전체 작성, 상태 "검토중"
- `docs/03-decisions/ADR-0003-orm.md` — 신규 (승인)
- `docs/01-requirements/open-questions.md` — Q-026 추가 후 해결
- `docs/02-design/architecture.md` — ORM 표, 마이그레이션 디렉터리(`apps/api/drizzle/`), §10, 변경 이력
- `docs/03-decisions/ADR-0002-tech-stack.md` — ADR-0003 링크
- `CLAUDE.md` — §7 ORM 줄
- `docs/PROGRESS.md` — 완료·핵심 사항·다음 할 일 갱신

## 결정 사항
- ADR-0003: **Drizzle** (`node-postgres`, 정확한 버전 고정, 스키마 한 파일에 모든 제약, `drizzle-kit generate`로 만든 SQL을 PR에서 리뷰한 뒤 Actions에서 적용)
- 설계 선택(data-model에 기록): `integer` identity PK, 기본 골프장은 `is_default` 부분 유니크, 라운드는 물리 삭제, 골프장 이름은 복사하지 않음(이름을 바꾸면 지난 라운드에도 새 이름이 보임)

## 새로 생긴 질문
- Q-026 → 같은 세션에서 해결 (허용)

## 다음 세션에 넘길 것
- `api-spec.md`: DB 제약 위반을 HTTP로 매핑한다(유니크 → 409, CHECK·RESTRICT → 422 또는 Service에서 먼저 처리).
- 확인해 둘 것: SRS 공통 입력 규칙에는 골프장 기본 캐디피 범위와 이름 길이 상한이 없다. data-model에서는 기본 캐디피를 캐디피와 같은 1~1,000,000원, 이름을 1~50자로 두었다. 확정 SRS를 바꿀 내용은 아니고 설계상 가정이지만, 사용자 검토 때 함께 보면 좋다.
