import { badge, type BadgeVariants } from "./badge.css";

type BadgeProps = {
  variant?: BadgeVariants["variant"];
  children: React.ReactNode;
};

export function Badge({ variant, children }: BadgeProps) {
  return <span className={badge({ variant })}>{children}</span>;
}
