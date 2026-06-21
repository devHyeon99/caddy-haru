import { redirect } from "next/navigation";
import { AppIntroCarousel } from "@/features/auth/app-intro-carousel";
import { KakaoLoginButton } from "@/features/auth/kakao-login-button";
import { createClient } from "@/shared/api/supabase/server";
import * as styles from "@/features/auth/auth-shell.css";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims?.sub) {
    redirect("/");
  }

  const { error } = await searchParams;

  return (
    <main className={styles.page}>
      <section className={styles.loginPanel}>
        <div className={styles.brand}>
          <div className={styles.brandName}>캐디하루</div>
          <p className={styles.description}>
            수입을 기록하고 일별·월별·연간 흐름을 확인해보세요
          </p>
        </div>
        <AppIntroCarousel />
        <div className={styles.loginFooter}>
          <div className={styles.loginAction}>
            <KakaoLoginButton />
            {error && (
              <p className={styles.error} role="alert">
                로그인 처리 중 문제가 발생했습니다. 다시 시도해 주세요.
              </p>
            )}
          </div>
          <p className={styles.footnote}>
            로그인시 캐디하루 이용약관과 개인정보처리방침에 동의하게 됩니다.
          </p>
        </div>
      </section>
    </main>
  );
}
