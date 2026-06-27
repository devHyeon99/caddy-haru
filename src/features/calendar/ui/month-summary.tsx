import { sumIncome, countNineRounds, type RoundEntry } from "@/entities/round";
import { formatWon } from "@/shared/lib/format";
import * as text from "@/shared/ui/text.css";
import * as styles from "./calendar-view.css";

type MonthSummaryProps = {
  monthEntries: RoundEntry[];
};

export function MonthSummary({ monthEntries }: MonthSummaryProps) {
  const totalCaddieFee = monthEntries.reduce(
    (sum, e) => sum + e.caddieFee + e.nineFee,
    0,
  );
  const totalOverFee = monthEntries.reduce((sum, e) => sum + e.overFee, 0);

  return (
    <section className={styles.summary} aria-label="이번 달 요약">
      <div>
        <div className={text.eyebrow}>이번 달 수입</div>
        <div className={styles.summaryAmount}>
          {formatWon(sumIncome(monthEntries))}
        </div>
        <ul className={styles.incomeBreakdown}>
          <li>캐디피 {formatWon(totalCaddieFee)}</li>
          <li>오버피 {formatWon(totalOverFee)}</li>
        </ul>
      </div>
      <div className={styles.roundCount}>
        <dl style={{ margin: 0 }}>
          <dt className={styles.roundCountLabel}>근무횟수</dt>
          <dd>{monthEntries.length}회</dd>
        </dl>
        {countNineRounds(monthEntries) > 0 && (
          <dl style={{ margin: 0 }}>
            <dt className={styles.roundCountLabel}>나인추가</dt>
            <dd>{countNineRounds(monthEntries)}회</dd>
          </dl>
        )}
      </div>
    </section>
  );
}
