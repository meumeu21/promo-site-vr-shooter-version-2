'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CalendarDate, parseDate } from '@internationalized/date';
import { RangeCalendar } from '@heroui/react';
import { addDays, format, isValid, startOfDay, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar as CalendarIcon, Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MatchHistoryFilterControlsProps {
  selectedClub?: string;
  clubs: Array<{
    id: string;
    slug: string;
    name: string;
    address: string;
  }>;
  currentLimit: number;
}

type MatchHistoryCalendarRange = {
  start: CalendarDate;
  end: CalendarDate;
};

type HistoryPeriodValue = 'all' | 'today' | 'yesterday' | 'week' | 'custom';

export function MatchHistoryFilterControls({
  selectedClub,
  clubs,
  currentLimit
}: MatchHistoryFilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isClubOpen, setIsClubOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const currentFrom = searchParams.get('from') ?? undefined;
  const currentTo = searchParams.get('to') ?? undefined;
  
  const dateRange = useMemo(() => {
    if (!currentFrom && !currentTo) return undefined;
    const from = currentFrom ? new Date(currentFrom) : undefined;
    const to = currentTo ? new Date(currentTo) : undefined;
    return {
      from: from && isValid(from) ? from : undefined,
      to: to && isValid(to) ? to : undefined
    };
  }, [currentFrom, currentTo]);

  const calendarRange = useMemo<MatchHistoryCalendarRange | null>(() => {
    if (!currentFrom || !currentTo) return null;
    return {
      start: parseCalendarDateFromIso(currentFrom),
      end: parseCalendarDateFromIso(currentTo)
    };
  }, [currentFrom, currentTo]);

  const resetHref = useMemo(() => buildHistoryHref(pathname, {
    limit: String(currentLimit)
  }), [currentLimit, pathname]);

  const updateFilters = ({
    club,
    range
  }: {
    club?: string;
    range?: MatchHistoryCalendarRange | null | undefined;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextClub = club ?? selectedClub ?? 'all';
    params.set('limit', String(currentLimit));
    params.delete('offset');
    
    if (nextClub === 'all') {
      params.delete('club');
    } else {
      params.set('club', nextClub);
    }
    
    if (range === null || range === undefined) {
      params.delete('from');
      params.delete('to');
    } else {
      params.set('from', calendarDateToIsoString(range.start));
      params.set('to', calendarDateToIsoString(range.end));
    }
    router.push(buildHistoryHref(pathname, Object.fromEntries(params.entries())));
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">

      {/* Выбор клуба */}
      <div className="flex flex-1 flex-col space-y-2">
        <span className="font-mono text-base uppercase tracking-[0.24em] text-slate-500">
          Клуб
        </span>
        <Popover open={isClubOpen} onOpenChange={setIsClubOpen}>
          <PopoverTrigger asChild>
            <div className="flex max-h-[min(18rem,60vh)] flex-col gap-1 overflow-y-auto">
              <button type="button" aria-label="Фильтр по клубу" className="flex h-12 w-full items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 text-left text-sm font-medium text-white outline-none transition-colors hover:border-white/20 focus:border-primary/40">
                <span className="block truncate leading-none">
                  {selectedClub ? (() => {
                    const activeClub = clubs.find(club => club.slug === selectedClub);
                    return activeClub ? `${activeClub.name} — ${activeClub.address}` : 'Все клубы';
                  })() : 'Все клубы'}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
              </button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[min(var(--radix-popover-trigger-width),calc(100vw-2rem))] max-w-[calc(100vw-2rem)] p-1.5" align="start" onOpenAutoFocus={event => event.preventDefault()}>
            <div className="flex max-h-[min(18rem,60vh)] flex-col divide-y divide-white/10 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  updateFilters({ club: 'all' });
                  setIsClubOpen(false);
                }}
                className="flex w-full items-start justify-between gap-3 rounded-xl px-2.5 py-3 text-left text-[13px] font-medium leading-snug text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-white"
                style={{ backgroundColor: 'transparent' }}
              >
                <span className="min-w-0 flex-1 whitespace-normal break-words pr-3">Все клубы</span>
              </button>
              {clubs.map(club => (
                <button key={club.id} type="button" onClick={() => {
                  updateFilters({ club: club.slug });
                  setIsClubOpen(false);
                }} className={cn('flex w-full items-start justify-between gap-3 rounded-xl px-2.5 py-3 text-left text-[13px] font-medium leading-snug transition-colors hover:bg-white/[0.04] hover:text-white', selectedClub === club.slug ? 'text-white' : 'text-slate-300')} style={{ backgroundColor: 'transparent' }}>
                  <span className="min-w-0 flex-1 overflow-hidden pr-3" style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                    {`${club.name} — ${club.address}`}
                  </span>
                  {selectedClub === club.slug ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> : null}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Выбор периода */}
      <div className="flex flex-[1.5] flex-col space-y-2">
        <span className="font-mono text-base uppercase tracking-[0.24em] text-slate-500">
          Период
        </span>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <button type="button" aria-label="Фильтр по периоду" className={cn('flex h-12 w-full items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 text-left text-sm font-semibold outline-none transition-colors hover:border-white/20 focus:border-primary/40', !dateRange && 'text-slate-400')}>
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <span>
                  {dateRange?.from ? dateRange.to ? <>
                    {format(dateRange.from, 'dd MMM', { locale: ru })} –{' '}
                    {format(dateRange.to, 'dd MMM yyyy', { locale: ru })}
                  </> : format(dateRange.from, 'dd MMMM yyyy', { locale: ru }) : 'Выберите период'}
                </span>
              </div>
              <span role="button" tabIndex={dateRange ? 0 : -1} aria-label={dateRange ? 'Сбросить фильтр периода' : undefined} onClick={event => {
                if (!dateRange) return;
                event.preventDefault();
                event.stopPropagation();
                updateFilters({ range: null });
                setIsCalendarOpen(false);
              }} onKeyDown={event => {
                if (!dateRange) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  updateFilters({ range: null });
                  setIsCalendarOpen(false);
                }
              }} className={cn('inline-flex rounded-full p-1 transition-colors', dateRange ? 'text-slate-500 hover:bg-white/10 hover:text-white' : 'pointer-events-none text-slate-500')}>
                {dateRange ? <X className="h-3.5 w-3.5" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[min(var(--radix-popover-trigger-width),calc(100vw-2rem))] max-w-[calc(100vw-2rem)] overflow-hidden p-2 sm:p-3 lg:w-auto lg:min-w-[22rem]" align="start">
            <div className="mx-auto w-full max-w-[24rem] rounded-[28px] p-2 sm:p-4">
              <RangeCalendar 
                aria-label="Период матчей" 
                firstDayOfWeek="mon" 
                value={calendarRange} 
                onChange={range => {
                  updateFilters({ range });
                  setIsCalendarOpen(false);
                }} 
                visibleMonths={1} 
                className="w-full" 
                classNames={{
                  base: 'w-full max-w-[20rem] mx-auto',
                  headerWrapper: 'mb-4 rounded-2xl px-1 py-2',
                  header: 'gap-2',
                  title: 'flex-1 text-center font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white sm:text-[13px] sm:tracking-[0.28em]',
                  prevButton: 'inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 shadow-none transition-colors hover:bg-white/[0.08] hover:text-white',
                  nextButton: 'inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 shadow-none transition-colors hover:bg-white/[0.08] hover:text-white',
                  content: 'w-full',
                  gridWrapper: 'w-full',
                  grid: 'w-full border-collapse table-fixed',
                  gridHeaderRow: '', 
                  gridHeaderCell: 'w-12 pb-3 text-center font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 sm:text-[14px] sm:tracking-[0.24em]',
                  gridBodyRow: '', 
                  cell: 'p-0.5',
                  cellButton: 'mx-auto flex aspect-square w-9 sm:w-10 items-center justify-center rounded-xl text-center text-xs font-semibold text-slate-200 transition sm:text-sm data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-slate-700 data-[hover=true]:bg-white/[0.06] data-[hover=true]:text-white data-[outside-month=true]:text-slate-700 data-[pressed=true]:scale-[0.98] data-[selected=true]:bg-primary/20 data-[selected=true]:font-black data-[selected=true]:text-primary data-[selection-start=true]:bg-primary data-[selection-start=true]:text-black data-[selection-end=true]:bg-primary data-[selection-end=true]:text-black data-[today=true]:ring-1 data-[today=true]:ring-primary/50'
                }} 
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Кнопка сброса */}
      <div className="flex flex-none flex-col space-y-2">
        <span className="hidden select-none font-mono text-base uppercase tracking-[0.24em] text-transparent lg:block" aria-hidden="true">
          Сброс
        </span>
        <Link href={resetHref} className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-xs font-black uppercase tracking-[0.18em] text-slate-300 transition-colors hover:border-primary/30 hover:text-primary lg:w-auto">
          Сбросить
        </Link>
      </div>

    </div>
  );
}
export function resolvePeriodValue(from?: string, to?: string): HistoryPeriodValue {
  if (!from || !to) return from || to ? 'custom' : 'all';
  const todayRange = buildPeriodRange('today');
  const yesterdayRange = buildPeriodRange('yesterday');
  const weekRange = buildPeriodRange('week');
  if (todayRange.from === from && todayRange.to === to) return 'today';
  if (yesterdayRange.from === from && yesterdayRange.to === to) return 'yesterday';
  if (weekRange.from === from && weekRange.to === to) return 'week';
  return 'custom';
}
export function buildPeriodRange(period: Exclude<HistoryPeriodValue, 'all' | 'custom'>): {
  from: string;
  to: string;
} {
  const now = new Date();
  const today = startOfDay(now);
  if (period === 'today') {
    return {
      from: today.toISOString(),
      to: addDays(today, 1).toISOString()
    };
  }
  if (period === 'yesterday') {
    const yesterday = subDays(today, 1);
    return {
      from: yesterday.toISOString(),
      to: today.toISOString()
    };
  }
  const weekStart = subDays(today, 6);
  return {
    from: weekStart.toISOString(),
    to: addDays(today, 1).toISOString()
  };
}
function buildHistoryHref(pathname: string, filters: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
function parseCalendarDateFromIso(value: string): CalendarDate {
  return parseDate(format(new Date(value), 'yyyy-MM-dd'));
}
function calendarDateToIsoString(value: CalendarDate): string {
  return new Date(Date.UTC(value.year, value.month - 1, value.day)).toISOString();
}
