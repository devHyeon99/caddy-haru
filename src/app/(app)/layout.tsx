import { getProfile } from "@/shared/api/profile";
import { BottomNav } from "./_components/bottom-nav";
import { TopBar } from "./_components/top-bar";
import * as styles from "./layout.css";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <div className={styles.app}>
      <main className={styles.shell}>
        <TopBar courseName={profile.courseName} />
        <div className={styles.content}>{children}</div>
        <BottomNav />
      </main>
    </div>
  );
}
