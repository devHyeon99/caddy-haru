# API 명세

> 상태: **확정** · 최종 수정일: 2026-11-28
> 선행 문서: SRS(Must 확정), `architecture.md`(검토중), `data-model.md`(검토중)
> 관련 결정: ADR-0004 DB 세션 · ADR-0005 데이터 분리(남의 ID = 404) · **ADR-0008 에러 응답 형식**
> 요청·응답 타입은 `packages/shared/src/api/`에 TypeScript로 한 번만 정의하고 web·api가 같이 쓴다(ADR-0007).

---

## 1. 공통 규칙

### 1.1 기본

| 항목 | 규칙 | 근거 |
|---|---|---|
| Base URL | `https://caddy-haru.eomhh99.workers.dev/api` (이하 예시의 `<도메인>`) — Worker 프록시가 Render로 전달(같은 도메인, CORS 없음) | architecture §5.1 |
| 형식 | 요청·응답 본문은 `application/json; charset=utf-8`. 예외: CSV 내보내기(`text/csv`), 리다이렉트(302), 본문 없는 응답(204) | — |
| 필드 이름 | `camelCase`. DB 컬럼 `nine_ext_count` → `nineExtCount` | data-model §2 |
| 금액 | **원 단위 JSON 정수**(`150000`). 문자열·소수·지수 표기 거부. 응답의 합계도 정수 | NFR-005, AC-N005-1 |
| 날짜 | `YYYY-MM-DD` 문자열(시간·시간대 없음, 실재하는 날짜만). 월은 `YYYY-MM`, 연도는 `YYYY`. 허용 범위 `2000-01-01` ~ `2099-12-31`(기술적 안전 범위, Q-027 승인). 범위 밖이면 400 `OUT_OF_RANGE` | FR-001, Q-019 |
| 시각 | `createdAt`·`updatedAt`은 ISO 8601 UTC(`2026-12-03T11:20:00.000Z`) | — |
| 부 | 정수 `1`·`2`·`3` | FR-005, Q-014 |
| 환산 라운드 수 | **반 라운드 정수** `roundHalfUnits`(라운드 1건 = 2, 나인추가 1회 = +1)로 준다. 화면은 `÷ 2`해서 `1.5`처럼 표시(`packages/shared`의 `formatRoundCount`) | Q-024, NFR-005, data-model §5 |
| 모르는 필드 | 요청 본문·쿼리에 정의되지 않은 필드가 있으면 400. **`userId`를 보내도 400** | NFR-003, architecture §3.3 ① |
| 목록 | 페이지 나누기 없음(한 달 최대 93건). 응답은 `{ "items": [...] }` | NFR-007 규모 |

### 1.2 인증

| 항목 | 규칙 | 근거 |
|---|---|---|
| 방식 | 쿠키 `__Host-sid`(httpOnly). SPA는 `fetch(..., { credentials: 'same-origin' })` — 같은 도메인이라 기본값으로 실린다 | ADR-0004 |
| 보호 범위 | 아래 표에서 "공개"가 아닌 모든 엔드포인트. 세션이 없거나 만료되면 **401 `UNAUTHENTICATED`** → SPA는 `/login`으로 이동 | FR-040, AC-040-4 |
| 세션 연장 | 남은 기간이 15일 미만이면 응답에 `Set-Cookie: __Host-sid=…; Max-Age=2592000` 추가(슬라이딩) | ADR-0004 |
| CSRF | `POST`·`PATCH`·`DELETE`는 `Origin` 헤더가 앱 도메인과 같아야 한다. 다르거나 없으면 **403 `FORBIDDEN_ORIGIN`** | architecture §4.1 |
| 프록시 비밀 | `X-Proxy-Secret`이 없거나 틀리면 **403 `FORBIDDEN_PROXY`** (`/api/health` 제외). Render 주소로 직접 들어오는 요청 차단 | architecture §5.1 |
| userId 출처 | **세션뿐.** 경로·쿼리·본문 어디에서도 사용자 ID를 받지 않는다 | NFR-003, ADR-0005 |

### 1.3 공통 응답 헤더

| 헤더 | 값 | 이유 |
|---|---|---|
| `Cache-Control` | **모든 API 응답**에 `no-store` (인증 응답·`/api/health`·에러 포함) | 로그아웃 후 뒤로 가기·공용 캐시에 데이터가 남지 않게 (AC-040-3) |
| `X-Request-Id` | 요청마다 무작위 ID. 에러 본문의 `requestId`와 같다 | 사용자가 오류 화면을 캡처해 보내면 Render 로그에서 찾기 |
| `Location` | `201` 응답에 새 리소스 경로 | REST 관례 |

---

## 2. 상태 코드와 에러 응답

### 2.1 상태 코드 사용 원칙

| 코드 | 언제 | 예 |
|---|---|---|
| **200** OK | 조회 성공, 수정 성공(수정된 리소스 반환), 골프장 삭제·숨기기 결과 반환 | `GET /api/rounds`, `PATCH /api/rounds/:id` |
| **201** Created | 생성 성공. 본문 = 생성된 리소스, `Location` 헤더 | `POST /api/rounds` |
| **204** No Content | 성공했지만 돌려줄 본문이 없음 | `DELETE /api/rounds/:id`, `POST /api/auth/logout` |
| **302** Found | OAuth 이동 | `GET /api/auth/kakao/login` |
| **400** Bad Request | **요청 자체가 형식에 맞지 않음** — JSON 문법, 필수 누락, 타입, 범위, 모르는 필드, 쿼리 형식 | 캐디피 0원, 나인추가 3회, `month=2026-13` |
| **401** Unauthorized | 세션 없음·만료 | 쿠키 없이 `GET /api/rounds` |
| **403** Forbidden | **요청 출처를 믿을 수 없음**(Origin 불일치, 프록시 비밀 불일치). **리소스 소유권에는 쓰지 않는다**(§3) | 다른 사이트에서 보낸 `POST` |
| **404** Not Found | 리소스가 없음 **또는 다른 사용자의 것**(둘을 구분하지 않음). 숨긴 골프장 수정·삭제도 404 | B가 A의 라운드 ID로 `GET` |
| **409** Conflict | **이미 있는 다른 데이터와 충돌** — DB 유니크 제약과 1:1로 대응 | 같은 날짜·같은 부, 같은 이름 골프장 |
| **422** Unprocessable Content | 형식은 맞지만 **업무 규칙 위반**(필드 여러 개의 조합이나 현재 상태에 따라 결정) | 2부에 나인추가, 숨긴 골프장으로 라운드 등록 |
| 500 | 예상하지 못한 서버 오류(메시지는 일반 문구만) | — |
| 502·503·504 | Render가 잠들어 있거나 깨어나는 중(프록시·Render가 반환, 본문 형식 보장 없음) | SPA는 "서버 깨우는 중" 흐름(architecture §5.3) |

**400 / 409 / 422 구분 기준** (architecture §3.2 예외 매핑과 같다)
- 400: 요청 하나만 보고 판단할 수 있고, 필드 하나의 형식·범위 문제. `ValidationPipe`(DTO)가 처리한다.
- 422: 요청은 형식상 올바르지만 필드 간 조합이나 저장된 상태와 맞지 않는다. Service가 `BusinessRuleError`로 던진다.
- 409: 다른 레코드와 겹친다. Service가 미리 확인하지 않고 **DB 유니크 위반을 잡아** 변환한다(경쟁 상태에서도 정확).

### 2.2 에러 응답 공통 형식 (ADR-0008)

