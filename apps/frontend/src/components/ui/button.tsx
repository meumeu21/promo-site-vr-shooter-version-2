import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const buttonVariants = cva('font-heading inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border px-4 text-sm font-bold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0', {
  variants: {
    variant: {
      default: 'border-primary/70 bg-primary text-primary-foreground shadow-[0_0_30px_rgba(13,166,166,0.18)] hover:border-primary hover:bg-[#11b5b5]',
      destructive: 'border-red-500/55 bg-red-950/50 text-red-100 hover:border-red-400/70 hover:bg-red-900/60',
      outline: 'border-white/20 bg-white/[0.03] text-white hover:border-white/35 hover:bg-white/[0.07]',
      secondary: 'border-[#4d2a7a] bg-[linear-gradient(135deg,rgba(96,31,140,0.32),rgba(29,4,191,0.34))] text-white hover:border-[#6e39a9] hover:bg-[linear-gradient(135deg,rgba(96,31,140,0.46),rgba(29,4,191,0.42))]',
      ghost: 'border-transparent bg-transparent text-slate-200 hover:border-white/10 hover:bg-white/5',
      link: 'border-transparent bg-transparent px-0 text-primary underline-offset-4 hover:text-[#59d2d2] hover:underline'
    },
    size: {
      default: 'px-4 py-2',
      sm: 'min-h-8 rounded-md px-3 py-1 text-[11px] tracking-[0.14em]',
      lg: 'min-h-11 rounded-md px-8 py-2.5 text-[13px]',
      icon: 'min-h-9 w-9 px-0'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant,
  size,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({
    variant,
    size,
    className
  }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';
export { Button, buttonVariants };
