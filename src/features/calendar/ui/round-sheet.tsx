"use client";

import React from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { type PaymentMethod } from "@/entities/round";
import { formatWon } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import * as ui from "@/shared/styles/ui.css";
import * as styles from "./round-sheet.css";
import { FeeField } from "./fee-field";

type RoundSheetProps = {
  open: boolean;
  month: number;
  selectedDay: number;
  pendingRoundNumber: number;
  editingId: string | null;
  caddieFee: string;
  overFee: string;
  nineFee: string;
  paymentMethod: PaymentMethod;
  memo: string;
  formError: string | null;
  isSaving: boolean;
  formTotal: number;
  onCaddieFeeChangeAction: (value: string) => void;
  onOverFeeChangeAction: (value: string) => void;
  onNineFeeChangeAction: (value: string) => void;
  onPaymentMethodChangeAction: (method: PaymentMethod) => void;
  onMemoChangeAction: (value: string) => void;
  onOpenChangeAction: (open: boolean) => void;
  onSubmitAction: (event: React.SyntheticEvent<HTMLFormElement>) => void;
};

export function RoundSheet({
  open,
  month,
  selectedDay,
  pendingRoundNumber,
  editingId,
  caddieFee,
  overFee,
  nineFee,
  paymentMethod,
  memo,
  formError,
  isSaving,
  formTotal,
  onCaddieFeeChangeAction,
  onOverFeeChangeAction,
  onNineFeeChangeAction,
  onPaymentMethodChangeAction,
  onMemoChangeAction,
  onOpenChangeAction,
  onSubmitAction,
}: RoundSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChangeAction}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={styles.sheet}
          aria-busy={isSaving}
          aria-describedby={undefined}
          // 입력 중 바깥 클릭으로 실수 닫힘 방지: 저장 중에는 닫힘을 막는다
          onInteractOutside={(event) => {
            if (isSaving) event.preventDefault();
          }}
          asChild
        >
          <form onSubmit={onSubmitAction}>
            <div className={styles.sheetHandle} />
            <div className={styles.sheetHeader}>
              <div>
                <div className={ui.eyebrow}>
                  {month + 1}월 {selectedDay}일
                </div>
                <Dialog.Title className={ui.sectionTitle}>
                  {editingId
                    ? "라운드 수정"
                    : `${pendingRoundNumber}라운드 추가`}
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <Button variant="icon" aria-label="닫기" disabled={isSaving}>
                  <X size={21} />
                </Button>
              </Dialog.Close>
            </div>

            <FeeField
              label="캐디피"
              value={caddieFee}
              onChangeAction={onCaddieFeeChangeAction}
            />

            <FeeField
              label="오버피"
              value={overFee}
              onChangeAction={onOverFeeChangeAction}
            />

            <FeeField
              label="나인 추가"
              value={nineFee}
              onChangeAction={onNineFeeChangeAction}
            />

            <div className={styles.field}>
              <span className={styles.fieldLabel}>결제 수단</span>
              <div className={styles.segment}>
                {(["cash", "transfer"] as const).map((method) => (
                  <button
                    key={method}
                    className={`${ui.segmentButton} ${
                      paymentMethod === method ? ui.selectedSegment : ""
                    }`}
                    type="button"
                    onClick={() => onPaymentMethodChangeAction(method)}
                  >
                    {method === "cash" ? "현금" : "계좌이체"}
                  </button>
                ))}
              </div>
            </div>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>메모 (선택)</span>
              <textarea
                className={styles.textarea}
                value={memo}
                maxLength={200}
                onChange={(e) => onMemoChangeAction(e.target.value)}
                placeholder="필요한 내용을 남겨주세요"
              />
            </label>

            <div className={styles.sheetTotal}>
              <span>라운드 합계</span>
              <strong className={styles.sheetTotalAmount}>
                {formatWon(formTotal)}
              </strong>
            </div>
            {formError && (
              <p className={styles.formError} role="alert">
                {formError}
              </p>
            )}
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "저장 중" : editingId ? "수정 저장" : "라운드 저장"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
