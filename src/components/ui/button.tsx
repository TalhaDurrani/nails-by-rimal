import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex max-w-full items-center justify-center gap-2 whitespace-normal break-words rounded-[50px] text-center text-[0.9rem] leading-normal font-medium uppercase tracking-[1px] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#94505d] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // btn-fill
        default: "bg-[#94505d] text-[#FAF9F6] border border-[#94505d] hover:bg-[#2C3E50] hover:border-[#2C3E50] hover:-translate-y-[2px] hover:shadow-[0_4px_15px_rgba(44,62,80,0.15)]",
        // btn-outline
        outline: "border border-[#806035] bg-transparent text-[#2C3E50] hover:bg-[#806035] hover:text-[#FAF9F6] hover:-translate-y-[2px]",
        secondary: "bg-[#FADADD] text-[#2C3E50] hover:bg-[#94505d] hover:text-[#FAF9F6]",
        ghost: "text-[#2C3E50] hover:bg-[#FADADD] hover:text-[#2C3E50]",
        link: "text-[#94505d] underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-12 px-8 py-3",
        sm: "min-h-9 rounded-[50px] px-4 py-2",
        lg: "min-h-14 rounded-[50px] px-10 py-4",
        icon: "h-12 w-12 shrink-0 rounded-full p-0",
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