모든 4xx·5xx(502~504 제외)는 같은 모양이다.

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "입력값을 확인해 주세요.",
    "fields": [
      { "field": "caddyFee", "code": "OUT_OF_RANGE", "message": "캐디피는 1원 이상 1,000,000원 이하로 입력해 주세요." },
      { "field": "playedOn", "code": "REQUIRED", "message": "날짜를 선택해 주세요." }
    ],
    "requestId": "01JDX3Q8V7K2M4N6P8R0S2T4V6"
  }
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `error.code` | string (대문자 스네이크) | ✅ | **기계가 읽는 값.** SPA는 이 값으로 분기한다(메시지 문자열로 분기 금지). §2.3 목록 밖의 값은 만들지 않는다 |
| `error.message` | string | ✅ | 사용자에게 그대로 보여줄 수 있는 **한국어** 문장. 500은 "잠시 후 다시 시도해 주세요." 고정(내부 정보 노출 금지) |
| `error.fields` | array | 원인이 특정 입력란일 때만(400·409·422) | 입력란 옆 오류 표시용(AC-001-2). `field`는 요청 본문·쿼리의 필드 이름 그대로 |
| `error.fields[].code` | string | ✅ | 400: `REQUIRED`, `INVALID_TYPE`, `INVALID_FORMAT`, `OUT_OF_RANGE`, `TOO_LONG`, `UNKNOWN_FIELD` 중 하나. 409·422: 최상위 `code`와 같은 값 |
| `error.requestId` | string | ✅ | `X-Request-Id`와 같은 값 |

```ts
// packages/shared/src/api/error.ts (ADR-0008)
export type FieldErrorCode =
  | 'REQUIRED' | 'INVALID_TYPE' | 'INVALID_FORMAT' | 'OUT_OF_RANGE' | 'TOO_LONG' | 'UNKNOWN_FIELD';
export interface ApiError {
  error: {
    code: ErrorCode; // §2.3
    message: string;
    fields?: { field: string; code: FieldErrorCode | ErrorCode; message: string }[];
    requestId: string;
  };
}
```

- 응답의 `Content-Type`은 `application/json`이다. 위 모양은 NestJS 전역 예외 필터 한 곳에서만 만든다(Controller·Service에서 직접 만들지 않음).
- 서버 로그에는 `requestId`, 경로, 상태, `code`, 사용자 ID만 남긴다. 요청 본문(금액)·쿠키는 남기지 않는다.

### 2.3 에러 코드 목록

| HTTP | `code` | 기본 메시지 | 발생 위치 | 관련 |
|---|---|---|---|---|
| 400 | `VALIDATION_FAILED` | 입력값을 확인해 주세요. (`fields`에 상세) | 모든 본문·쿼리 검증 | AC-001-2·3, AC-002-3, AC-008-10, AC-004-1 |
| 400 | `INVALID_JSON` | 요청 형식이 올바르지 않습니다. | 본문 JSON 파싱 실패 | — |
| 401 | `UNAUTHENTICATED` | 다시 로그인해 주세요. | `SessionGuard` | AC-040-3·4 |
| 403 | `FORBIDDEN_ORIGIN` | 허용되지 않은 요청입니다. | `OriginCheckMiddleware` | NFR-003, architecture §4.1 |
| 403 | `FORBIDDEN_PROXY` | 허용되지 않은 요청입니다. | `ProxySecretMiddleware` | architecture §5.1 |
| 404 | `ROUND_NOT_FOUND` | 라운드를 찾을 수 없습니다. | 라운드 `:id` | AC-N003-1 |
| 404 | `GOLF_CLUB_NOT_FOUND` | 골프장을 찾을 수 없습니다. | 골프장 `:id`, 라운드 본문의 `golfClubId` | AC-N003-1, AC-004-4 |
| 404 | `NOT_FOUND` | 요청한 주소를 찾을 수 없습니다. | 정의되지 않은 경로 | — |
| 409 | `DUPLICATE_ROUND` | 이미 {N}부 기록이 있습니다. | `rounds_user_date_slot_key` 위반 | **AC-005-3**, AC-003-2, Q-017 |
| 409 | `DUPLICATE_GOLF_CLUB_NAME` | 이미 같은 이름의 골프장이 있습니다. | `golf_clubs_user_visible_name_key` 위반 | **AC-004-2**, Q-026 |
| 422 | `NINE_EXT_SLOT1_ONLY` | 나인추가는 1부에만 기록할 수 있습니다. | 라운드 등록·수정 | **AC-008-7**, Q-022 |
| 422 | `NINE_EXT_FEE_WITHOUT_COUNT` | 나인추가 횟수가 0이면 나인추가 금액을 입력할 수 없습니다. | 라운드 등록·수정 | AC-008-8 |
| 422 | `GOLF_CLUB_HIDDEN` | 숨긴 골프장은 선택할 수 없습니다. | 라운드 등록·수정(골프장 변경 시) | AC-004-4, 공통 입력 규칙 |
| 422 | `DATE_RANGE_TOO_LONG` | 기간은 최대 1년까지 선택할 수 있습니다. | CSV 내보내기 | FR-031 |
| 500 | `INTERNAL_ERROR` | 잠시 후 다시 시도해 주세요. | 전역 예외 필터 | — |

> 프론트도 같은 규칙으로 먼저 검사해 즉시 안내한다(architecture §3.2 이중 검증). 서버 에러는 "프론트를 거치지 않은 요청"과 경쟁 상태에 대한 최종 방어다.

---

## 3. 다른 사용자의 리소스 ID 요청 — 403이 아니라 **404** (NFR-003)

**제안: 404.** ADR-0005·architecture §3.2에서 이미 정한 방향과 같고, 이 문서에서 응답 형태까지 확정한다.

| 비교 | 403 Forbidden | **404 Not Found (채택)** |
|---|---|---|
| 존재 여부 노출 | "그 ID는 있는데 네 것이 아니다"를 알려 준다. ID가 1, 2, 3… 순번이라 B가 ID를 차례로 넣어 보면 **전체 라운드·골프장 수, 다른 사용자의 기록 빈도**를 추측할 수 있다 | 없는 ID와 남의 ID가 **완전히 같은 응답** → 아무 정보도 새지 않는다 |
| 구현 | "있는지 조회 → 주인 비교 → 403" 두 단계 필요. architecture §3.3 ③에서 금지한 "조회 후 비교" 방식이라 조건 누락·경쟁 상태 위험 | `WHERE id = $id AND user_id = $userId` 한 번, 0행이면 404. Repository 시그니처(`userId` 첫 인자)와 그대로 맞는다 |
| 의미 | "권한이 없다" — 하지만 이 앱에는 공유·권한 단계가 없다(Q-016 완전 분리). 사용자 B에게 A의 데이터는 "있지만 금지된 것"이 아니라 **세계에 없는 것** | "B의 데이터 세계에는 그런 리소스가 없다" — 완전 분리의 의미와 일치 |
| 사용자 경험 | 정상 사용에서는 일어나지 않음(남의 ID를 화면에 보여주지 않으므로). 차이 없음 | 같음 |
| 디버깅 | 개발자가 원인을 바로 앎 | 서버 로그에는 `requestId`와 사용자 ID가 남으므로 필요하면 추적 가능 |
| 관례 | — | GitHub 등도 권한 없는 비공개 리소스를 404로 응답(RFC 9110 §15.5.5도 "존재를 숨기고 싶으면 404 가능"이라고 허용) |

