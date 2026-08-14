import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[50px] text-[0.9rem] font-medium uppercase tracking-[1px] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // btn-fill
        default: "bg-[#C08081] text-[#FAF9F6] border border-[#C08081] hover:bg-[#2C3E50] hover:border-[#2C3E50] hover:-translate-y-[2px] hover:shadow-[0_4px_15px_rgba(44,62,80,0.15)]", 
        // btn-outline
        outline: "border border-[#D4AF37] bg-transparent text-[#2C3E50] hover:bg-[#D4AF37] hover:text-[#FAF9F6] hover:-translate-y-[2px]", 
        secondary: "bg-[#FADADD] text-[#2C3E50] hover:bg-[#C08081] hover:text-[#FAF9F6]",
        ghost: "hover:bg-[#FADADD] hover:text-[#2C3E50]",
        link: "text-[#C08081] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-9 rounded-[50px] px-4",
        lg: "h-14 rounded-[50px] px-10",
        icon: "h-12 w-12 rounded-full",
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