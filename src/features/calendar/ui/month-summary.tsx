import { sumIncome, countNineRounds, type RoundEntry } from "@/entities/round";
import { formatWon, formatCompactIncome } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import * as text from "@/shared/ui/text.css";
import * as styles from "./month-summary.css";

type MonthSummaryProps = {
  monthEntries: RoundEntry[];
  prevMonthEntries: RoundEntry[];
};

export function MonthSummary({
  monthEntries,
  prevMonthEntries,
}: MonthSummaryProps) {
  const totalCaddieFee = monthEntries.reduce(
    (sum, e) => sum + e.caddieFee + e.nineFee,
    0,
  );
  const totalOverFee = monthEntries.reduce((sum, e) => sum + e.overFee, 0);

  const thisIncome = sumIncome(monthEntries);
  const prevIncome = sumIncome(prevMonthEntries);
  const diff = thisIncome - prevIncome;

  const workDays = new Set(monthEntries.map((e) => e.workDate)).size;
  const dailyAvg = workDays > 0 ? Math.round(thisIncome / workDays) : 0;

  const nineCount = countNineRounds(monthEntries);

  return (
    <section className={styles.summary} aria-label="이번 달 요약">
      <div>
        <div className={text.eyebrow}>이번 달 수입</div>
        <div className={styles.summaryAmountRow}>
          <div className={styles.summaryAmount}>{formatWon(thisIncome)}</div>
          {prevMonthEntries.length > 0 && (
            <Badge
              variant={diff > 0 ? "success" : diff < 0 ? "error" : "default"}
            >
              {diff > 0
                ? `지난달보다 ${formatCompactIncome(diff)} 원 더 벌었어요`
                : diff < 0
                  ? `지난달보다 ${formatCompactIncome(Math.abs(diff))} 원 덜 벌었어요`
                  : "지난달과 같아요"}
            </Badge>
          )}
        </div>
        <ul className={styles.incomeBreakdown}>
          <li>캐디피 {formatWon(totalCaddieFee)}</li>
          <li>오버피 {formatWon(totalOverFee)}</li>
        </ul>
      </div>
      <div className={styles.roundCount}>
        <dl className={styles.roundStat}>
          <dt className={styles.roundCountLabel}>근무 횟수</dt>
          <dd>{monthEntries.length}회</dd>
        </dl>
        {nineCount > 0 && (
          <dl className={styles.roundStat}>
            <dt className={styles.roundCountLabel}>나인 추가</dt>
            <dd>{nineCount}회</dd>
          </dl>
        )}
        {workDays > 0 && (
          <dl className={styles.roundStat}>
            <dt className={styles.roundCountLabel}>일평균 수입</dt>
            <dd>{formatWon(dailyAvg)}</dd>
          </dl>
        )}
      </div>
    </section>
  );
}