**적용 규칙**
1. 경로의 `:id`가 남의 것 → `404 ROUND_NOT_FOUND` / `404 GOLF_CLUB_NOT_FOUND`. 조회·수정·삭제 모두 같다.
2. **요청 본문이 가리키는 ID**(라운드의 `golfClubId`)가 남의 것 → 역시 `404 GOLF_CLUB_NOT_FOUND`. 없는 ID와 똑같이 처리한다. (DB 복합 FK가 마지막에 막는다, ADR-0005)
3. 응답은 **바이트 단위로 구분할 수 없어야 한다**: 상태·`code`·`message`·`fields`가 같고, 차이는 `requestId`뿐. 응답 시간 차이도 없다(같은 쿼리 하나).
4. 403은 리소스 소유권이 아니라 **요청 출처** 문제(Origin·프록시 비밀)에만 쓴다.
5. 테스트(AC-N003-1): §11의 격리 테스트에서 "B → A의 ID" 응답과 "B → 존재하지 않는 ID(예: 999999)" 응답을 `requestId`만 빼고 **깊은 비교로 같음**을 확인한다.

---

## 4. 엔드포인트 목록

| # | Method | Path | 설명 | 인증 | 성공 | 관련 | 우선순위 |
|---|---|---|---|---|---|---|---|
| A1 | GET | `/api/health` | 서버 깨어 있음 확인(DB 접근 없음) | 공개 | 200 | NFR-002 | Must(운영) |
| B1 | GET | `/api/auth/kakao/login` | 카카오 로그인 시작 | 공개 | 302 | FR-040 | Must |
| B2 | GET | `/api/auth/kakao/callback` | 카카오 콜백 → 세션 발급 | 공개 | 302 | FR-040 | Must |
| B3 | POST | `/api/auth/logout` | 로그아웃 | 공개* | 204 | FR-040 | Must |
| B4 | GET | `/api/auth/me` | 내 정보(로그인 여부 확인) | 필요 | 200 | FR-040 | Must |
| C1 | GET | `/api/golf-clubs` | 내 골프장 목록(숨긴 것 제외) | 필요 | 200 | FR-004, FR-006 | Must |
| C2 | POST | `/api/golf-clubs` | 골프장 추가 | 필요 | 201 | FR-004, FR-006 | Must |
| C3 | PATCH | `/api/golf-clubs/:id` | 이름·기본 캐디피·기본 골프장 변경 | 필요 | 200 | FR-004, FR-006, FR-007 | Must |
| C4 | DELETE | `/api/golf-clubs/:id` | 삭제(라운드 있으면 숨기기) | 필요 | 200 | FR-004 | Must |
| D1 | GET | `/api/rounds` | 월·날짜별 라운드 목록 | 필요 | 200 | FR-010, FR-005 | Must |
| D2 | GET | `/api/rounds/:id` | 라운드 1건(수정 화면) | 필요 | 200 | FR-003 | Must |
| D3 | POST | `/api/rounds` | 라운드 등록 | 필요 | 201 | FR-001, 002, 005, 006, 008 | Must |
| D4 | PATCH | `/api/rounds/:id` | 라운드 수정 | 필요 | 200 | FR-003, 005, 008 | Must |
| D5 | DELETE | `/api/rounds/:id` | 라운드 삭제 | 필요 | 204 | FR-003 | Must |
| E1 | GET | `/api/stats/monthly` | 월 통계 + 달력 날짜별 합계 | 필요 | 200 | FR-010, FR-011 | Must |
| E2 | GET | `/api/stats/yearly` | 연간 요약 + 월별 추이 | 필요 | 200 | FR-030, FR-012 | **Should** |
| F1 | GET | `/api/export/rounds.csv` | 기간별 라운드 CSV | 필요 | 200 | FR-031 | **Should** |

\* B3은 세션이 없어도 204를 준다(아래 §6.3).

- Should 엔드포인트(E2, F1)는 명세만 미리 정하고 **Must 구현이 끝난 뒤** 만든다. 요구사항 상태가 "초안"이므로 확정 시 이 절을 다시 검토한다.
- 계정 삭제(FR-041, Should)는 SRS 초안 단계라 이 문서에 넣지 않는다. 확정되면 `DELETE /api/auth/me`로 추가할 예정.
- 골프장 단건 조회(`GET /api/golf-clubs/:id`)는 만들지 않는다. 수정 화면은 C1 목록 값으로 충분하고, `:id` 라우트가 줄면 격리 테스트 범위도 준다.

---

## 5. 헬스 체크

### A1. `GET /api/health` — 서버 깨어 있음 확인 (NFR-002)

- `@Public()`. **DB 연결·세션 조회 없음**(architecture §5.2). 프록시 비밀 검사 예외(Render 헬스 체크용).
- 쿼리·본문 없음.

```http
GET /api/health
```
```json
200 OK
Cache-Control: no-store

{ "status": "ok", "version": "4fa11b8", "uptimeSec": 42 }
```

| 상태 | 언제 |
|---|---|
| 200 | 프로세스가 요청을 받을 수 있음 |
| 502·503·504 / 시간 초과 | Render가 잠들어 있거나 기동 중 → SPA가 3초 간격 재시도(architecture §5.3) |

- 테스트: DB 연결 객체를 "호출하면 실패"하는 가짜로 바꿔도 200(architecture §5.2).

---

## 6. 인증 (FR-040)

### B1. `GET /api/auth/kakao/login` — 카카오 로그인 시작

- `@Public()`. SPA가 `fetch`가 아니라 **페이지 이동**(`location.href = '/api/auth/kakao/login'`)으로 호출한다.
- 쿼리·본문 없음.

```http
302 Found
Location: https://kauth.kakao.com/oauth/authorize?client_id=…&redirect_uri=https%3A%2F%2F<도메인>%2Fapi%2Fauth%2Fkakao%2Fcallback&response_type=code&state=<무작위>
Set-Cookie: __Host-oauth_state=<무작위>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600
```

- `scope` 파라미터를 보내지 않는다(동의 항목 없음, architecture §4.1).

### B2. `GET /api/auth/kakao/callback` — 카카오 콜백

- `@Public()`. 카카오가 브라우저를 이 주소로 보낸다. **응답은 항상 302**(JSON 에러를 주지 않음 — 사용자는 브라우저 화면에 있으므로 SPA 화면으로 돌려보내 안내).

| 쿼리 | 설명 |
|---|---|
| `code` | 인가 코드(성공 시) |
| `state` | B1에서 보낸 값 |
| `error`, `error_description` | 사용자가 취소한 경우 등(카카오가 붙임) |

| 상황 | 응답 | 관련 |
|---|---|---|
| 성공, 처음 로그인 | `users` 생성 + 세션 발급 → `302 Location: /` | **AC-040-1** |
| 성공, 기존 사용자 | 같은 `users` 행 사용(새 계정 없음) + 세션 발급 → `302 Location: /` | **AC-040-2** |
| `error=access_denied`(동의 취소) | `302 Location: /login?error=cancelled` | **AC-040-5** |
| `state` 불일치·쿠키 없음 | `302 Location: /login?error=state` | CSRF 방어 |
| 카카오 토큰 교환·사용자 조회 실패 | `302 Location: /login?error=kakao` + 서버 로그 | — |
| 카카오가 `access_denied` 외의 `error`를 붙임, `code` 없음 | `302 Location: /login?error=kakao` | — |

검사 순서: `error` 쿼리 → `state`(쿼리 = 쿠키, 상수 시간 비교) → `code` → 카카오 호출.

성공 응답 헤더:
```http
302 Found
Location: /
Set-Cookie: __Host-sid=<32바이트 base64url>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000
Set-Cookie: __Host-oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0
```
- 모든 경우에 `__Host-oauth_state`를 지운다.
- `/login?error=` 값별 화면 문구는 `ui-design.md`에서 정한다.

