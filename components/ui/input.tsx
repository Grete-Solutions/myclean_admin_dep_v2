import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A8791]/20 focus-visible:border-[#0A8791] hover:border-[#0A8791]/50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
