import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const badgeVariants = cva('font-heading inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40', {
  variants: {
    variant: {
      default: 'border-white/15 bg-white/[0.04] text-white hover:border-white/25',
      secondary: 'border-[#4d2a7a] bg-[linear-gradient(135deg,rgba(96,31,140,0.18),rgba(29,4,191,0.2))] text-slate-100 hover:border-[#6e39a9]',
      destructive: 'border-red-500/45 bg-red-950/40 text-red-100 hover:border-red-400/60',
      outline: 'border-white/20 bg-transparent text-slate-200',
      new: 'border-[#4d2a7a] bg-[linear-gradient(135deg,rgba(96,31,140,0.2),rgba(29,4,191,0.24))] text-violet-100',
      inProgress: 'border-violet-500/40 bg-violet-500/10 text-violet-100',
      closed: 'border-blue-500/35 bg-blue-500/10 text-blue-100'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({
  className,
  variant,
  ...props
}: BadgeProps) {
  return <div className={cn(badgeVariants({
    variant
  }), className)} {...props} />;
}
export { Badge, badgeVariants };
