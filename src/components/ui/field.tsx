import { InputHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Field({ label, id, className, ...props }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className={clsx(
          "rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700",
          className
        )}
        {...props}
      />
    </div>
  );
}
