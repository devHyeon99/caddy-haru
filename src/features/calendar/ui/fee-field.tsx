"use client";

import { MoneyInput } from "@/shared/ui/money-input";
import { field, fieldLabel } from "@/shared/ui/field.css";

type FeeFieldProps = {
  label: string;
  value: string;
  onChangeAction: (value: string) => void;
};

export function FeeField({ label, value, onChangeAction }: FeeFieldProps) {
  return (
    <div className={field}>
      <span className={fieldLabel}>{label}</span>
      <MoneyInput
        value={value}
        aria-label={label}
        onChangeAction={onChangeAction}
      />
    </div>
  );
}
