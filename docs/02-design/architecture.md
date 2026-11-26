# 시스템 아키텍처

> 상태: 미착수 (Phase 2에서 작성) · 최종 수정일: 2026-11-26
> 선행 조건: SRS Must 요구사항 확정, Q-001·Q-006·Q-007·Q-010 해결

## 1. 아키텍처 개요
TODO: 전체 구성도 (Mermaid)

```mermaid
flowchart LR
  User[캐디 - 모바일 브라우저] --> FE[프론트엔드]
  FE --> API[백엔드 API]
  API --> DB[(데이터베이스)]
```

## 2. 기술 스택
| 영역 | 선택 | 근거 ADR |
|---|---|---|
| 프론트엔드 | TODO | ADR-XXXX |
| 백엔드 | TODO | ADR-XXXX |
| DB | TODO | ADR-XXXX |
| 인증 | TODO | ADR-XXXX |
| 배포/호스팅 | TODO | ADR-XXXX |

## 3. 모듈 구조 (레이어)
TODO: 예) presentation / application(service) / domain / infrastructure

## 4. 비기능 요구사항 대응
| NFR | 설계상 대응 방안 |
|---|---|
| NFR-001 사용성 | TODO |
| NFR-003 보안 | TODO |
| NFR-004 신뢰성 | TODO |
| NFR-005 정확성 | 금액은 정수(원) 타입으로 저장 |

## 5. 디렉터리 구조 (예정)
TODO

## 변경 이력
- 2026-11-26 틀 생성
