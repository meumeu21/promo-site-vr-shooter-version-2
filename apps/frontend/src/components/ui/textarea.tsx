import * as React from 'react';
import { cn } from '@/lib/utils';
const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(({
  className,
  ...props
}, ref) => {
  return <textarea className={cn('flex min-h-[60px] w-full rounded-md border border-white/12 bg-[linear-gradient(180deg,rgba(25,18,40,0.82),rgba(9,9,12,0.96))] px-3 py-2 text-sm text-slate-100 shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 disabled:cursor-not-allowed disabled:opacity-50', className)} ref={ref} {...props} />;
});
Textarea.displayName = 'Textarea';
export { Textarea };
