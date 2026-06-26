"use client";

import { useMemo, useState } from "react";
import { getRoundIncome, useRoundEntries } from "@/entities/round";
import { getMonthCells, toDateKey } from "@/shared/lib/calendar";
import * as styles from "./calendar-view.css";
import { CalendarGrid } from "./calendar-grid";
import { DayRoundList } from "./day-round-list";
import { MonthNavigator } from "./month-navigator";
import { MonthSummary } from "./month-summary";
import { RoundSheet } from "./round-sheet";
import { useRoundForm } from "../model/use-round-form";

type CalendarViewProps = {
  courseName: string;
  defaultCaddieFee: number;
  initialDate: string;
};

export function CalendarView({
  courseName,
  defaultCaddieFee,
  initialDate,
}: CalendarViewProps) {
  const initialYear = Number(initialDate.slice(0, 4));
  const initialMonth = Number(initialDate.slice(5, 7)) - 1;
  const initialDay = Number(initialDate.slice(8, 10));

  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState(initialDay);

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

  const form = useRoundForm({
    defaultCaddieFee,
    selectedDateKey,
    createEntryAction: createEntry,
    updateEntryAction: updateEntry,
    deleteEntryAction: deleteEntry,
  });

  function changeMonth(offset: number) {
    const next = new Date(year, month + offset, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setSelectedDay(1);
  }

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
      {form.operationError && (
        <div className={styles.errorMessage} role="alert">
          {form.operationError}
        </div>
      )}

      <MonthSummary monthEntries={monthEntries} />

      <MonthNavigator year={year} month={month} onChangeMonth={changeMonth} />

      <CalendarGrid
        cells={cells}
        month={month}
        selectedDay={selectedDay}
        dayTotals={dayTotals}
        onSelectDay={setSelectedDay}
      />

      <DayRoundList
        month={month}
        selectedDay={selectedDay}
        selectedEntries={selectedEntries}
        canAddRound={canAddRound}
        isDeleting={isDeleting}
        onAddRound={form.openNew}
        onEditRound={form.openEdit}
        onDeleteRound={form.remove}
      />

      {form.sheetOpen && (
        <RoundSheet
          month={month}
          selectedDay={selectedDay}
          pendingRoundNumber={selectedEntries.length + 1}
          editingId={form.editingId}
          caddieFee={form.caddieFee}
          overFee={form.overFee}
          nineFee={form.nineFee}
          paymentMethod={form.paymentMethod}
          memo={form.memo}
          formError={form.formError}
          isSaving={isSaving}
          formTotal={form.formTotal}
          onCaddieFeeChangeAction={form.setCaddieFee}
          onOverFeeChangeAction={form.setOverFee}
          onNineFeeChangeAction={form.setNineFee}
          onPaymentMethodChangeAction={form.setPaymentMethod}
          onMemoChangeAction={form.setMemo}
          onCloseAction={() => form.setSheetOpen(false)}
          onSubmitAction={form.save}
        />
      )}
    </>
  );
}
