import * as React from 'react';
import { cn } from '@/lib/utils';
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => {
  return <div ref={ref} className={cn('rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,14,28,0.92),rgba(8,8,12,0.96))] p-3 text-card-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.03)] sm:p-4', className)} {...props} />;
});
Card.displayName = 'Card';
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => {
  return <div ref={ref} className={cn('flex flex-col space-y-1.5 p-0', className)} {...props} />;
});
CardHeader.displayName = 'CardHeader';
const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => {
  return <div ref={ref} className={cn('font-heading text-xl font-bold uppercase leading-none tracking-tight sm:text-2xl lg:text-3xl', className)} {...props} />;
});
CardTitle.displayName = 'CardTitle';
const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => {
  return <div ref={ref} className={cn('max-w-3xl text-sm text-slate-300', className)} {...props} />;
});
CardDescription.displayName = 'CardDescription';
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => {
  return <div ref={ref} className={cn('p-0', className)} {...props} />;
});
CardContent.displayName = 'CardContent';
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => {
  return <div ref={ref} className={cn('flex items-center p-0', className)} {...props} />;
});
CardFooter.displayName = 'CardFooter';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
