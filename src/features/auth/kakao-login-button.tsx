"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/shared/api/supabase/client";
import * as styles from "@/shared/styles/auth-shell.css";

export function KakaoLoginButton() {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signIn() {
    setIsPending(true);
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage(
        "카카오 로그인을 시작하지 못했습니다. 다시 시도해 주세요.",
      );
      setIsPending(false);
    }
  }

  return (
    <>
      <button
        className={styles.kakaoButton}
        type="button"
        disabled={isPending}
        onClick={signIn}
      >
        <MessageCircle size={20} fill="currentColor" aria-hidden="true" />
        {isPending ? "카카오로 이동 중..." : "카카오로 시작하기"}
      </button>
      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
    </>
  );
}
