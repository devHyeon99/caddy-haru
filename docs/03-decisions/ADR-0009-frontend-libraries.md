# ADR-0009: 프론트엔드 라이브러리 — React Router · TanStack Query · vanilla-extract · Radix Dialog + vaul

> 상태: 승인 · 날짜: 2026-11-27 (사용자 승인 2026-11-27)

## 배경 (Context)
`ui-design.md` §1.4·§8은 라우터, 서버 상태 캐시, 스타일 방식, 바텀 시트·대화상자를 Phase 3 시작 때 정하도록 남겨 두었다. 설계에서 이미 정한 요구는 다음과 같다.

| 영역 | 설계에서 정한 요구 | 근거 |
|---|---|---|
| 라우터 | 화면 13개. 달력 주소 `/calendar?month=…&date=…`. 뒤로 가기 = 시트·대화상자 닫기. 로그아웃·401 때 `/login`으로 `replace` 이동. 통계·CSV 화면은 지연 로딩 | ui-design §2·§4.8, AC-040-3, architecture §9(NFR-002) |
| 서버 상태 | **메모리에만** 보관(로컬 저장소 금지). 홈에서 C1·D1(`date=오늘`) 미리 불러오기. 저장·수정·삭제 뒤 그 달 E1·D1과 그날 D1 무효화. 로그아웃 때 전부 비우기 | ui-design §1.4, AC-001-1, AC-003-1·4, AC-040-3 |
| 스타일 | 360px 모바일 우선, 터치 44px 이상, 가로 스크롤 없음. 초기 JS gzip 200KB 이하 | NFR-001, AC-N001-1, NFR-002 |
| 시트·대화상자 | SCR-03d 바텀 시트(끌어서 닫기 손잡이 + [✕]). DLG-01·02는 기본 포커스 [취소], 바깥 영역·뒤로 가기·Esc = 취소 | ui-design §4.7·§4.8, AC-003-3 |

학습·포트폴리오 목적(헌장)이 있으므로 "많이 쓰이는 도구를 제대로 쓰는 경험"도 고려했다.

## 선택지 (Options)

**라우터**

| 선택지 | 장점 | 단점 |
|---|---|---|
| **React Router** | 가장 많이 쓰임(자료·채용 수요). SPA 모드로 충분. `lazy`로 지연 로딩 | 주소 쿼리 값(`month`·`date`) 파싱·검증을 직접 해야 함 |
| TanStack Router | 주소 쿼리까지 타입 검증. TanStack Query와 궁합 | 배울 것이 많고 번들이 조금 큼 |

**서버 상태 캐시**

| 선택지 | 장점 | 단점 |
|---|---|---|
| **TanStack Query** | 미리 불러오기·키 단위 무효화·전체 비우기가 기본 기능. 기본 저장소가 메모리라 설계와 일치 | 약 13KB(gzip). 기본값(재시도·포커스 시 다시 불러오기)을 이 앱에 맞게 바꿔야 함 |
| SWR | 더 작음 | 저장·수정(mutation)과 여러 키 무효화를 직접 짜야 함 |
| 직접 구현 | 의존성 없음 | 중복 요청·경쟁 상태를 직접 막아야 함 |

**스타일**

| 선택지 | 장점 | 단점 |
|---|---|---|
| CSS Modules | Vite 기본 기능, 설치 없음 | 토큰(색·간격·44px)을 쓸 때 오타를 잡아 주지 않음 |
| Tailwind CSS | 많이 쓰임, 빠름 | 마크업에 클래스가 길어짐 |
| **vanilla-extract** | **빌드 때 CSS 파일로 추출(런타임 0)** → 번들 목표에 영향 없음. 스타일을 TypeScript로 쓰므로 토큰 이름이 타입 검사됨. `recipes`로 버튼 등 변형을 타입으로 정의 | Vite 플러그인 하나가 더 필요. 스타일 파일이 `*.css.ts`로 분리됨. Vite 주 버전이 오를 때 플러그인 호환 확인 필요 |

**바텀 시트·대화상자**

| 선택지 | 장점 | 단점 |
|---|---|---|
| 브라우저 `<dialog>` | 의존성 0 | 끌어서 닫기 없음. 브라우저마다 세부 동작을 직접 맞춰야 함 |
| Radix Dialog만 | 접근성 검증된 컴포넌트 | 시트 끌어서 닫기는 직접 구현 |
| **Radix Dialog + vaul** | 대화상자는 Radix, 시트는 Radix 위에 만든 vaul → **같은 기반** 하나로 포커스 가두기·Esc·바깥 누르기 처리. 설계의 "끌어서 닫기 손잡이"를 그대로 구현 | 의존성이 가장 많음. vaul은 개인이 만든 라이브러리라 유지보수 상태를 지켜봐야 함 |

## 결정 (Decision)