### B3. `POST /api/auth/logout` — 로그아웃

- **`@Public()`으로 둔다.** 세션이 이미 만료됐어도 로그아웃은 성공해야 하고(쿠키 정리), 401을 주면 SPA가 로그아웃 처리 중 또 로그인 화면 분기를 타게 된다. 쿠키가 있으면 그 세션 행을 지운다. Origin 검사는 한다(POST).
- 본문 없음.

```http
POST /api/auth/logout
Origin: https://<도메인>
Cookie: __Host-sid=…
```
```http
204 No Content
Set-Cookie: __Host-sid=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0
```

| 상태 | 언제 | 관련 |
|---|---|---|
| 204 | 항상(세션 유무와 관계없음) | **AC-040-3** |
| 403 `FORBIDDEN_ORIGIN` | Origin 불일치 | — |

- SPA는 204를 받으면 메모리 캐시를 비우고 `/login`으로 `replace` 이동한다(AC-040-3, architecture §4.3).

### B4. `GET /api/auth/me` — 내 정보

- 앱 시작 시 로그인 여부 판단(architecture §5.3), AC-040-4의 진입 검사에 쓴다.
- 카카오 회원번호(`provider_user_id`)는 **응답에 넣지 않는다**(쓸 곳이 없고 외부 식별자이므로).

```json
200 OK

{ "id": 7, "createdAt": "2026-11-30T09:12:00.000Z" }
```

| 상태 | 언제 | 관련 |
|---|---|---|
| 200 | 세션 유효 | AC-040-2 |
| 401 `UNAUTHENTICATED` | 쿠키 없음·만료·로그아웃됨 | **AC-040-3·4** |

---

## 7. 골프장 (FR-004, FR-006, FR-007)

### 응답 객체 `GolfClub`
```json
{
  "id": 12,
  "name": "가나 CC",
  "defaultCaddyFee": 150000,
  "isDefault": true,
  "createdAt": "2026-11-30T09:15:00.000Z",
  "updatedAt": "2026-11-30T09:15:00.000Z"
}
```
- 숨긴 골프장은 이 API로 나오지 않으므로 `hidden` 필드가 없다. 지난 라운드에서 숨긴 골프장 이름은 라운드 응답의 `golfClub.name`으로 보인다(AC-004-4).

### 검증 규칙 (C2·C3 공통)

| 필드 | 타입 | C2 | C3 | 규칙 | 실패 | 관련 |
|---|---|---|---|---|---|---|
| `name` | string | 필수 | 선택 | 앞뒤 공백 제거 후 **1~50자**. 공백만 있으면 `REQUIRED` | 400 | AC-004-1 |
| `defaultCaddyFee` | integer | 필수 | 선택 | **1 ~ 1,000,000** 정수 | 400 | FR-006, NFR-005 |
| `isDefault` | boolean | 선택(기본 `false`) | 선택 | `true`면 기존 기본 골프장 해제 후 지정(트랜잭션 하나). `false`면 이 골프장의 기본 지정만 해제 | — | **AC-004-3** |
| (이름 중복) | — | — | — | **보이는** 내 골프장끼리 같은 이름 금지. 숨긴 골프장과 같은 이름은 허용 | **409 `DUPLICATE_GOLF_CLUB_NAME`** | **AC-004-2**, Q-026 |
| (다른 필드) | — | — | — | `id`·`userId`·`hiddenAt` 등을 보내면 거부 | 400 `UNKNOWN_FIELD` | NFR-003 |

- 이름 비교는 공백 제거 후 **대소문자·전각 그대로** 비교한다("가나 CC"와 "가나 cc"는 다른 이름). DB 부분 유니크 인덱스와 같은 기준.
- C3 본문이 비어 있으면(`{}`) 400 `VALIDATION_FAILED`.

### C1. `GET /api/golf-clubs` — 내 골프장 목록

- 숨긴 골프장 제외. 정렬: 기본 골프장 먼저, 그다음 이름 가나다순.
- 빈 목록이면 SPA는 "라운드 추가" 시 골프장 등록 화면으로 안내한다(AC-001-5).

```json
200 OK

{
  "items": [
    { "id": 12, "name": "가나 CC", "defaultCaddyFee": 150000, "isDefault": true,  "createdAt": "…", "updatedAt": "…" },
    { "id": 15, "name": "다라 GC", "defaultCaddyFee": 160000, "isDefault": false, "createdAt": "…", "updatedAt": "…" }
  ]
}
```

| 상태 | 언제 | 관련 |
|---|---|---|
| 200 | 항상(0개면 빈 배열) | AC-004-1, **AC-004-7**(다른 사용자 골프장 없음), AC-006-1·2(기본 캐디피 제공) |
| 401 | 미인증 | AC-040-4 |

### C2. `POST /api/golf-clubs` — 골프장 추가

```http
POST /api/golf-clubs
Content-Type: application/json

{ "name": "  가나 CC ", "defaultCaddyFee": 150000, "isDefault": true }
```
```json
201 Created
Location: /api/golf-clubs/12

{ "id": 12, "name": "가나 CC", "defaultCaddyFee": 150000, "isDefault": true, "createdAt": "…", "updatedAt": "…" }
```

| 상태 | 언제 | 관련 |
|---|---|---|
| 201 | 추가 성공 | **AC-004-1**, AC-004-3 |
| 400 | 이름 누락·51자 이상, 기본 캐디피 범위 밖·정수 아님 | AC-004-1 |
| 401 / 403 | 미인증 / Origin 불일치 | — |
| 409 `DUPLICATE_GOLF_CLUB_NAME` | 보이는 골프장 중 같은 이름 있음 | **AC-004-2** |

400 예:
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "입력값을 확인해 주세요.",
    "fields": [{ "field": "defaultCaddyFee", "code": "OUT_OF_RANGE", "message": "기본 캐디피는 1원 이상 1,000,000원 이하로 입력해 주세요." }],
    "requestId": "…"
  }
}
```

### C3. `PATCH /api/golf-clubs/:id` — 골프장 수정

- 보낸 필드만 바꾼다.
- **`defaultCaddyFee`를 바꿔도 `rounds`는 건드리지 않는다**(FR-007). 이후 새 라운드 입력에서만 새 값이 채워진다.
- 이름을 바꾸면 지난 라운드에도 새 이름이 보인다(이름은 복사 저장하지 않음, data-model §3.3).

```http
PATCH /api/golf-clubs/12
Content-Type: application/json

{ "defaultCaddyFee": 160000 }
```
```json
200 OK

{ "id": 12, "name": "가나 CC", "defaultCaddyFee": 160000, "isDefault": true, "createdAt": "…", "updatedAt": "2026-12-10T10:00:00.000Z" }
```

| 상태 | 언제 | 관련 |
|---|---|---|
| 200 | 수정 성공 | AC-004-3, **AC-007-1·2·3** |
| 400 | 형식·범위 오류, 빈 본문, `:id`가 양의 정수가 아님 | — |
| 401 / 403 | 미인증 / Origin 불일치 | — |
| 404 `GOLF_CLUB_NOT_FOUND` | 없음 · **다른 사용자의 골프장** · 숨긴 골프장 | **AC-N003-1** |
| 409 `DUPLICATE_GOLF_CLUB_NAME` | 바꾼 이름이 다른 보이는 골프장과 같음 | AC-004-2 |

### C4. `DELETE /api/golf-clubs/:id` — 삭제 또는 숨기기

- 라운드가 하나라도 있으면 **숨기기**(`hidden_at = now()`, `is_default = false`), 없으면 **완전 삭제**. 경쟁 상황에서 DELETE가 FK `RESTRICT`에 막히면 숨기기로 다시 처리한다(data-model §3.3).
- 어느 쪽이 됐는지 SPA가 안내할 수 있도록 **200 + 결과**를 준다(204가 아님).

```http
DELETE /api/golf-clubs/12
```
```json
200 OK

