import * as styles from "./badge.css";

type BadgeVariant = keyof typeof styles.variant;

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
};

export function Badge({ variant = "default", children }: BadgeProps) {
  return <span className={styles.variant[variant]}>{children}</span>;
}
