"use client";

import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  getRoundIncome,
  sumIncome,
  useRoundEntries,
  type PaymentMethod,
  type RoundEntry,
} from "@/entities/round";
import { getMonthCells, toDateKey } from "@/shared/lib/calendar";
import {
  formatCompactIncome,
  formatWon,
  parseWonInput,
} from "@/shared/lib/format";
import * as ui from "@/shared/styles/ui.css";
import * as styles from "./calendar-view.css";
import { RoundSheet } from "./round-sheet";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

type CalendarViewProps = {
  courseName: string;
  defaultCaddieFee: number;
  overFeePresets: number[];
  initialDate: string;
};

export function CalendarView({
  courseName,
  defaultCaddieFee,
  overFeePresets,
  initialDate,
}: CalendarViewProps) {
  const initialYear = Number(initialDate.slice(0, 4));
  const initialMonth = Number(initialDate.slice(5, 7)) - 1;
  const initialDay = Number(initialDate.slice(8, 10));

  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [caddieFee, setCaddieFee] = useState(String(defaultCaddieFee));
  const [overFee, setOverFee] = useState(0);
  const [customOverFee, setCustomOverFee] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [memo, setMemo] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  const {
    entries,
    isLoading,
    isError,
    refetch,
    createEntry,
    updateEntry,
    deleteEntry,
    isSaving,
    isDeleting,
  } = useRoundEntries(year, courseName);

  const overFeeOptions = useMemo(
    () => Array.from(new Set([0, ...overFeePresets])),
    [overFeePresets],
  );

  const selectedDateKey = toDateKey(year, month, selectedDay);
  const canAddRound = selectedDateKey <= initialDate;
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthEntries = entries.filter((e) =>
    e.workDate.startsWith(monthPrefix),
  );
  const selectedEntries = entries.filter((e) => e.workDate === selectedDateKey);
  const cells = getMonthCells(year, month);

  const dayTotals = useMemo(() => {
    const totals = new Map<string, number>();
    monthEntries.forEach((entry) => {
      totals.set(
        entry.workDate,
        (totals.get(entry.workDate) ?? 0) + getRoundIncome(entry),
      );
    });
    return totals;
  }, [monthEntries]);

  function changeMonth(offset: number) {
    const next = new Date(year, month + offset, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setSelectedDay(1);
  }

  function openNewRound() {
    if (!canAddRound) return;
    setEditingId(null);
    setCaddieFee(String(defaultCaddieFee));
    setOverFee(0);
    setCustomOverFee("");
    setPaymentMethod("cash");
    setMemo("");
    setFormError(null);
    setSheetOpen(true);
  }

  function openEditRound(entry: RoundEntry) {
    setEditingId(entry.id);
    setCaddieFee(String(entry.caddieFee));
    setOverFee(entry.overFee);
    setCustomOverFee(
      overFeeOptions.includes(entry.overFee) ? "" : String(entry.overFee),
    );
    setPaymentMethod(entry.paymentMethod);
    setMemo(entry.memo ?? "");
    setFormError(null);
    setSheetOpen(true);
  }

  async function saveRound(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setOperationError(null);

    const parsedCaddieFee = parseWonInput(caddieFee);
    const parsedOverFee = customOverFee
      ? parseWonInput(customOverFee)
      : overFee;

    if (parsedCaddieFee > 10_000_000 || parsedOverFee > 10_000_000) {
      setFormError("금액은 각각 1,000만원 이하로 입력해 주세요.");
      return;
    }

    const payload = {
      workDate: selectedDateKey,
      caddieFee: parsedCaddieFee,
      overFee: parsedOverFee,
      paymentMethod,
      memo: memo.trim() || undefined,
    };

    try {
      if (editingId) {
        await updateEntry({ id: editingId, ...payload });
      } else {
        await createEntry(payload);
      }
      setSheetOpen(false);
    } catch {
      setFormError("라운드 기록을 저장하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  async function deleteRound(id: string) {
    if (!window.confirm("이 라운드 기록을 삭제할까요?")) return;
    setOperationError(null);
    try {
      await deleteEntry(id);
    } catch {
      setOperationError(
        "라운드 기록을 삭제하지 못했습니다. 다시 시도해 주세요.",
      );
    }
  }

  const selectedOverFee = customOverFee
    ? parseWonInput(customOverFee)
    : overFee;
  const formTotal = parseWonInput(caddieFee) + selectedOverFee;

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
        <button
          className={styles.retryButton}
          type="button"
          onClick={() => void refetch()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <>
      {operationError && (
        <div className={styles.errorMessage} role="alert">
          {operationError}
        </div>
      )}

      <section className={styles.summary} aria-label="이번 달 요약">
        <div>
          <div className={ui.eyebrow}>이번 달 수입</div>
          <div className={styles.summaryAmount}>
            {formatWon(sumIncome(monthEntries))}
          </div>
          <div className={styles.incomeBreakdown}>
            <span>
              캐디피{" "}
              {formatWon(monthEntries.reduce((sum, e) => sum + e.caddieFee, 0))}
            </span>
            <span className={styles.breakdownDivider}>·</span>
            <span>
              오버피{" "}
              {formatWon(monthEntries.reduce((sum, e) => sum + e.overFee, 0))}
            </span>
          </div>
        </div>
        <div className={styles.roundCount}>
          <div className={styles.roundCountLabel}>근무횟수</div>
          {monthEntries.length}회
        </div>
      </section>

      <div className={styles.monthHeader}>
        <button
          className={ui.iconButton}
          type="button"
          aria-label="이전 달"
          onClick={() => changeMonth(-1)}
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className={styles.monthTitle}>
          {year}년 {month + 1}월
        </h1>
        <button
          className={ui.iconButton}
          type="button"
          aria-label="다음 달"
          onClick={() => changeMonth(1)}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div className={styles.weekdays} aria-hidden="true">
        {weekdays.map((weekday) => (
          <div key={weekday} className={styles.weekday}>
            {weekday}
          </div>
        ))}
      </div>

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
              onClick={() => setSelectedDay(cell.day)}
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

      <section>
        <div className={styles.sectionHeader}>
          <h2 className={ui.sectionTitle}>
            {month + 1}월 {selectedDay}일
          </h2>
          <div className={styles.sectionTotal}>
            {formatWon(sumIncome(selectedEntries))}
          </div>
        </div>

        {selectedEntries.length > 0 ? (
          <div className={styles.roundList}>
            {selectedEntries.map((entry, index) => (
              <div className={styles.roundRow} key={entry.id}>
                <div className={styles.roundMeta}>
                  <div className={styles.roundLabel}>
                    {index + 1}라운드
                    <span className={styles.paymentBadge}>
                      {entry.paymentMethod === "cash" ? "현금" : "계좌이체"}
                    </span>
                  </div>
                  <div className={styles.feeBreakdown}>
                    캐디피 {formatWon(entry.caddieFee)}
                    {entry.overFee > 0 &&
                      ` · 오버피 ${formatWon(entry.overFee)}`}
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
                    onClick={() => openEditRound(entry)}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    className={ui.iconButton}
                    type="button"
                    aria-label={`${index + 1}라운드 삭제`}
                    disabled={isDeleting}
                    onClick={() => deleteRound(entry.id)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>기록된 라운드가 없습니다.</div>
        )}

        <button
          className={ui.addButton}
          type="button"
          disabled={!canAddRound}
          onClick={openNewRound}
        >
          {canAddRound ? (
            <>
              <Plus size={19} />
              라운드 추가
            </>
          ) : (
            "미래 날짜에는 기록할 수 없습니다"
          )}
        </button>
      </section>

      {sheetOpen && (
        <RoundSheet
          month={month}
          selectedDay={selectedDay}
          pendingRoundNumber={selectedEntries.length + 1}
          editingId={editingId}
          caddieFee={caddieFee}
          overFee={overFee}
          customOverFee={customOverFee}
          paymentMethod={paymentMethod}
          memo={memo}
          overFeeOptions={overFeeOptions}
          formError={formError}
          isSaving={isSaving}
          formTotal={formTotal}
          onCaddieFeeChangeAction={setCaddieFee}
          onOverFeeChangeAction={setOverFee}
          onCustomOverFeeChangeAction={setCustomOverFee}
          onPaymentMethodChangeAction={setPaymentMethod}
          onMemoChangeAction={setMemo}
          onCloseAction={() => setSheetOpen(false)}
          onSubmitAction={saveRound}
        />
      )}
    </>
  );
}