{ "id": 12, "result": "hidden" }
```

| `result` | 의미 | 관련 |
|---|---|---|
| `"hidden"` | 라운드가 있어 숨김. 목록·입력 선택지에서 사라지고 지난 라운드·통계에는 이름 유지. 기본 지정 해제 | **AC-004-4·5** |
| `"deleted"` | 라운드가 없어 완전히 삭제 | **AC-004-6** |

| 상태 | 언제 | 관련 |
|---|---|---|
| 200 | 위 둘 중 하나 | AC-004-4·5·6 |
| 400 | `:id`가 양의 정수가 아님 | — |
| 401 / 403 | 미인증 / Origin 불일치 | — |
| 404 `GOLF_CLUB_NOT_FOUND` | 없음 · 다른 사용자의 것 · **이미 숨긴 것** | **AC-N003-1** |

- 삭제 확인 창은 SPA가 띄운다(라운드 삭제 AC-003-3과 같은 방식, `ui-design.md`).

---

## 8. 라운드 (FR-001 ~ FR-008)

### 응답 객체 `Round`
```json
{
  "id": 301,
  "playedOn": "2026-12-03",
  "slot": 1,
  "golfClub": { "id": 12, "name": "가나 CC", "hidden": false },
  "caddyFee": 160000,
  "nineExtCount": 1,
  "nineExtFee": 80000,
  "overFee": 20000,
  "income": 260000,
  "roundHalfUnits": 3,
  "createdAt": "2026-12-03T11:20:00.000Z",
  "updatedAt": "2026-12-03T11:20:00.000Z"
}
```

| 필드 | 설명 | 관련 |
|---|---|---|
| `golfClub` | 이름까지 함께 준다(목록마다 골프장 목록을 따로 맞춰 볼 필요 없음). `hidden: true`면 숨긴 골프장 — 지난 기록에는 이름이 그대로 보인다 | AC-004-4, AC-010-3 |
| `income` | 파생 값 = `caddyFee + nineExtFee + overFee`(저장하지 않음) | FR-008, AC-002-2, AC-008-2 |
| `roundHalfUnits` | 파생 값 = `2 + nineExtCount`. `3` → "1.5라운드" | Q-024, AC-010-5 |

### 검증 규칙 (D3 등록 · D4 수정)

| 필드 | 타입 | D3 | D4 | 규칙 | 실패 | 관련 |
|---|---|---|---|---|---|---|
| `playedOn` | string | **필수** | 선택 | `YYYY-MM-DD`, 실재하는 날짜. 과거·오늘·**미래 모두 허용** | 400 | AC-001-2, **AC-001-4** |
| `slot` | integer | **필수** | 선택 | `1`·`2`·`3` | 400 | AC-001-2, FR-005 |
| `golfClubId` | integer | **필수** | 선택 | 양의 정수. **내 골프장**이어야 함 | 400 / **404 `GOLF_CLUB_NOT_FOUND`**(없음·남의 것) | AC-001-2, **AC-N003-1** |
| 〃 | | | | 숨긴 골프장이면 거부. D4에서는 **골프장을 바꿀 때만** 검사(이미 숨긴 골프장에 연결된 라운드는 그대로 수정 가능) | **422 `GOLF_CLUB_HIDDEN`** | AC-004-4 |
| `caddyFee` | integer | **필수** | 선택 | **1 ~ 1,000,000** 정수. 0·음수·소수·초과 거부 | 400 | **AC-001-2·3**, AC-006-3 |
| `overFee` | integer | 선택(기본 0) | 선택 | **0 ~ 1,000,000** 정수 | 400 | **AC-002-1·3** |
| `nineExtCount` | integer | 선택(기본 0) | 선택 | **0 ~ 2** 정수. 3 이상 거부 | 400 (`message`: "나인추가는 최대 2회까지 기록할 수 있습니다.") | **AC-008-10** |
| 〃 | | | | (저장될 결과의) `slot`이 1이 아닌데 횟수 ≥ 1 | **422 `NINE_EXT_SLOT1_ONLY`** | **AC-008-6·7** |
| `nineExtFee` | integer | 선택 | 선택 | 횟수 ≥ 1이면 **1 ~ 1,000,000** 정수. 생략 시 규칙은 아래 | 400 | AC-008-4 |
| 〃 | | | | 결과 횟수가 0인데 0이 아닌 금액을 보냄 | **422 `NINE_EXT_FEE_WITHOUT_COUNT`** | AC-008-8 |
| (중복) | — | — | — | 내 라운드 중 같은 `playedOn`·`slot`이 이미 있음(DB 유니크 위반) | **409 `DUPLICATE_ROUND`** | **AC-005-3**, **AC-003-2**, Q-017 |
| (다른 필드) | — | — | — | `income`·`roundHalfUnits`·`userId` 등 응답 전용·모르는 필드 | 400 `UNKNOWN_FIELD` | NFR-003 |

**`nineExtFee` 생략 시 서버 규칙** (계산식은 `packages/shared`의 `defaultNineExtFee(caddyFee, count) = Math.floor(caddyFee / 2) * count`)
| 상황 | 저장 값 | 관련 |
|---|---|---|
| 결과 횟수 = 0 | `0` | AC-008-8 |
| D3, 횟수 ≥ 1 | `defaultNineExtFee(caddyFee, nineExtCount)` | AC-008-1·3·9 |
| D4, 요청에 `caddyFee` 또는 `nineExtCount`가 있음 | 결과 값으로 다시 계산 | AC-008-5 |
| D4, 둘 다 없음 | 기존 값 유지 | AC-008-4(고친 금액 유지) |

- **SPA는 횟수 ≥ 1이면 `nineExtFee`를 항상 보낸다.** "직접 고친 금액은 캐디피가 바뀌어도 유지"(AC-008-5)는 입력 폼 상태로 처리하고(data-model §3.4), 서버의 생략 규칙은 SPA를 거치지 않은 요청을 위한 일관된 기본 동작이다.
- 기본 캐디피 자동 채움(FR-006)과 기본 골프장 선택(AC-004-3), 부 자동 선택(AC-005-1·2: 그날 비어 있는 가장 빠른 부), 1~3부가 모두 찬 날의 추가 막기(AC-005-4)는 **SPA가** C1·D1 응답으로 처리한다. 서버는 `caddyFee`를 반드시 받는다(서버가 기본 캐디피로 몰래 채우지 않음 → FR-007 복사 저장이 명확).
- 검증 순서: 400(DTO) → 404(골프장 소유) → 422(업무 규칙) → 409(DB 유니크). 여러 400 오류는 `fields`에 한 번에 모아 준다(AC-001-2: 비어 있는 항목 **모두** 옆에 표시).

### D1. `GET /api/rounds` — 라운드 목록

| 쿼리 | 형식 | 설명 |
|---|---|---|
| `month` | `YYYY-MM` | 그 달 전체(달력·목록, FR-010) |
| `date` | `YYYY-MM-DD` | 그날만(날짜 탭 상세 AC-010-3, 부 자동 선택 AC-005-1·2) |

- **`month`·`date` 중 정확히 하나** 필수. 둘 다 없거나 둘 다 있으면 400.
- 정렬: `playedOn` 오름차순 → `slot` 오름차순(AC-005-5).
- 미래 날짜 라운드도 포함(AC-011-4).

```http
GET /api/rounds?date=2026-12-03
```
```json
200 OK

