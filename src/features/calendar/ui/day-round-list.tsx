import { Pencil, Plus, Trash2 } from "lucide-react";
import { sumIncome, type RoundEntry } from "@/entities/round";
import { formatWon } from "@/shared/lib/format";
import * as ui from "@/shared/styles/ui.css";
import * as styles from "./calendar-view.css";

type DayRoundListProps = {
  month: number;
  selectedDay: number;
  selectedEntries: RoundEntry[];
  canAddRound: boolean;
  isDeleting: boolean;
  onAddRound: () => void;
  onEditRound: (entry: RoundEntry) => void;
  onDeleteRound: (id: string) => void;
};

export function DayRoundList({
  month,
  selectedDay,
  selectedEntries,
  canAddRound,
  isDeleting,
  onAddRound,
  onEditRound,
  onDeleteRound,
}: DayRoundListProps) {
  const headingId = `day-round-heading-${month}-${selectedDay}`;

  return (
    <section aria-labelledby={headingId}>
      <div className={styles.sectionHeader}>
        <h2 id={headingId} className={ui.sectionTitle}>
          {month + 1}월 {selectedDay}일
        </h2>
        <p className={styles.sectionTotal}>
          {formatWon(sumIncome(selectedEntries))}
        </p>
      </div>

      {selectedEntries.length > 0 ? (
        <ol className={styles.roundList}>
          {selectedEntries.map((entry, index) => (
            <li className={styles.roundRow} key={entry.id}>
              <div className={styles.roundMeta}>
                <div className={styles.roundLabel}>
                  {index + 1}라운드
                  <span className={styles.paymentBadge}>
                    {entry.paymentMethod === "cash" ? "현금" : "계좌이체"}
                  </span>
                </div>
                <div className={styles.feeBreakdown}>
                  <span>캐디피 {formatWon(entry.caddieFee)}</span>
                  {entry.overFee > 0 && (
                    <span>오버피 {formatWon(entry.overFee)}</span>
                  )}
                </div>
              </div>
              <div className={styles.roundIncome}>
                {formatWon(entry.caddieFee + entry.overFee)}
              </div>
              <div className={styles.rowActions}>
                <button
                  className={ui.iconButton}
                  type="button"
                  aria-label={`${index + 1}라운드 수정`}
                  disabled={isDeleting}
                  onClick={() => onEditRound(entry)}
                >
                  <Pencil size={17} aria-hidden="true" />
                </button>
                <button
                  className={ui.iconButton}
                  type="button"
                  aria-label={`${index + 1}라운드 삭제`}
                  disabled={isDeleting}
                  onClick={() => onDeleteRound(entry.id)}
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.emptyState}>기록된 라운드가 없습니다.</p>
      )}

      <button
        className={ui.addButton}
        type="button"
        disabled={!canAddRound}
        onClick={onAddRound}
      >
        {canAddRound ? (
          <>
            <Plus size={19} aria-hidden="true" />
            라운드 추가
          </>
        ) : (
          "미래 날짜에는 기록할 수 없습니다"
        )}
      </button>
    </section>
  );
}
