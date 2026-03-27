'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
export type CalendarProps = React.ComponentProps<typeof DayPicker>;
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return <DayPicker showOutsideDays={showOutsideDays} className={cn('px-5 py-4 bg-transparent select-none', className)} classNames={{
    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
    month: 'space-y-3 flex flex-col items-center',
    month_caption: 'flex justify-center pt-1 relative items-center mb-4 w-full',
    caption_label: 'text-[10px] font-black uppercase tracking-[0.3em] text-white font-mono',
    nav: 'flex items-center',
    button_previous: cn(buttonVariants({
      variant: 'outline',
      size: 'icon'
    }), 'h-6 w-6 bg-transparent p-0 opacity-40 hover:opacity-100 border-white/10 absolute left-0 z-10 transition-all hover:border-primary/50'),
    button_next: cn(buttonVariants({
      variant: 'outline',
      size: 'icon'
    }), 'h-6 w-6 bg-transparent p-0 opacity-40 hover:opacity-100 border-white/10 absolute right-0 z-10 transition-all hover:border-primary/50'),
    month_grid: 'w-[196px] border-collapse select-none border-spacing-0',
    weekdays: 'w-full mb-1',
    weekday: 'text-slate-500 w-7 h-7 font-mono font-bold text-[11px] uppercase tracking-wider text-center p-0',
    week: 'w-full mt-0',
    day: 'p-0 relative focus-within:relative focus-within:z-20 text-center w-7 h-7',
    day_button: cn(buttonVariants({
      variant: 'ghost'
    }), 'relative h-[22px] w-[22px] p-0 font-mono text-[9px] font-medium transition-all hover:bg-white/10 hover:text-white rounded-md flex items-center justify-center z-10 m-auto border-none'),
    selected: '[&>button]:bg-primary/20 [&>button]:text-primary [&>button]:font-black',
    range_start: '[&>button]:bg-primary [&>button]:text-background [&>button]:font-black [&>button]:hover:bg-primary [&>button]:hover:text-background [&>button]:rounded-md [&>button]:!opacity-100 z-20',
    range_end: '[&>button]:bg-primary [&>button]:text-background [&>button]:font-black [&>button]:hover:bg-primary [&>button]:hover:text-background [&>button]:rounded-md [&>button]:!opacity-100 z-20',
    range_middle: '[&>button]:bg-primary/20 [&>button]:text-primary [&>button]:rounded-md [&>button]:font-bold [&>button]:!opacity-100',
    today: '[&>button]:text-primary [&>button]:font-black [&>button]:after:content-[""] [&>button]:after:absolute [&>button]:after:bottom-0.5 [&>button]:after:w-0.5 [&>button]:after:h-0.5 [&>button]:after:bg-primary [&>button]:after:rounded-full',
    outside: 'day-outside text-slate-600 opacity-20',
    disabled: 'text-slate-700 opacity-40 pointer-events-none',
    hidden: 'invisible',
    ...classNames
  }} components={{
    Chevron: ({
      orientation
    }) => {
      if (orientation === 'left') {
        return <ChevronLeft className="h-4 w-4" />;
      }
      return <ChevronRight className="h-4 w-4" />;
    }
  }} {...props} />;
}
Calendar.displayName = 'Calendar';
export { Calendar };
