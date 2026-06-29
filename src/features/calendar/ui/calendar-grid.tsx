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
      {cells.map((cell, index) => {
        if (!cell) {
          return <div key={`empty-${index}`} className={styles.emptyDayCell} />;
        }

        const weekday = index % 7;
        const total = dayTotals.get(cell.dateKey) ?? 0;
        const isSelected = cell.day === selectedDay;

        const cellClassName = [
          styles.dayCell,
          total > 0 && !isSelected ? styles.incomeDay : "",
          isSelected ? styles.selectedDay : "",
        ]
          .filter(Boolean)
          .join(" ");

        const numberClassName = [
          styles.dayNumber,
          weekday === 0 ? styles.sundayNumber : "",
          weekday === 6 ? styles.saturdayNumber : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={cell.dateKey}
            className={cellClassName}
            type="button"
            aria-label={`${month + 1}월 ${cell.day}일${
              total ? `, ${formatWon(total)}` : ""
            }`}
            onClick={() => onSelectDay(cell.day)}
          >
            <span className={numberClassName}>{cell.day}</span>
            <span className={styles.dayAmount}>
              {formatCompactIncome(total)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