{
  "items": [
    {
      "id": 301, "playedOn": "2026-12-03", "slot": 1,
      "golfClub": { "id": 12, "name": "가나 CC", "hidden": false },
      "caddyFee": 160000, "nineExtCount": 1, "nineExtFee": 80000, "overFee": 20000,
      "income": 260000, "roundHalfUnits": 3, "createdAt": "…", "updatedAt": "…"
    },
    {
      "id": 302, "playedOn": "2026-12-03", "slot": 2,
      "golfClub": { "id": 9, "name": "마바 CC", "hidden": true },
      "caddyFee": 160000, "nineExtCount": 0, "nineExtFee": 0, "overFee": 0,
      "income": 160000, "roundHalfUnits": 2, "createdAt": "…", "updatedAt": "…"
    }
  ]
}
```

| 상태 | 언제 | 관련 |
|---|---|---|
| 200 | 항상(없으면 빈 배열) | AC-010-2·3, AC-005-5, **AC-N003-2** |
| 400 | 쿼리 누락·둘 다 있음·형식 오류(`2026-13`, `2026-02-30`) | — |
| 401 | 미인증 | AC-040-4 |

### D2. `GET /api/rounds/:id` — 라운드 1건

```json
200 OK

{ "id": 301, "playedOn": "2026-12-03", "slot": 1, "golfClub": { "id": 12, "name": "가나 CC", "hidden": false }, "caddyFee": 160000, "nineExtCount": 1, "nineExtFee": 80000, "overFee": 20000, "income": 260000, "roundHalfUnits": 3, "createdAt": "…", "updatedAt": "…" }
```

| 상태 | 언제 | 관련 |
|---|---|---|
| 200 | 내 라운드 | AC-010-3, AC-N004-1 |
| 400 | `:id`가 양의 정수가 아님 | — |
| 401 | 미인증 | — |
| 404 `ROUND_NOT_FOUND` | 없음 · **다른 사용자의 라운드** | **AC-N003-1** |

### D3. `POST /api/rounds` — 라운드 등록

요청 (AC-008-2 예시):
```http
POST /api/rounds
Content-Type: application/json

{
  "playedOn": "2026-12-03",
  "slot": 1,
  "golfClubId": 12,
  "caddyFee": 160000,
  "nineExtCount": 1,
  "nineExtFee": 80000,
  "overFee": 20000
}
```
```json
201 Created
Location: /api/rounds/301

{ "id": 301, "playedOn": "2026-12-03", "slot": 1, "golfClub": { "id": 12, "name": "가나 CC", "hidden": false }, "caddyFee": 160000, "nineExtCount": 1, "nineExtFee": 80000, "overFee": 20000, "income": 260000, "roundHalfUnits": 3, "createdAt": "…", "updatedAt": "…" }
```

최소 요청 (오버피·나인추가 생략 → 0, AC-002-1):
```json
{ "playedOn": "2026-12-05", "slot": 2, "golfClubId": 12, "caddyFee": 160000 }
```

| 상태 | 언제 | 관련 |
|---|---|---|
| 201 | 저장 성공(DB 커밋 후에만 응답) | **AC-001-1·4**, AC-002-1·2, AC-006-3, AC-008-1~4·8·9, **AC-N004-1** |
| 400 `VALIDATION_FAILED` | 필수 누락, 금액 범위·타입, 나인추가 3회 이상, 날짜 형식 | **AC-001-2·3**, **AC-002-3**, **AC-008-10** |
| 401 / 403 | 미인증 / Origin 불일치 | — |
| 404 `GOLF_CLUB_NOT_FOUND` | `golfClubId`가 없음·남의 것 | **AC-N003-1** |
| 409 `DUPLICATE_ROUND` | 같은 날짜·부 이미 있음 | **AC-005-3** |
| 422 `NINE_EXT_SLOT1_ONLY` / `NINE_EXT_FEE_WITHOUT_COUNT` / `GOLF_CLUB_HIDDEN` | 업무 규칙 위반 | AC-008-6·7·8, AC-004-4 |

409 예 (AC-005-3):
```json
{
  "error": {
    "code": "DUPLICATE_ROUND",
    "message": "이미 1부 기록이 있습니다.",
    "fields": [{ "field": "slot", "code": "DUPLICATE_ROUND", "message": "이미 1부 기록이 있습니다." }],
    "requestId": "…"
  }
}
```
> 409·422도 원인이 특정 입력란이면 `fields`를 붙여 그 칸 옆에 표시할 수 있게 한다. 이때 `fields[].code`는 최상위 `code`와 같은 값이다.

422 예 (AC-008-7):
```json
{
  "error": {
    "code": "NINE_EXT_SLOT1_ONLY",
    "message": "나인추가는 1부에만 기록할 수 있습니다.",
    "fields": [{ "field": "slot", "code": "NINE_EXT_SLOT1_ONLY", "message": "나인추가는 1부에만 기록할 수 있습니다." }],
    "requestId": "…"
  }
}
```

### D4. `PATCH /api/rounds/:id` — 라운드 수정

- 보낸 필드만 바꾸되, **기존 값과 합친 결과 전체**에 위 검증 규칙을 적용한다(예: 기존 1부 + 나인추가 1회에 `{ "slot": 2 }`만 보내면 422).
- 쿼리 하나: `UPDATE … WHERE id = $id AND user_id = $userId RETURNING *`. 0행 → 404(architecture §3.3 ③). 합친 결과 검증을 위해 같은 트랜잭션에서 먼저 `SELECT … WHERE id AND user_id … FOR UPDATE`로 읽는다(이것도 `user_id` 조건 포함, 0행이면 404).
- 빈 본문 `{}`은 400.

```http
PATCH /api/rounds/301
Content-Type: application/json

{ "caddyFee": 150000, "nineExtFee": 75000 }
```
```json
200 OK

