"use client";

import * as styles from "./money-input.css";

type MoneyInputProps = {
  value: string;
  placeholder?: string;
  ariaLabel?: string;
  onChangeAction: (value: string) => void;
};

export function MoneyInput({
  value,
  placeholder,
  ariaLabel,
  onChangeAction,
}: MoneyInputProps) {
  return (
    <div className={styles.wrapper}>
      <input
        className={styles.input}
        type="text"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(e) => onChangeAction(e.target.value)}
      />
      <span className={styles.suffix}>만원</span>
    </div>
  );
}
