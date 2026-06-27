import * as styles from "./button.css";

type ButtonVariant = "primary" | "outline" | "icon";

const variantClass: Record<ButtonVariant, string> = {
  primary: styles.primary,
  outline: styles.outline,
  icon: styles.icon,
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={[variantClass[variant], className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
