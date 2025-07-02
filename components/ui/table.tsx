"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
    >
      <div className="overflow-x-auto">
        <table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} {...props} />
      </div>
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "bg-gradient-to-r from-[#0A8791] to-[#0ea5e9] text-white backdrop-blur-sm border-b border-slate-200/50", 
        "[&_tr]:border-0", 
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("bg-white/95 backdrop-blur-sm", "[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-slate-50/80 backdrop-blur-sm border-t border-slate-200/50 font-medium",
        "[&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "group relative border-b border-slate-200/30 transition-all duration-200",
        "hover:bg-[#0A8791]/5 hover:shadow-sm hover:scale-[1.001]",
        "data-[state=selected]:bg-[#0A8791]/10 data-[state=selected]:border-[#0A8791]/20",
        "data-[state=selected]:shadow-md data-[state=selected]:scale-[1.002]",
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 px-4 text-left align-middle font-semibold text-white/95",
        "text-xs uppercase tracking-wider whitespace-nowrap",
        "first:pl-6 last:pr-6",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        "border-r border-white/10 last:border-r-0",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-3 align-middle text-sm text-slate-700",
        "first:pl-6 last:pr-6",
        "border-r border-slate-200/10 last:border-r-0",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        "group-hover:text-slate-900 transition-colors duration-200",
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-slate-600 font-medium", className)}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