{ "id": 301, "playedOn": "2026-12-03", "slot": 1, "golfClub": { "id": 12, "name": "가나 CC", "hidden": false }, "caddyFee": 150000, "nineExtCount": 1, "nineExtFee": 75000, "overFee": 20000, "income": 245000, "roundHalfUnits": 3, "createdAt": "…", "updatedAt": "2026-12-04T08:00:00.000Z" }
```

| 상태 | 언제 | 관련 |
|---|---|---|
| 200 | 수정 성공 | **AC-003-1**, AC-008-5 |
| 400 | 형식·범위 오류, 빈 본문, 잘못된 `:id` | AC-001-3, AC-002-3, AC-008-10 |
| 401 / 403 | 미인증 / Origin 불일치 | — |
| 404 `ROUND_NOT_FOUND` | 없음 · **다른 사용자의 라운드** | **AC-N003-1** |
| 404 `GOLF_CLUB_NOT_FOUND` | 바꾸려는 `golfClubId`가 없음·남의 것 | **AC-N003-1** |
| 409 `DUPLICATE_ROUND` | 바꾼 날짜·부가 다른 라운드와 겹침 | **AC-003-2** |
| 422 | `NINE_EXT_SLOT1_ONLY`(나인추가 있는 1부를 2·3부로), `NINE_EXT_FEE_WITHOUT_COUNT`, `GOLF_CLUB_HIDDEN`(숨긴 골프장으로 변경) | **AC-008-7**, AC-004-4 |

### D5. `DELETE /api/rounds/:id` — 라운드 삭제

- 물리 삭제(data-model §2). "삭제할까요?" 확인 창은 SPA 책임(AC-003-3) — 서버는 요청이 오면 바로 지운다.

```http
DELETE /api/rounds/301
```
```http
204 No Content
```

| 상태 | 언제 | 관련 |
|---|---|---|
| 204 | 삭제 성공 | **AC-003-3·4** |
| 400 | 잘못된 `:id` | — |
| 401 / 403 | 미인증 / Origin 불일치 | — |
| 404 `ROUND_NOT_FOUND` | 없음 · 다른 사용자의 것 · 이미 삭제됨 | **AC-N003-1** |

---

## 9. 통계 (FR-010, FR-011, FR-012·030 Should)

### 공통 응답 객체 `IncomeSummary`

| 필드 | 타입 | 계산 (data-model §5) | 관련 |
|---|---|---|---|
| `incomeTotal` | integer | `SUM(caddy_fee + nine_ext_fee + over_fee)` | FR-011, **AC-N005-2** |
| `caddyFeeTotal` | integer | `SUM(caddy_fee)` | FR-011 |
| `nineExtFeeTotal` | integer | `SUM(nine_ext_fee)` | FR-011, Q-024 |
| `overFeeTotal` | integer | `SUM(over_fee)` | FR-011 |
| `roundCount` | integer | 라운드 **건수** `COUNT(*)` | — |
| `roundHalfUnits` | integer | `SUM(2 + nine_ext_count)` — 환산 라운드 수 × 2 | FR-011, Q-024 |
| `nineExtCountTotal` | integer | `SUM(nine_ext_count)` | FR-011 |
| `averageIncomePerRound` | integer \| **null** | `round(incomeTotal × 2 ÷ roundHalfUnits)`, 원 단위 반올림(정수 연산). **0건이면 `null`** → 화면 "-" | **AC-011-2·3·5** |

- 모든 쿼리에 `WHERE user_id = $userId`(AC-N003-2). 미래 날짜 포함(AC-011-4).
- `SUM`은 bigint 문자열로 오므로 `Number()` 변환 + `Number.isSafeInteger` 확인(data-model §5).

### E1. `GET /api/stats/monthly` — 월 통계 + 달력

| 쿼리 | 형식 | 규칙 |
|---|---|---|
| `month` | `YYYY-MM` | 필수 |

- 달력 화면은 **E1(날짜별 합계) + D1(`month`, 라운드 목록)** 을 동시에 부른다. 통계 화면은 E1만.
- `days`에는 라운드가 있는 날짜만, 날짜 오름차순.

AC-011-5 예시 (12월: ① 12/3 1부 160,000 + 나인추가 1회 80,000 + 오버피 20,000, ② 12/5 2부 160,000):
```http
GET /api/stats/monthly?month=2026-12
```
```json
200 OK

{
  "month": "2026-12",
  "summary": {
    "incomeTotal": 420000,
    "caddyFeeTotal": 320000,
    "nineExtFeeTotal": 80000,
    "overFeeTotal": 20000,
    "roundCount": 2,
    "roundHalfUnits": 5,
    "nineExtCountTotal": 1,
    "averageIncomePerRound": 168000
  },
  "days": [
    { "date": "2026-12-03", "roundCount": 1, "roundHalfUnits": 3, "incomeTotal": 260000 },
    { "date": "2026-12-05", "roundCount": 1, "roundHalfUnits": 2, "incomeTotal": 160000 }
  ]
}
```
화면 표시: 라운드 수 `5 ÷ 2 = 2.5`, 12/3 칸 "1.5라운드 · 260,000원"(AC-010-5).

라운드가 없는 달 (AC-011-2):
```json
{
  "month": "2027-01",
  "summary": { "incomeTotal": 0, "caddyFeeTotal": 0, "nineExtFeeTotal": 0, "overFeeTotal": 0, "roundCount": 0, "roundHalfUnits": 0, "nineExtCountTotal": 0, "averageIncomePerRound": null },
  "days": []
}
```

| 상태 | 언제 | 관련 |
|---|---|---|
| 200 | 항상 | **AC-010-1·2·5**, **AC-011-1~5**, AC-001-1(즉시 반영), AC-003-1·4, AC-007-1, **AC-N003-2**, **AC-N005-2** |
| 400 | `month` 누락·형식 오류 | — |
| 401 | 미인증 | — |

### E2. `GET /api/stats/yearly` — 연간 요약 (Should: FR-030, FR-012)

| 쿼리 | 형식 | 규칙 |
|---|---|---|
| `year` | `YYYY` | 필수, 2000~2099 |

- 종합소득세 신고 **참고용 총액**만. 세액 계산 없음(FR-033 Won't).
- `months`는 **항상 12개**(라운드 없는 달은 0, 평균 `null`) → 그래프(FR-012)가 빈 달을 채울 필요 없음.

```jsonc
200 OK

{
  "year": 2026,
  "summary": { "incomeTotal": 38250000, "caddyFeeTotal": 34800000, "nineExtFeeTotal": 1200000, "overFeeTotal": 2250000, "roundCount": 232, "roundHalfUnits": 479, "nineExtCountTotal": 15, "averageIncomePerRound": 159708 },
  "months": [
    { "month": "2026-01", "incomeTotal": 0, "roundHalfUnits": 0, "roundCount": 0, "averageIncomePerRound": null },
    // … 2026-02 ~ 2026-11 …
    { "month": "2026-12", "incomeTotal": 420000, "roundHalfUnits": 5, "roundCount": 2, "averageIncomePerRound": 168000 }
  ]
}
```
(예시 숫자는 형식 설명용. `averageIncomePerRound` = round(38,250,000 × 2 ÷ 479) = 159,708)

| 상태 | 언제 | 관련 |
|---|---|---|
| 200 | 항상 | FR-030, FR-012, AC-N003-2 |
| 400 | `year` 누락·형식·범위 오류 | — |
| 401 | 미인증 | — |

---

## 10. CSV 내보내기 (Should: FR-031)

### F1. `GET /api/export/rounds.csv`

| 쿼리 | 형식 | 규칙 |
|---|---|---|
| `from` | `YYYY-MM-DD` | 필수, 시작일(포함) |
| `to` | `YYYY-MM-DD` | 필수, 종료일(**포함**). `from ≤ to` |

- 기간은 **최대 366일**. 넘으면 `422 DATE_RANGE_TOO_LONG`(종합소득세용 1년 단위에 맞추고, 무료 인스턴스 메모리·응답 시간 보호). 여러 해가 필요하면 해마다 받는다.
- SPA는 `fetch`가 아니라 링크 이동(`<a href download>`)으로 받는다. 401이면 브라우저에 JSON이 보이므로, SPA는 링크를 누르기 전에 `/api/auth/me`로 세션을 확인한다.

```http
GET /api/export/rounds.csv?from=2026-01-01&to=2026-12-31
```
```http
200 OK
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="rounds-2026-01-01_2026-12-31.csv"
Cache-Control: no-store
```
```csv
﻿날짜,부,골프장,캐디피,나인추가 횟수,나인추가 금액,오버피,라운드 수입,환산 라운드 수
2026-12-03,1,가나 CC,160000,1,80000,20000,260000,1.5
2026-12-05,2,마바 CC,160000,0,0,0,160000,1
```

| 규칙 | 내용 | 이유 |
|---|---|---|
| 인코딩 | UTF-8 + **BOM**(`﻿`), 줄바꿈 `\r\n` | 휴대폰·PC 엑셀에서 한글이 깨지지 않게 |
| 정렬 | 날짜 → 부 오름차순 | AC-005-5와 같음 |
| 금액 | 천 단위 쉼표 없는 정수 | 엑셀에서 숫자로 인식, NFR-005 |
| 환산 라운드 수 | `roundHalfUnits ÷ 2`를 `1`·`1.5`·`2` 문자열로 출력(정수 연산으로 만든 문자열) | NFR-005 |
| 골프장 이름 | 숨긴 골프장도 이름 그대로 | AC-004-4 |
| 이스케이프 | RFC 4180(쉼표·따옴표·줄바꿈이 있으면 `"…"`). **`=`·`+`·`-`·`@`·탭·CR로 시작하는 값은 앞에 `'`를 붙인다**(CSV 수식 주입 방지 — 골프장 이름은 사용자 입력) | 보안 |
| 빈 기간 | 헤더 한 줄만 있는 CSV(200) | — |
| 범위 | `WHERE user_id = $userId AND played_on BETWEEN $from AND $to` | **AC-N003-2** |

