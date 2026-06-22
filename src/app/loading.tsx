import * as styles from "./loading.css";

export default function Loading() {
  return (
    <div className={styles.screen} role="status" aria-live="polite">
      <div className={styles.logo}>
        <span className={styles.mark} aria-hidden="true">
          <span className={styles.markHat} />
          <span className={styles.markHead} />
          <span className={styles.markBody} />
        </span>
      </div>

      <div className={styles.textGroup}>
        <span className={styles.brandName}>캐디하루</span>
        <span className={styles.caption}>페이지 로딩중...</span>
      </div>

      <div className={styles.dots} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );
}
