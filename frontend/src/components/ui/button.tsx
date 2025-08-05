import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "neu-button text-foreground font-semibold",
        coral: "coral-button text-primary-foreground font-semibold",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl border-none shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)] hover:shadow-[8px_8px_16px_var(--neu-shadow-dark),-8px_-8px_16px_var(--neu-shadow-light)] hover:translate-y-[-1px] active:shadow-[inset_4px_4px_8px_var(--neu-inset-dark),inset_-4px_-4px_8px_var(--neu-inset-light)] active:translate-y-0",
        outline:
          "bg-transparent border-2 border-foreground/20 text-foreground rounded-xl shadow-[inset_2px_2px_4px_var(--neu-inset-dark),inset_-2px_-2px_4px_var(--neu-inset-light)] hover:border-foreground/30 hover:shadow-[inset_4px_4px_8px_var(--neu-inset-dark),inset_-4px_-4px_8px_var(--neu-inset-light)]",
        secondary:
          "bg-secondary text-secondary-foreground rounded-xl border-none shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)] hover:shadow-[8px_8px_16px_var(--neu-shadow-dark),-8px_-8px_16px_var(--neu-shadow-light)] hover:translate-y-[-1px] active:shadow-[inset_4px_4px_8px_var(--neu-inset-dark),inset_-4px_-4px_8px_var(--neu-inset-light)] active:translate-y-0",
        ghost: "bg-transparent text-foreground rounded-xl hover:shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)] hover:translate-y-[-1px]",
        link: "text-primary underline-offset-4 hover:underline bg-transparent border-none shadow-none",
      },
      size: {
        default: "h-12 px-6 py-3 rounded-xl",
        sm: "h-9 px-4 py-2 rounded-lg text-xs",
        lg: "h-14 px-8 py-4 rounded-xl text-base",
        icon: "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
