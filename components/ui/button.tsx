import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#0A8791] text-white shadow-md hover:bg-[#0A8791]/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-[#0A8791]/50",
        destructive:
          "bg-red-500 text-white shadow-md hover:bg-red-500/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border-2 border-[#0A8791] bg-white text-[#0A8791] shadow-sm hover:bg-[#0A8791] hover:text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-slate-100 text-[#0A8791] shadow-sm hover:bg-slate-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        ghost: "text-[#0A8791] hover:bg-[#0A8791]/10 hover:text-[#0A8791] hover:scale-[1.02] active:scale-[0.98]",
        link: "text-[#0A8791] underline-offset-4 hover:underline hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
