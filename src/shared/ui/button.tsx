import { button, type ButtonVariants } from "./button.css";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariants["variant"];
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[button({ variant }), className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
