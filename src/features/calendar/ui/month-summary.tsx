import { sumIncome, type RoundEntry } from "@/entities/round";
import { formatWon } from "@/shared/lib/format";
import * as ui from "@/shared/styles/ui.css";
import * as styles from "./calendar-view.css";

type MonthSummaryProps = {
  monthEntries: RoundEntry[];
};

export function MonthSummary({ monthEntries }: MonthSummaryProps) {
  const totalCaddieFee = monthEntries.reduce((sum, e) => sum + e.caddieFee, 0);
  const totalOverFee = monthEntries.reduce((sum, e) => sum + e.overFee, 0);

  return (
    <section className={styles.summary} aria-label="이번 달 요약">
      <div>
        <div className={ui.eyebrow}>이번 달 수입</div>
        <div className={styles.summaryAmount}>
          {formatWon(sumIncome(monthEntries))}
        </div>
        <ul className={styles.incomeBreakdown}>
          <li>캐디피 {formatWon(totalCaddieFee)}</li>
          <li>오버피 {formatWon(totalOverFee)}</li>
        </ul>
      </div>
      <dl className={styles.roundCount}>
        <dt className={styles.roundCountLabel}>근무횟수</dt>
        <dd>{monthEntries.length}회</dd>
      </dl>
    </section>
  );
}
