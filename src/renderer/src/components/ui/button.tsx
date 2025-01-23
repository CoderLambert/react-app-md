import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@renderer/utils/classUtils'
import { forwardRef } from 'react'
const buttonVariants = cva(['font-semibold', 'border', 'rounded'], {
  variants: {
    intent: {
      primary: ['bg-blue-500', 'text-white', 'border-transparent', 'hover:bg-blue-600'],
      // **or**
      // primary: "bg-blue-500 text-white border-transparent hover:bg-blue-600",
      secondary: ['bg-white', 'text-gray-800', 'border-gray-400', 'hover:bg-gray-100']
    },
    size: {
      small: ['text-sm', 'py-1', 'px-2'],
      medium: ['text-base', 'py-2', 'px-4']
    }
  },
  compoundVariants: [
    {
      intent: 'primary',
      size: 'medium',
      class: 'uppercase'
    }
  ],
  defaultVariants: {
    intent: 'primary',
    size: 'medium'
  }
})

export interface ButtonVariants extends VariantProps<typeof buttonVariants> {}

export const buttonClass = (variants: ButtonVariants): string => cn(buttonVariants(variants))

buttonClass({ intent: 'primary', size: 'medium' })

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button'
    return <Comp className={cn(buttonVariants({ intent, size, className }))} ref={ref} {...props} />
  }
)

Button.displayName = 'Button'
