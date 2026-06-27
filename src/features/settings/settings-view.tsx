"use client";

import { LogOut } from "lucide-react";
import { formatWon } from "@/shared/lib/format";
import * as text from "@/shared/ui/text.css";
import { useTheme, type ThemeMode } from "@/shared/theme";
import { signOut } from "./sign-out";
import * as styles from "./settings-view.css";

type SettingsViewProps = {
  courseName: string;
  defaultCaddieFee: number;
};

export function SettingsView({
  courseName,
  defaultCaddieFee,
}: SettingsViewProps) {
  const { mode, setMode } = useTheme();

  const themeLabels: Record<ThemeMode, string> = {
    system: "시스템 설정",
    light: "라이트",
    dark: "다크",
  };

  return (
    <>
      <div className={text.viewHeader}>
        <h1 className={text.viewTitle}>설정</h1>
        <p className={text.viewDescription}>
          소속 정보와 기본 입력값을 관리합니다.
        </p>
      </div>

      <div className={styles.settingsList}>
        <Setting label="소속 골프장" value={courseName} />
        <Setting label="기본 캐디피" value={formatWon(defaultCaddieFee)} />
        <Setting label="오버피 빠른 선택" value="1만 · 2만 · 3만원" />
      </div>

      <h2 className={text.sectionTitle} style={{ marginTop: 28 }}>
        화면 모드
      </h2>
      <div className={styles.themeControls}>
        {(["system", "light", "dark"] as const).map((themeMode) => (
          <button
            key={themeMode}
            className={`${styles.themeButton} ${mode === themeMode ? styles.selectedThemeButton : ""}`}
            type="button"
            onClick={() => setMode(themeMode)}
          >
            {themeLabels[themeMode]}
          </button>
        ))}
      </div>

      <div className={styles.settingsList}>
        <form action={signOut}>
          <button className={styles.settingButton} type="submit">
            <span className={styles.settingLabel}>로그아웃</span>
            <LogOut size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
    </>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.settingRow}>
      <span className={styles.settingLabel}>{label}</span>
      <span className={styles.settingValue}>{value}</span>
    </div>
  );
}
