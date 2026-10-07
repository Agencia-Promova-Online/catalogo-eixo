import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink-700 placeholder:text-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

const InputLocked = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <input
        readOnly
        className={cn(
          "flex h-11 w-full rounded-xl border border-gold-200 bg-gold-50 px-4 py-2.5 text-sm text-ink-900 shadow-sm cursor-not-allowed placeholder:text-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:border-transparent",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
InputLocked.displayName = "InputLocked";

export { Input, InputLocked };
