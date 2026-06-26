"use client";

import { MoneyInput } from "@/shared/ui/money-input";
import * as styles from "./fee-field.css";

type FeeFieldProps = {
  label: string;
  value: string;
  onChangeAction: (value: string) => void;
};

export function FeeField({ label, value, onChangeAction }: FeeFieldProps) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <MoneyInput value={value} ariaLabel={label} onChangeAction={onChangeAction} />
    </div>
  );
}
