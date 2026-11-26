# 문서 목차

> 상태: 초안 · 최종 수정일: 2026-11-26

소프트웨어 개발 생명주기(SDLC) 순서대로 폴더를 나눴다. 번호 순서가 곧 작업 순서다.

```
docs/
├── README.md                 ← 지금 이 파일 (목차)
├── PROGRESS.md               ← 진행 현황 · 다음 할 일 (세션 시작점)
├── SESSION_GUIDE.md          ← 다른 세션에 지시하는 방법
│
├── 00-overview/              Phase 0 · 기획
│   ├── project-charter.md      프로젝트 헌장: 목적, 범위, 이해관계자, 성공 기준
│   └── glossary.md             용어집 (캐디피, 오버피, 원천징수 …)
│
├── 01-requirements/          Phase 1 · 요구사항 (SRS)
│   ├── srs.md                  요구사항 명세서 (FR / NFR)
│   ├── use-cases.md            유스케이스 · 사용자 시나리오
│   └── open-questions.md       미해결 질문 (사용자 확인 필요)
│
├── 02-design/                Phase 2 · 설계
│   ├── architecture.md         시스템 아키텍처 · 기술 스택
│   ├── data-model.md           데이터 모델 · ERD
│   ├── api-spec.md             API 명세
│   └── ui-design.md            화면 목록 · 화면 흐름 · 와이어프레임
│
├── 03-decisions/             결정 기록 (ADR) — 전 단계 공통
│   └── ADR-0001-*.md
│
├── 04-test/                  Phase 4 · 테스트 (구현 단계에서 생성)
│   └── test-plan.md
│
├── 05-sessions/              세션 작업 로그 — 전 단계 공통
│   └── YYYY-MM-DD-주제.md
│
└── templates/                문서 템플릿
    ├── adr.md
    ├── session-log.md
    └── requirement.md
```

## 추적성 매트릭스 (요약)
요구사항이 설계·구현·테스트 어디에 반영됐는지는 `01-requirements/srs.md` 하단의
**추적성 매트릭스** 표에서 관리한다.
