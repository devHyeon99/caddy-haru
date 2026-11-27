# ADR-0003: ORM 선택

> 상태: 승인 · 날짜: 2026-11-27

## 배경 (Context)
NestJS(ADR-0002) + Neon PostgreSQL에서 쓸 ORM(쿼리 빌더 포함)을 정한다. `data-model.md`의 목표 스키마를 그대로 표현·관리할 수 있어야 한다.

**반드시 지켜야 하는 것**
- **ADR-0005 / NFR-003**: 복합 FK `rounds (golf_club_id, user_id) → golf_clubs (id, user_id)`, Repository 첫 인자 `userId`, `WHERE id AND user_id` 갱신·삭제 후 영향받은 행 수 확인
- **NFR-005 / FR-008**: 금액·나인추가 `CHECK` 제약 6개 이상, 정수 집계(`SUM` → bigint)
- **AC-004-3**: 부분 유니크 인덱스 `UNIQUE (user_id) WHERE is_default`
- **architecture §5.2**: 서버 시작 시 DB에 연결하지 않음(lazy 연결), 시작 시 마이그레이션 금지
- **architecture §8**: 런타임은 Neon **pooled**(PgBouncer transaction 모드), 마이그레이션은 GitHub Actions에서 **direct** 연결
- 사용자 조건: 백엔드가 처음, 1개월 일정, 학습/포트폴리오·국내 취업도 고려

## 선택지 (Options)

### 비교표 (2026-11-27 기준)

| 기준 | Prisma (v7) | TypeORM (v1.x) | Drizzle (v1 RC / 0.x) |
|---|---|---|---|
| **방식** | 전용 스키마 언어(`schema.prisma`) → 타입 생성 클라이언트 | 데코레이터 엔티티 클래스 (JPA·Hibernate와 비슷) | TS로 테이블 정의, SQL에 가까운 쿼리 빌더 |
| **학습 곡선** | **가장 쉬움.** 문서·예제 많음. 단, SQL을 덜 배우게 됨 | 중간. 개념이 많고(Entity·Repository·QueryBuilder·relations) 함정도 많음. 대신 Spring JPA로 넘어갈 때 개념이 이어짐 | 중간. **SQL을 알아야 함** → 백엔드 초보에겐 부담이자 가장 큰 학습 효과 |
| **국내 채용 수요** (정성 평가, 정확한 수치 아님) | NestJS 공고에서 TypeORM 다음으로 자주 보임, 증가 추세 | **NestJS 공고에서 가장 흔함** (NestJS 공식 문서 기본 예제) | 아직 드묾. 스타트업 일부 |
| **Neon 호환성** | 좋음. pooled/direct URL 분리 공식 지원, v7부터 Rust 엔진 없이 드라이버 어댑터(`pg`/Neon) 사용 → 콜드 스타트 부담 감소. 첫 쿼리 때 연결(lazy) | 동작은 함(`pg` 드라이버). **`TypeOrmModule`이 앱 시작 시 DB에 연결** → lazy 연결 규칙을 지키려면 직접 DataSource provider를 만들어 첫 쿼리 때 `initialize()` 해야 함 | 좋음. Neon 공식 가이드·드라이버 지원. `pg.Pool`은 원래 lazy → 규칙과 바로 맞음 |
| **마이그레이션 관리** | `prisma migrate dev`가 SQL 파일 생성·이력 관리, 안정적. `migrate deploy`를 CI에서 실행 | `migration:generate`로 엔티티 diff → TS 파일. diff가 가끔 불필요한 변경을 만들어 검토 필요 | `drizzle-kit generate`가 **읽기 쉬운 SQL 파일** 생성, `migrate`로 적용. 검토가 쉬움 |
| **복합 FK** (ADR-0005) | ✅ `@relation(fields: [golfClubId, userId], references: [id, userId])` + `@@unique([id, userId])` | ✅ `@JoinColumn([{ name, referencedColumnName }, …])` | ✅ `foreignKey({ columns, foreignColumns })` |
| **CHECK 제약** | ❌ 스키마에 없음 → 생성된 마이그레이션 SQL에 **직접 추가**(`--create-only`). Prisma는 이 제약을 모르므로 §7 "스키마 일치" 테스트로 보호 | ✅ `@Check()` 데코레이터 | ✅ `check()` |
| **부분 유니크 인덱스** | △ v7.4부터 `partialIndexes` **preview** 기능(`@@unique(..., where: ...)`). 안 쓰면 SQL 직접 추가 | ✅ `@Index({ unique: true, where: … })` | ✅ `uniqueIndex().on(…).where(sql\`…\`)` |
| **`WHERE id AND user_id` 갱신** | `updateMany({ where: { id, userId } })` → `count`로 0행 판단 (`update`는 유니크 키만 받아 부적합) | QueryBuilder `.update().where(...)` → `affected` | `.update().where(and(eq(id), eq(userId))).returning()` |
| **타입 안정성** | 매우 높음 | 중간 (관계·QueryBuilder 결과가 느슨) | 매우 높음 |
| **성숙도·위험** | 성숙. 메이저 버전 변화가 잦음(v6→v7 설정 방식 변경) | 2026-05 v1.0 출시, 유지보수 다시 활발. 오래된 블로그 예제(0.2)가 많아 혼동 | **v1이 아직 RC**. 0.x → 1.0 사이 API 변경 있음 |

