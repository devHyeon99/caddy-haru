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
        <div className={styles.incomeBreakdown}>
          <span>캐디피 {formatWon(totalCaddieFee)}</span>
          <span className={styles.breakdownDivider}>·</span>
          <span>오버피 {formatWon(totalOverFee)}</span>
        </div>
      </div>
      <div className={styles.roundCount}>
        <div className={styles.roundCountLabel}>근무횟수</div>
        {monthEntries.length}회
      </div>
    </section>
  );
}
