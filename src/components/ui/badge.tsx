import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "badge-base",
  {
    variants: {
      variant: {
        default: "badge-generated",
        active: "badge-active",
        inactive: "badge-inactive",
        admin: "badge-admin",
        seller: "badge-seller",
        generated: "badge-generated",
        sent: "badge-sent",
        success: "badge-active",
        danger: "bg-red-50 text-red-600 border-red-200",
        outline: "bg-transparent text-ink-600 border-ink-200",
        secondary: "bg-ink-100 text-ink-600 border-ink-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
