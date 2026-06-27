# 폴더 · 배치 컨벤션

이 프로젝트는 **Feature-Sliced Design(FSD)** 구조를 따른다. "이걸 어디에 둘까?"는
아래 규칙으로 기계적으로 결정한다.

## 레이어 (어디에 두나)

| 레이어             | 담는 것                                              | 예                                     |
| ------------------ | ---------------------------------------------------- | -------------------------------------- |
| `app/`             | 라우트·페이지·레이아웃·프로바이더                    | `app/login/page.tsx`                   |
| `features/<name>/` | **한 feature에서만** 쓰는 UI·로직                    | `features/calendar/ui/round-sheet.tsx` |
| `entities/`        | 도메인 데이터·타입·모델                              | `entities/round`                       |
| `shared/`          | **2개 이상 feature**가 쓰거나 도메인 무관한 재사용물 | `shared/ui/button.tsx`                 |

### 의존 방향

`app → features → entities → shared` 한 방향으로만 의존한다.
**shared는 features를 import하지 않는다.** (feature가 shared를 쓰는 건 정상)

### 승격 규칙 (가장 중요)

1. 새 코드는 **항상 가장 좁은 곳**(그걸 쓰는 feature)에서 시작한다.
2. **다른 슬라이스에 두 번째 소비자**가 생기면 그때 `shared`로 올린다.
3. "언젠가 쓸지도 몰라서" 미리 shared에 두지 않는다 (투기적 일반화 금지).

> 예: `MoneyInput`은 calendar 전용이었다가 onboarding이 같이 쓰게 되면서 shared 유지가 정당해졌다.

## `shared/` 내부

| 폴더            | 역할                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `shared/ui/`    | 재사용 **컴포넌트(.tsx)** + 그 스타일(.css.ts) + **합성용 스타일 프리미티브**(`inputShell`, `field`, `text`, `segmented`) |
| `shared/lib/`   | 순수 함수 (format, calendar)                                                                                              |
| `shared/theme/` | 디자인 토큰 · 테마                                                                                                        |
| `shared/api/`   | 외부 클라이언트 (supabase 등)                                                                                             |

**공유 스타일은 `shared/ui` 한 곳에만 둔다.** (`shared/styles`는 폐지됨)

## 스타일(.css.ts) 배치

- `.css.ts`는 항상 그걸 쓰는 `.tsx` **바로 옆**에 둔다 (co-locate).
- 여러 컴포넌트가 공유하는 스타일은 `shared/ui`에 **독립 .css.ts**로 추출한다.
- 한 파일에 성격이 다른 스타일을 섞지 않는다. 역할별로 파일을 나눈다
  (예: `text.css.ts` = 타이포 헬퍼, `segmented.css.ts` = 세그먼트 컨트롤).

## 컴포넌트 vs 스타일 추출 — "3의 법칙"

- 같은 패턴이 **2~3번 반복되면** 추출한다. 미리 만들지 않는다.
- **외형이 같으면** 스타일/recipe를 공유한다 (예: `inputShell`).
- **동작이 같으면** 컴포넌트를 추출한다 (예: `MoneyInput`).
- 외형은 공유하되 동작은 컴포넌트별로 둔다. 변환(단위 등)은 컴포넌트가 아니라
  **사용하는 쪽 경계**에서 한다.

## 디자인 토큰

- 색·간격·타이포·반경·그림자는 [theme.css.ts](../src/shared/theme/theme.css.ts)의
  토큰만 쓴다. `.css.ts`에 raw 값(`#fff`, `fontSize: 13`)을 직접 쓰지 않는다.
- 토큰 네이밍은 **역할 기반**(`brandText`, `actionPrimary`, `color.payment.*`).
