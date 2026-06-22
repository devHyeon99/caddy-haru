"use client";

import React, { useState } from "react";
import { type PaymentMethod, type RoundEntry } from "@/entities/round";
import { parseWonInput } from "@/shared/lib/format";

type RoundPayload = {
  workDate: string;
  caddieFee: number;
  overFee: number;
  paymentMethod: PaymentMethod;
  memo?: string;
};

type UseRoundFormOptions = {
  defaultCaddieFee: number;
  overFeeOptions: number[];
  selectedDateKey: string;
  createEntryAction: (payload: RoundPayload) => Promise<unknown>;
  updateEntryAction: (
    payload: RoundPayload & { id: string },
  ) => Promise<unknown>;
  deleteEntryAction: (id: string) => Promise<unknown>;
};

export function useRoundForm({
  defaultCaddieFee,
  overFeeOptions,
  selectedDateKey,
  createEntryAction,
  updateEntryAction,
  deleteEntryAction,
}: UseRoundFormOptions) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [caddieFee, setCaddieFee] = useState(String(defaultCaddieFee));
  const [overFee, setOverFee] = useState(0);
  const [customOverFee, setCustomOverFee] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [memo, setMemo] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  const selectedOverFee = customOverFee
    ? parseWonInput(customOverFee)
    : overFee;
  const formTotal = parseWonInput(caddieFee) + selectedOverFee;

  function openNew() {
    setEditingId(null);
    setCaddieFee(String(defaultCaddieFee));
    setOverFee(0);
    setCustomOverFee("");
    setPaymentMethod("cash");
    setMemo("");
    setFormError(null);
    setSheetOpen(true);
  }

  function openEdit(entry: RoundEntry) {
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

  async function save(event: React.SyntheticEvent<HTMLFormElement>) {
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

    const payload: RoundPayload = {
      workDate: selectedDateKey,
      caddieFee: parsedCaddieFee,
      overFee: parsedOverFee,
      paymentMethod,
      memo: memo.trim() || undefined,
    };

    try {
      if (editingId) {
        await updateEntryAction({ id: editingId, ...payload });
      } else {
        await createEntryAction(payload);
      }
      setSheetOpen(false);
    } catch {
      setFormError("라운드 기록을 저장하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("이 라운드 기록을 삭제할까요?")) return;
    setOperationError(null);
    try {
      await deleteEntryAction(id);
    } catch {
      setOperationError(
        "라운드 기록을 삭제하지 못했습니다. 다시 시도해 주세요.",
      );
    }
  }

  return {
    sheetOpen,
    editingId,
    caddieFee,
    overFee,
    customOverFee,
    paymentMethod,
    memo,
    formError,
    operationError,
    formTotal,
    openNew,
    openEdit,
    save,
    remove,
    setSheetOpen,
    setCaddieFee,
    setOverFee,
    setCustomOverFee,
    setPaymentMethod,
    setMemo,
  };
}