### 요약
| 선택지 | 장점 | 단점 |
|---|---|---|
| **A. Prisma** | 가장 빨리 익히고 1개월 일정에 안전. 마이그레이션이 깔끔. 채용 수요 상위 | CHECK·(부분 인덱스)는 SQL을 손으로 붙여야 함 — 이 프로젝트 핵심 규칙(FR-008, NFR-005)이 스키마 파일 밖에 생김. SQL 학습은 적음 |
| **B. TypeORM** | 국내 NestJS 공고에서 가장 흔함. 모든 제약을 데코레이터로 표현. JPA와 개념이 비슷해 Spring 재구현(ADR-0002)에 유리 | lazy 연결을 직접 구현해야 함. 타입 안정성 약함. 마이그레이션 diff 검토 필요. 함정이 많아 초보가 막히기 쉬움 |
| **C. Drizzle** | 목표 DDL(`data-model.md` §4)을 **그대로 TS로 옮길 수 있음**. SQL 실력이 쌓임. lazy 연결·Neon과 자연스럽게 맞음 | 채용 수요 낮음. v1 RC라 버전 고정·문서 버전 확인 필요. SQL을 모르면 초반 속도 느림 |

## 결정 (Decision)
**C. Drizzle을 채택한다.** (사용자 선택, 2026-11-27)

| 항목 | 방침 |
|---|---|
| 버전 | 구현 시작 시점의 최신 안정판(`latest` 태그)을 **정확한 버전으로 고정**(`^` 없이). v1 정식이 나와 있으면 v1, 아니면 0.x 안정판. 문서는 같은 버전의 것을 본다 |
| 스키마 | `apps/api/src/database/schema.ts` 한 파일에 `data-model.md` §4의 테이블·CHECK·부분 유니크·복합 FK를 **모두** 정의. 제약 이름도 §4와 같게 지정 |
| 드라이버 | `drizzle-orm/node-postgres` + `pg.Pool` (Render는 일반 Node 서버라 TCP 연결 사용). `DATABASE_URL` = Neon pooled |
| lazy 연결 | `DatabaseModule`은 `Pool` 객체만 만들고 연결하지 않는다. 첫 쿼리 때 연결된다 (architecture §5.2) |
| 마이그레이션 | `drizzle-kit generate`로 SQL 파일 생성 → **PR에서 SQL을 리뷰** → GitHub Actions가 `DIRECT_DATABASE_URL`로 적용(architecture §8.2). 앱 시작 시 실행 금지. `drizzle-kit push`는 로컬 실험용으로만 |
| 위치 | 마이그레이션 파일: `apps/api/drizzle/` (architecture §7의 `migrations/` 자리) |
| Repository | ADR-0005 시그니처 그대로. 갱신·삭제는 `.where(and(eq(t.id, id), eq(t.userId, userId))).returning()` → 빈 배열이면 404 |
| 집계 | 통계는 Drizzle `sql` 템플릿으로 작성하되 `user_id` 조건을 반드시 넣는다. `SUM` 결과(bigint 문자열)는 `Number()` + `isSafeInteger` 확인 (data-model §5) |
| 트랜잭션 | `db.transaction(async (tx) => …)` — 기본 골프장 변경, 골프장 숨기기/삭제 |

## 근거 / 결과 (Consequences)
**좋은 점**
- 이 프로젝트의 핵심 규칙(FR-008 나인추가 CHECK, NFR-005 금액 범위, AC-004-3·Q-026 부분 유니크, ADR-0005 복합 FK)이 **스키마 파일 하나에 코드로** 있다. Prisma처럼 손으로 붙인 SQL이 스키마 밖에 흩어지지 않는다.
- 생성되는 마이그레이션이 평범한 SQL이라 리뷰하기 쉽고, `data-model.md` §4와 줄 단위로 비교할 수 있다.
- `pg.Pool`이 원래 lazy라 "시작 시 DB 연결 금지" 규칙을 따로 구현할 필요가 없다.
- SQL을 직접 다루므로 SQL 실력이 쌓인다. 이는 Spring(JPA/JdbcTemplate) 재구현(ADR-0002) 때도 그대로 쓸 수 있다.
- 타입 안정성이 높아 컬럼 이름·타입 실수를 컴파일 단계에서 잡는다.

**감수할 점**
- 국내 채용 공고에서 TypeORM·Prisma보다 덜 보인다 → 포트폴리오 README에 "왜 Drizzle을 골랐나"(이 ADR 요약)를 적어 판단 근거를 보여준다.
- v1이 RC 단계라 API 변경 가능성이 있다 → 버전을 정확히 고정하고, 올릴 때는 별도 PR로 한다.
- SQL을 모르면 초반이 느릴 수 있다 → 1주차에 `data-model.md` §4·§5 SQL을 직접 실행해 보며 익힌다.
- Drizzle Kit이 CHECK·부분 인덱스 변경을 정확히 diff하는지 매번 생성된 SQL을 확인한다 → `data-model.md` §7 "스키마 일치" 테스트로 보완.

**다시 검토할 조건**
- Drizzle Kit이 이 스키마의 마이그레이션을 반복해서 잘못 생성하거나, v1 전환 비용이 1주 이상 들 때 → Prisma(제약은 SQL 마이그레이션) 재검토.

## 참고 (확인한 자료, 2026-11-27)
- Prisma 부분 인덱스(v7.4 preview): https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/indexes
- Prisma CHECK 제약은 SQL 마이그레이션으로: https://www.prisma.io/docs/orm/more/troubleshooting/check-constraints
- TypeORM 1.0 출시(2026-05): https://typeorm.io/blog/typeorm-1-0
- Drizzle 릴리스(v1 RC): https://orm.drizzle.team/docs/latest-releases
- 국내 채용 수요는 정성 평가다. 구현 전 원티드·점핏 등에서 "NestJS + ORM명"으로 직접 확인하길 권장

## 변경 이력
- 2026-11-27 제안 작성 (선택지 비교)
- 2026-11-27 승인 (사용자 선택: Drizzle)
