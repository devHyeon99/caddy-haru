import { Pencil, Plus, Trash2 } from "lucide-react";
import { sumIncome, type RoundEntry } from "@/entities/round";
import { formatWon } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import * as text from "@/shared/ui/text.css";
import * as styles from "./day-round-list.css";

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
        <h2 id={headingId} className={text.sectionTitle}>
          {month + 1}월 {selectedDay}일
        </h2>
        <p className={styles.sectionTotal}>
          {formatWon(sumIncome(selectedEntries))}
        </p>
      </div>

      {selectedEntries.length > 0 ? (
        <ol className={styles.roundList}>
          {selectedEntries.map((entry, index) => (
            <li className={styles.roundCard} key={entry.id}>
              {/* 행 1: 라운드 번호 · 뱃지 · 액션 버튼 */}
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <span className={styles.roundLabel}>{index + 1}라운드</span>
                  <Badge
                    variant={
                      entry.paymentMethod === "cash" ? "cash" : "transfer"
                    }
                  >
                    {entry.paymentMethod === "cash" ? "현금" : "계좌이체"}
                  </Badge>
                  {entry.nineFee > 0 && <Badge variant="nine">나인추가</Badge>}
                </div>
                <Button
                  variant="icon"
                  aria-label={`${index + 1}라운드 수정`}
                  disabled={isDeleting}
                  onClick={() => onEditRound(entry)}
                >
                  <Pencil size={15} aria-hidden="true" />
                </Button>
                <Button
                  variant="icon"
                  aria-label={`${index + 1}라운드 삭제`}
                  disabled={isDeleting}
                  onClick={() => onDeleteRound(entry.id)}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </Button>
              </div>

              {/* 행 2: 피 내역 */}
              <div className={styles.feeBreakdown}>
                <span>캐디피 {formatWon(entry.caddieFee + entry.nineFee)}</span>
                {entry.overFee > 0 && (
                  <span>오버피 {formatWon(entry.overFee)}</span>
                )}
              </div>

              {/* 행 3: 메모 (있을 때만) */}
              {entry.memo && <p className={styles.roundMemo}>{entry.memo}</p>}

              {/* 행 4: 합계 */}
              <div className={styles.cardFooter}>
                <span className={styles.incomeLabel}>합계</span>
                <span className={styles.roundIncome}>
                  {formatWon(entry.caddieFee + entry.nineFee + entry.overFee)}
                </span>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.emptyState}>기록된 라운드가 없습니다.</p>
      )}

      <Button disabled={!canAddRound} onClick={onAddRound}>
        {canAddRound ? (
          <>
            <Plus size={19} aria-hidden="true" />
            라운드 추가
          </>
        ) : (
          "미래 날짜에는 기록할 수 없습니다"
        )}
      </Button>
    </section>
  );
}
