"use client";

import * as styles from "./money-input.css";

type MoneyInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode"
> & {
  value: string;
  onChangeAction: (value: string) => void;
};

export function MoneyInput({
  value,
  onChangeAction,
  ...props
}: MoneyInputProps) {
  return (
    <div className={styles.wrapper}>
      <input
        {...props}
        className={styles.input}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChangeAction(e.target.value)}
      />
      <span className={styles.suffix}>만원</span>
    </div>
  );
}
