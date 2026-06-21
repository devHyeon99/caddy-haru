"use client";

import { useActionState } from "react";
import {
  createProfile,
  type OnboardingActionState,
} from "@/app/onboarding/actions";
import * as styles from "@/features/auth/auth-shell.css";

const initialState: OnboardingActionState = { error: null };

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    createProfile,
    initialState,
  );

  return (
    <form action={formAction}>
      <label className={styles.field}>
        <span className={styles.label}>소속 골프장</span>
        <input
          className={styles.input}
          name="courseName"
          type="text"
          maxLength={100}
          autoComplete="organization"
          placeholder="골프장 이름"
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>기본 캐디피</span>
        <input
          className={styles.input}
          name="defaultCaddieFee"
          type="text"
          inputMode="numeric"
          defaultValue="150000"
          aria-describedby="fee-description"
          required
        />
        <span id="fee-description" className={styles.helpText}>
          라운드 추가 시 기본으로 입력됩니다.
        </span>
      </label>
      {state.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}
      <button className={styles.primaryButton} type="submit" disabled={pending}>
        {pending ? "저장 중" : "시작하기"}
      </button>
    </form>
  );
}
