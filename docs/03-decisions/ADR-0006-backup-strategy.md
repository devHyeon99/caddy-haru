# ADR-0006: 백업 — Neon 즉시 복원(6시간) + GitHub Actions 매일 암호화 pg_dump(90일)

> 상태: 승인 · 날짜: 2026-11-27

## 배경 (Context)
- **NFR-004**(Must): 입력한 데이터는 유실되지 않아야 한다.
- **AC-N004-2**: 데이터 백업 방법이 하나 이상 있다. 구체 방식은 설계에서 정한다.
- **NFR-007**: 0원. ADR-0002의 Neon 계산 한도(월 100 CU-시간)를 지켜야 한다.
- 데이터는 개인 수입 정보다. 포트폴리오 목적상 저장소는 **공개**일 가능성이 높다.

2026-11-27 공식 문서 확인
- Neon 무료 플랜의 즉시 복원(변경 이력) 기간은 **6시간**(최대 1GB)이고, 루트 브랜치에서만 쓸 수 있다. 예전 문서의 1일·24시간은 지금 기준이 아니다.
- GitHub Actions 아티팩트는 공개 저장소에서 최대 90일 보관한다. **읽기 권한이 있는 로그인 사용자는 누구나 받을 수 있다.** 공개 저장소라면 사실상 누구나다.

## 선택지 (Options)
| 선택지 | 장점 | 단점 |
|---|---|---|
| A. Neon 즉시 복원만 | 설정 없음, 0원 | 6시간이 지난 실수나 Neon 계정·프로젝트 사고는 복구 불가 |
| B. GitHub Actions `pg_dump`만 | 90일 보관, Neon 밖에 사본 | 방금 한 실수도 최대 24시간 전으로만 복구. 암호화 필수 |
| **C. A + B** | 짧은 사고는 분 단위로, 긴 사고·계정 사고는 하루 단위로 복구 | 워크플로 1개와 시크릿 관리가 필요 |

## 결정 (Decision)
**C를 채택한다.** (사용자 선택, 2026-11-27)

| 항목 | 값 |
|---|---|
| 1단 | Neon 즉시 복원 (무료 기본값, 6시간) |
| 2단 | `.github/workflows/backup.yml`, 매일 03:00 KST(`0 18 * * *` UTC) + 수동 실행 |
| 덤프 | `pg_dump --format=custom --no-owner --no-privileges`, **direct 연결**(`DIRECT_DATABASE_URL`), Neon과 같은 주 버전 클라이언트(17) |
| 검사 | `pg_restore --list`로 아카이브 확인, 잡 요약에 테이블별 행 수만 기록 |
| 암호화 | **age** 공개키(`BACKUP_AGE_RECIPIENT`)로 암호화. 복호화 개인키는 사용자의 비밀번호 관리자에만 보관하고 GitHub에는 두지 않음 |
| 보관 | `actions/upload-artifact`, `retention-days: 90` |
| 복원 연습 | 실사용 시작 전 1회, 이후 분기마다 1회. 결과를 세션 로그에 기록(AC-N004-2 증거) |

절차와 다이어그램: `docs/02-design/architecture.md` §9.

**비용 계산 (AC-N007-1 보완)**
- 백업 1회에 Neon이 깨어 있는 시간을 덤프 수 초 + 자동 잠듦 대기 5분으로 잡는다. 0.25 CU × (5/60)시간 × 30일 ≈ **월 0.6 CU-시간**(한도 100의 1% 미만). ADR-0002 예상치 19 CU-시간과 합쳐도 약 20%.
- GitHub Actions 실행 시간·아티팩트 저장은 공개 저장소에서 무료다. 비공개로 바꾸더라도 월 2,000분 무료 안이다(1회 약 1분 × 30).

## 근거 / 결과 (Consequences)
**좋은 점**
- 가장 흔한 사고(방금 잘못 지움·잘못된 마이그레이션)는 Neon으로 몇 분 안에 되돌린다.
- Neon 밖에 90일치 사본이 있어서, Neon 사고가 나거나 다른 DB로 옮길 때도 데이터가 남는다.
- 개인키가 GitHub 밖에만 있으므로, 공개 저장소이거나 워크플로가 털려도 백업 내용을 읽을 수 없다.
- 백업 자동화, 암호화, 복원 연습은 포트폴리오에 쓸 만한 운영 경험이다.

**감수할 점**
- 2단의 복구 시점은 최대 24시간 전이다(6시간~24시간 사이 입력은 유실 가능).
- **개인키를 잃어버리면 2단 백업은 복구할 수 없다.** 비밀번호 관리자와 오프라인 사본 두 곳에 보관한다.
- 공개 저장소는 60일 동안 활동이 없으면 예약 워크플로가 자동으로 꺼진다. 경고 메일을 받으면 다시 켠다.
- 백업 실패 알림은 GitHub 메일에 의존한다.

**다시 검토할 조건**
- Neon 무료 플랜의 복원 기간이 바뀌거나, 데이터가 커져 덤프가 오래 걸리거나, 저장소 공개 여부가 바뀔 때.

## 참고 자료 (2026-11-27 확인)
- Neon: [History window](https://neon.com/docs/postgres/backup-restore/history-window), [Branch reset and restore](https://neon.tech/docs/introduction/point-in-time-restore)
- GitHub: [Download workflow artifacts](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts), [Storing workflow data as artifacts](https://docs.github.com/en/actions/guides/storing-workflow-data-as-artifacts), [Artifact retention](https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization)

## 변경 이력
- 2026-11-27 작성·승인 (사용자 선택: 둘 다)
