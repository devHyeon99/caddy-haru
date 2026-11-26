# API 명세

> 상태: 미착수 (Phase 2에서 작성) · 최종 수정일: 2026-11-26

## 공통 규칙
- TODO: Base URL, 인증 방식, 에러 응답 형식, 날짜/금액 포맷

## 엔드포인트 목록
| Method | Path | 설명 | 관련 FR |
|---|---|---|---|
| POST | /rounds | 라운드 등록 | FR-001 |
| GET | /rounds?month= | 월별 라운드 조회 | FR-010 |
| PATCH | /rounds/{id} | 라운드 수정 | FR-003 |
| DELETE | /rounds/{id} | 라운드 삭제 | FR-003 |
| GET | /stats/monthly | 월별 통계 | FR-011 |

> 위는 예시. 아키텍처 확정 후 상세(요청/응답 스키마)를 작성한다.

## 변경 이력
- 2026-11-26 틀 생성
