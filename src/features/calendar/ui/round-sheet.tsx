"use client";

import React from "react";
import { X } from "lucide-react";
import { type PaymentMethod } from "@/entities/round";
import { formatWon } from "@/shared/lib/format";
import * as ui from "@/shared/styles/ui.css";
import * as styles from "./round-sheet.css";
import { FeeField } from "./fee-field";

type RoundSheetProps = {
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
  onCloseAction: () => void;
  onSubmitAction: (event: React.SyntheticEvent<HTMLFormElement>) => void;
};

export function RoundSheet({
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
  onCloseAction,
  onSubmitAction,
}: RoundSheetProps) {
  return (
    <div className={styles.overlay} role="presentation">
      <form
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="round-sheet-title"
        aria-busy={isSaving}
        onSubmit={onSubmitAction}
      >
        <div className={styles.sheetHandle} />
        <div className={styles.sheetHeader}>
          <div>
            <div className={ui.eyebrow}>
              {month + 1}월 {selectedDay}일
            </div>
            <h2 id="round-sheet-title" className={ui.sectionTitle}>
              {editingId ? "라운드 수정" : `${pendingRoundNumber}라운드 추가`}
            </h2>
          </div>
          <button
            className={ui.iconButton}
            type="button"
            aria-label="닫기"
            disabled={isSaving}
            onClick={onCloseAction}
          >
            <X size={21} />
          </button>
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
        <button className={ui.addButton} type="submit" disabled={isSaving}>
          {isSaving ? "저장 중" : editingId ? "수정 저장" : "라운드 저장"}
        </button>
      </form>
    </div>
  );
}
