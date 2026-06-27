import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import * as styles from "./calendar-view.css";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

type MonthNavigatorProps = {
  year: number;
  month: number;
  onChangeMonth: (offset: number) => void;
};

export function MonthNavigator({
  year,
  month,
  onChangeMonth,
}: MonthNavigatorProps) {
  return (
    <>
      <div className={styles.monthHeader}>
        <Button variant="icon" aria-label="이전 달" onClick={() => onChangeMonth(-1)}>
          <ChevronLeft size={22} />
        </Button>
        <h1 className={styles.monthTitle}>
          {year}년 {month + 1}월
        </h1>
        <Button variant="icon" aria-label="다음 달" onClick={() => onChangeMonth(1)}>
          <ChevronRight size={22} />
        </Button>
      </div>

      <div className={styles.weekdays} aria-hidden="true">
        {weekdays.map((weekday) => (
          <div key={weekday} className={styles.weekday}>
            {weekday}
          </div>
        ))}
      </div>
    </>
  );
}
