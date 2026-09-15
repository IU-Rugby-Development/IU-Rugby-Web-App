import { ButtonHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-red-700 text-white hover:bg-red-800",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  danger: "bg-red-100 text-red-800 hover:bg-red-200",
};

export function Button({
  variant = "primary",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}
