import * as styles from "./top-bar.css";

type TopBarProps = {
  courseName: string;
};

export function TopBar({ courseName }: TopBarProps) {
  return (
    <header className={styles.topBar}>
      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true">
          <span className={styles.brandHat} />
          <span className={styles.brandHead} />
          <span className={styles.brandBody} />
        </span>
        <div>
          <div className={styles.brandName}>캐디하루</div>
          <div className={styles.courseName}>{courseName}</div>
        </div>
      </div>
    </header>
  );
}
