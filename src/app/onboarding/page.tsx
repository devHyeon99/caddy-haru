import { redirect } from "next/navigation";
import { OnboardingForm } from "@/features/onboarding";
import * as styles from "@/shared/styles/auth-shell.css";
import { createClient } from "@/shared/api/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (profile) {
    redirect("/");
  }

  return (
    <main className={styles.page}>
      <section className={styles.onboardingPanel}>
        <div className={styles.onboardingContent}>
          <div className={`${styles.brand} ${styles.onboardingBrand}`}>
            <div className={styles.brandName}>캐디하루</div>
          </div>
          <h1 className={styles.title}>기본 정보를 알려주세요</h1>
          <p
            className={`${styles.description} ${styles.onboardingDescription}`}
          >
            한 번 설정하면 매일 더 빠르게 수입을 기록할 수 있습니다.
          </p>
          <OnboardingForm />
        </div>
      </section>
    </main>
  );
}