| 영역 | 선택 | 쓰는 방식 |
|---|---|---|
| 라우터 | **React Router** (SPA, `createBrowserRouter`) | 통계·CSV 라우트는 `lazy`. 주소 쿼리는 `shared/lib`의 파서 함수로 검증(잘못된 `month`는 이번 달로 바꿔 `replace`). 로그아웃·401은 `navigate('/login', { replace: true })` |
| 서버 상태 | **TanStack Query** | 아래 "Query 기본값" 참고 |
| 스타일 | **vanilla-extract** (`@vanilla-extract/css` + Vite 플러그인, 필요하면 `recipes`) | `createGlobalTheme`으로 토큰(색·간격·글자 크기·`touchMin: 44px`) 한 곳에 정의. 컴포넌트 옆에 `*.css.ts` |
| 대화상자 | **Radix Dialog** (`@radix-ui/react-dialog`) | DLG-01·02. 바깥 누르기·Esc = 취소(AC-003-3)라서 AlertDialog가 아니라 Dialog를 쓰고, 처음 포커스를 [취소]로 지정 |
| 바텀 시트 | **vaul** (`Drawer`) | SCR-03d. 열림 상태는 주소의 `date`에서 읽는다(아래) |

**Query 기본값** (설계 요구를 코드로 옮긴 것)
- 저장소는 기본 메모리 캐시만 쓴다. **persister를 붙이지 않는다**(ui-design §1.4).
- 쿼리 키는 `shared/api/query-keys.ts` 한 곳에서 만든다: `golfClubs`, `rounds({ month })`, `rounds({ date })`, `monthlyStats({ month })`. 저장 성공 시 무효화 대상은 이 파일의 함수 하나로 정한다(AC-001-1, AC-003-4).
- 로그아웃·401: `queryClient.clear()` 후 `/login`으로 `replace`(AC-040-3·4). 401 처리는 fetch 래퍼(architecture §7 `shared/api/`) 한 곳에서 한다.
- 재시도: 저장·수정·삭제는 **재시도 없음**(ui-design §1.3 "자동 재시도 없음"). 조회도 4xx는 재시도 없음. 서버 깨우기(502·503·504)는 Query 재시도가 아니라 fetch 래퍼의 깨우기 흐름이 맡는다(architecture §5.3).
- `refetchOnWindowFocus: false`: 휴대폰에서 앱을 다시 볼 때마다 요청이 나가 잠든 서버를 깨우지 않게 한다. 데이터는 이 사용자만 바꾸므로 저장 뒤 무효화로 충분하다.

**시트와 뒤로 가기** (ui-design §4.8)
- 날짜를 누르면 `?date=`를 **push**한다 → 시트의 `open = searchParams.has('date')`.
- [✕]·끌어내리기·바깥 누르기로 닫으면 `navigate(-1)`로 그 항목을 되돌린다. 주소로 바로 들어와 이전 항목이 없으면 `date`를 지운 주소로 `replace`.
- 대화상자(DLG-01·02)는 주소에 넣지 않는다. 열릴 때 `history.pushState`로 항목을 하나 넣고, 뒤로 가기(`popstate`) = 취소로 처리한다.

**범위 밖**: 폼은 우선 React 상태로 직접 다룬다(입력란 몇 개, 검증은 `packages/shared` 함수 + 서버 `fields`). 필요해지면 따로 결정한다. 아이콘·토스트도 구현하면서 정한다.

**버전**: 모노레포 뼈대를 만들 때 각 라이브러리 최신 안정판을 확인해 `package.json`에 **정확한 버전으로 고정**한다(ADR-0003과 같은 방식).

## 근거 / 결과 (Consequences)
- 좋은 점
  - 설계에서 정한 캐시 동작(미리 불러오기·무효화·전체 비우기)을 라이브러리 기본 기능으로 쓰므로 직접 짤 코드가 적다.
  - vanilla-extract는 런타임이 없어 번들 목표(NFR-002)에 영향을 주지 않고, 44px 같은 크기 규칙을 토큰으로 강제할 수 있다.
  - 대화상자와 시트가 같은 Radix 기반이라 포커스·Esc 동작이 일정하다.
  - 예상 초기 JS(gzip): React 약 45KB + Router 약 20KB + Query 약 13KB + Radix Dialog·vaul 약 15KB ≈ **100KB 안팎** → 200KB 목표 안. 실제 크기는 뼈대 빌드 때 재고, 넘으면 이 ADR에 기록한다.
- 감수할 점
  - 의존성이 늘어난다(특히 vaul). **뼈대를 만들 때 vaul의 유지보수 상태와 React 주 버전 호환을 확인**한다. 문제가 있으면 Radix Dialog를 시트 모양으로 쓰고 끌어서 닫기는 빼며(손잡이 대신 [✕]만), 이 ADR을 갱신한다.
  - React Router는 주소 쿼리를 타입으로 검증해 주지 않으므로 파서 함수에 단위 테스트를 붙인다.
  - vanilla-extract는 Vite 플러그인에 묶여 있어 Vite를 올릴 때 호환을 먼저 확인한다.
- 해야 할 일
  - `ui-design.md` §1.4·§8의 "Phase 3 시작 시 정한다"를 이 ADR로 연결(완료).
  - E2E(Playwright)에서 시트 열고 뒤로 가기 → 시트 닫힘·주소에서 `date` 제거 확인(ui-design §6에 추가).
