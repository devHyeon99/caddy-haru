import { formatCompactIncome, formatWon } from "@/shared/lib/format";
import * as styles from "./calendar-view.css";

type CalendarCell = { dateKey: string; day: number } | null;

type CalendarGridProps = {
  cells: CalendarCell[];
  month: number;
  selectedDay: number;
  dayTotals: Map<string, number>;
  onSelectDay: (day: number) => void;
};

export function CalendarGrid({
  cells,
  month,
  selectedDay,
  dayTotals,
  onSelectDay,
}: CalendarGridProps) {
  return (
    <div className={styles.calendarGrid}>
      {cells.map((cell, index) =>
        cell ? (
          <button
            key={cell.dateKey}
            className={`${styles.dayCell} ${cell.day === selectedDay ? styles.selectedDay : ""}`}
            type="button"
            aria-label={`${month + 1}월 ${cell.day}일${
              dayTotals.get(cell.dateKey)
                ? `, ${formatWon(dayTotals.get(cell.dateKey) ?? 0)}`
                : ""
            }`}
            onClick={() => onSelectDay(cell.day)}
          >
            <span className={styles.dayNumber}>{cell.day}</span>
            <span className={styles.dayAmount}>
              {formatCompactIncome(dayTotals.get(cell.dateKey) ?? 0)}
            </span>
          </button>
        ) : (
          <div key={`empty-${index}`} className={styles.emptyDayCell} />
        ),
      )}
    </div>
  );
}
