import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#2196f3] text-white hover:bg-[#1976d2] shadow-sm hover:shadow-md",
        destructive:
          "bg-[#f44336] text-white hover:bg-[#d32f2f] shadow-sm hover:shadow-md",
        outline:
          "border border-[#2196f3]/40 bg-background hover:bg-[#e3f2fd] hover:text-[#2196f3] hover:border-[#2196f3] shadow-sm hover:shadow-md",
        secondary:
          "bg-[#607d8b] text-white hover:bg-[#455a64] shadow-sm hover:shadow-md",
        ghost: "hover:bg-[#e3f2fd] hover:text-[#2196f3] shadow-sm",
        link: "text-[#2196f3] hover:text-[#1976d2] underline-offset-4 hover:underline",
        success: "bg-[#4caf50] text-white hover:bg-[#388e3c] shadow-sm hover:shadow-md",
        warning: "bg-[#ff9800] text-white hover:bg-[#f57c00] shadow-sm hover:shadow-md",
        teal: "bg-[#00bcd4] text-white hover:bg-[#0097a7] shadow-sm hover:shadow-md",
        purple: "bg-[#9c27b0] text-white hover:bg-[#7b1fa2] shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
