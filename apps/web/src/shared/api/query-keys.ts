// 쿼리 키는 이 파일에서만 만든다 — ADR-0009, ui-design §1.4
// month: 'YYYY-MM', date: 'YYYY-MM-DD'

export const queryKeys = {
  golfClubs: () => ['golfClubs'] as const,
  roundsByMonth: (month: string) => ['rounds', { month }] as const,
  roundsByDate: (date: string) => ['rounds', { date }] as const,
  monthlyStats: (month: string) => ['stats', 'monthly', { month }] as const,
};

/**
 * 라운드 저장·수정·삭제 뒤 무효화할 키 — AC-001-1, AC-003-1·4
 * 그 달의 E1·D1(month)과 그날의 D1(date)
 */
export function keysToInvalidateAfterRoundChange(playedOn: string) {
  const month = playedOn.slice(0, 7);
  return [
    queryKeys.roundsByMonth(month),
    queryKeys.roundsByDate(playedOn),
    queryKeys.monthlyStats(month),
  ];
}
