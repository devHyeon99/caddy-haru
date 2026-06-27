"use client";

import { useState } from "react";
import { sumIncome, useRoundEntries } from "@/entities/round";
import { formatWon } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import * as text from "@/shared/ui/text.css";
import * as segmented from "@/shared/ui/segmented.css";
import * as styles from "./statistics-view.css";

type StatisticsTab = "monthly" | "yearly";

type StatisticsViewProps = {
  courseName: string;
  year: number;
  month: number;
};

export function StatisticsView({
  courseName,
  year,
  month,
}: StatisticsViewProps) {
  const [tab, setTab] = useState<StatisticsTab>("monthly");
  const { entries, isLoading, isError, refetch } = useRoundEntries(
    year,
    courseName,
  );

  if (isLoading) {
    return (
      <div className={styles.dataState} role="status">
        수입 기록을 불러오는 중입니다.
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.dataState} role="alert">
        <p>수입 기록을 불러오지 못했습니다.</p>
        <Button variant="outline" onClick={() => void refetch()}>
          다시 시도
        </Button>
      </div>
    );
  }

  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthEntries = entries.filter((e) =>
    e.workDate.startsWith(monthPrefix),
  );
  const yearEntries = entries.filter((e) => e.workDate.startsWith(`${year}-`));
  const activeEntries = tab === "monthly" ? monthEntries : yearEntries;

  const chartData =
    tab === "monthly"
      ? Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) =>
          sumIncome(
            monthEntries.filter((e) => Number(e.workDate.slice(-2)) === i + 1),
          ),
        )
      : Array.from({ length: 12 }, (_, i) => {
          const prefix = `${year}-${String(i + 1).padStart(2, "0")}`;
          return sumIncome(
            entries.filter((e) => e.workDate.startsWith(prefix)),
          );
        });

  const chartMax = Math.max(...chartData, 1);

  return (
    <>
      <div className={text.viewHeader}>
        <h1 className={text.viewTitle}>수입 통계</h1>
        <p className={text.viewDescription}>
          기간별 수입과 라운드 흐름을 확인합니다.
        </p>
      </div>

      <div className={styles.tabList} role="tablist" aria-label="통계 기간">
        {(["monthly", "yearly"] as const).map((item) => (
          <button
            key={item}
            className={`${segmented.segmentButton} ${tab === item ? segmented.selectedSegment : ""}`}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
          >
            {item === "monthly" ? "월간" : "연간"}
          </button>
        ))}
      </div>

      <div className={text.eyebrow}>
        {tab === "monthly" ? `${year}년 ${month + 1}월` : `${year}년`}
      </div>

      <div className={styles.metricGrid}>
        <Metric label="총수입" value={formatWon(sumIncome(activeEntries))} />
        <Metric label="총 라운드" value={`${activeEntries.length}회`} />
        <Metric
          label="캐디피"
          value={formatWon(activeEntries.reduce((s, e) => s + e.caddieFee, 0))}
        />
        <Metric
          label="오버피"
          value={formatWon(activeEntries.reduce((s, e) => s + e.overFee, 0))}
        />
      </div>

      <h2 className={text.sectionTitle}>
        {tab === "monthly" ? "일별 수입" : "월별 수입"}
      </h2>
      <div className={styles.chart} aria-label="수입 막대그래프">
        {chartData.map((value, index) => (
          <div className={styles.barGroup} key={index} title={formatWon(value)}>
            <div className={styles.barTrack}>
              <div
                className={styles.bar}
                style={{
                  height: `${Math.max((value / chartMax) * 100, value ? 3 : 0)}%`,
                }}
              />
            </div>
            {(tab === "yearly" || (index + 1) % 5 === 0) && (
              <span className={styles.barLabel}>
                {index + 1}
                {tab === "yearly" ? "월" : "일"}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metric}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
    </div>
  );
}