| 상태 | 언제 | 관련 |
|---|---|---|
| 200 | 성공(`text/csv`) | FR-031, AC-N003-2 |
| 400 | 쿼리 누락·형식 오류, `from > to` | — |
| 401 | 미인증(JSON 에러) | — |
| 422 `DATE_RANGE_TOO_LONG` | 366일 초과 | — |

---

## 11. 테스트 연결 (→ `04-test/test-plan.md` §4로 옮김, 2026-11-27. 이후 변경은 test-plan에서)

| 테스트 | 수준 | 검증 | AC |
|---|---|---|---|
| **격리: 경로 ID** | E2E | B 쿠키로 A의 `GET/PATCH/DELETE /api/rounds/:id`, `PATCH/DELETE /api/golf-clubs/:id` → 404, A 데이터 불변 | **AC-N003-1** |
| **격리: 응답 구분 불가** | E2E | 위 응답과 "B → 없는 ID 999999" 응답을 `requestId`만 빼고 깊은 비교 → 같음 | **AC-N003-1**, §3 |
| **격리: 본문 ID** | E2E | B가 A의 `golfClubId`로 `POST /api/rounds`, `PATCH /api/rounds/:id` → `404 GOLF_CLUB_NOT_FOUND` | **AC-N003-1** |
| 격리: `userId` 주입 | E2E | 본문에 `"userId": A` 추가 → 400 `UNKNOWN_FIELD` | NFR-003 |
| **격리: 목록·집계** | E2E | B의 D1·E1·E2·F1·C1 응답에 A의 ID·금액·골프장 이름 없음, 각자 시드 합계와 일치 | **AC-N003-2**, AC-004-7 |
| 라우트 누락 감지 | E2E | `:id` 라우트 전부(D2·D4·D5·C3·C4)가 격리 표에 있는지 | AC-N003-1 |
| 인증 없음 | E2E | 쿠키 없이 공개가 아닌 모든 라우트 → 401 `UNAUTHENTICATED` | **AC-040-4** |
| 로그아웃 | E2E | B3 후 같은 쿠키로 B4 → 401 | **AC-040-3** |
| Origin | E2E | 다른 Origin으로 D3 → 403 `FORBIDDEN_ORIGIN`, 데이터 변화 없음 | NFR-003 |
| 에러 형식 | E2E | 모든 4xx 응답이 §2.2 스키마(공유 타입의 zod/class-validator 스키마)로 검증됨 | ADR-0008 |
| 입력 검증 | E2E | 캐디피 0·-1·1.5·"150000"·1,000,001, 오버피 -1, 나인추가 3 → 400 + 해당 `fields` | AC-001-2·3, AC-002-3, AC-008-10 |
| 필수 항목 모두 표시 | E2E | 4개 필수 모두 빼고 D3 → `fields` 4개 | AC-001-2 |
| 나인추가 규칙 | E2E | 2부 + 횟수 1 → 422, 나인추가 있는 1부를 `{slot:2}`로 PATCH → 422, 금액 생략 시 기본값(155,555 → 77,777) | AC-008-1·7·9 |
| 중복 | E2E | 같은 날짜·부 D3 두 번 → 409, D4로 겹치게 → 409, 동시에 두 요청 → 하나만 201 | AC-005-3, AC-003-2 |
| 골프장 | E2E | 이름 중복 409, 기본 지정 후 C1 첫 항목·하나뿐, 라운드 있는 골프장 C4 → `hidden` + C1에서 사라짐 + D1에 이름 유지, 없는 골프장 → `deleted` | AC-004-1~6 |
| FR-007 | E2E | 기본 캐디피 C3 변경 → 기존 라운드 D1·E1 값 불변 | AC-007-1·2·3 |
| 통계 | E2E | AC-011-1·5 시드 → E1 `summary` 정확히 일치, 빈 달 → `averageIncomePerRound: null` | AC-011-1~5, AC-N005-2 |
| 헬스 | E2E | DB 가짜가 호출되면 실패하도록 두고 A1 → 200 | NFR-002 |
| CSV | E2E | BOM, 헤더, 수식 주입 이스케이프(`=SUM(1)` 이름), 367일 → 422 | FR-031 |

---

## 12. 요구사항 → API 추적

| 요구사항 | 엔드포인트 |
|---|---|
| FR-001 | D3 |
| FR-002 | D3, D4 (`overFee`) |
| FR-003 | D2, D4, D5 |
| FR-004 | C1~C4 |
| FR-005 | D1(`date`, 부 순서), D3·D4(409) |
| FR-006 | C1(`defaultCaddyFee` 제공), C2·C3 |
| FR-007 | C3이 `rounds`를 건드리지 않음, D3·D4는 금액을 받아 저장 |
| FR-008 | D3·D4(`nineExtCount`·`nineExtFee`), E1(`nineExtFeeTotal`·`roundHalfUnits`) |
| FR-010 | E1(`days`) + D1(`month`) |
| FR-011 | E1(`summary`) |
| FR-012 (Should) | E2(`months`) |
| FR-030 (Should) | E2(`summary`) |
| FR-031 (Should) | F1 |
| FR-040 | B1~B4 |
| NFR-002 | A1 |
| NFR-003 | §1.2, §3, 모든 `:id`·목록·집계 |
| NFR-005 | 금액 정수, `roundHalfUnits`, `averageIncomePerRound` 정수 반올림 |

## 변경 이력
- 2026-11-26 틀 생성
- 2026-11-27 전체 작성 → 상태 "검토중": 공통 규칙, 상태 코드 원칙(400/409/422 구분), 에러 응답 형식(ADR-0008)·코드 목록, 남의 리소스 = 404 근거, 엔드포인트 17개(헬스·인증·골프장·라운드·월/연 통계·CSV) 요청/응답·검증·AC, 테스트 연결
- 2026-11-27 ADR-0008 사용자 승인
- 2026-11-27 Q-027 승인: 날짜 허용 범위 2000-01-01 ~ 2099-12-31
- 2026-11-27 **확정** (사용자 승인, M1 설계 확정). 이후 변경은 이 이력에 기록한다
- 2026-11-27 §11 테스트 표를 `test-plan.md` §4(T-E01~20)로 이관. 프록시 비밀 테스트(T-E11) 추가
- 2026-11-27 Base URL 설명: Pages Functions → Worker 프록시 (ADR-0002 개정)
- 2026-11-28 인증 구현 반영: §1.3 `Cache-Control: no-store`를 모든 API 응답으로(구현이 전역 미들웨어), B2에 카카오 기타 오류·`code` 없음 → `error=kakao`와 검사 순서 추가
