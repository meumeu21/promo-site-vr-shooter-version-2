import Link from 'next/link';
import { CalendarDays, ChevronDown, ChevronRight } from 'lucide-react';
import { MatchHistoryFilterControls } from '@/components/match-history-filter-controls';
import type { HistoryMatchListItem } from '@/types/api';
import { formatMapLabel, formatMatchDateTime, formatModeLabel, getMatchScoreline, groupMatchesByClub } from '@/lib/api';
interface MatchesPageSearchParams {
  club?: string;
  from?: string;
  to?: string;
  limit?: string;
  offset?: string;
}
interface MatchHistoryFiltersProps {
  selectedClub?: string;
  from?: string;
  to?: string;
  clubs: Array<{
    id: string;
    slug: string;
    name: string;
    address: string;
  }>;
  currentLimit: number;
}
interface ClubMatchesAccordionProps {
  selectedClub?: string;
  matches: HistoryMatchListItem[];
}
export function getHistoryPageHref(filters: MatchesPageSearchParams = {}): string {
  const params = new URLSearchParams();
  if (filters.club) params.set('club', filters.club);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.limit) params.set('limit', filters.limit);
  if (filters.offset) params.set('offset', filters.offset);
  const query = params.toString();
  return query ? `/matches?${query}` : '/matches';
}
export function MatchHistoryFilters({
  selectedClub,
  clubs,
  currentLimit
}: Omit<MatchHistoryFiltersProps, 'to'> & {
  to?: string;
}) {
  return <>

      <section className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm">
        <MatchHistoryFilterControls selectedClub={selectedClub} clubs={clubs} currentLimit={currentLimit} />
      </section>

    </>;
}
export function ClubMatchesAccordion({
  matches,
  selectedClub
}: ClubMatchesAccordionProps) {
  const groups = groupMatchesByClub(matches);
  return <>

      <div className="space-y-4">
        {groups.map((group, index) => {
        const isOpen = selectedClub ? group.clubSlug === selectedClub : index === 0;
        return <details key={group.clubId} open={isOpen} className="group overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md transition-all duration-300">

              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/[0.04] sm:px-8">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="truncate text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
                      {group.clubName}
                    </h2>
                    <span className="hidden rounded-full bg-primary/10 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary sm:inline-block">
                      Матчей: {group.matches.length}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-400 sm:text-sm">
                    {group.clubAddress}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-slate-400 transition-all group-open:rotate-180 group-open:bg-primary/20 group-open:text-primary">
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </div>
              </summary>

              <div className="border-t border-white/5 bg-black/20">
                <div className="divide-y divide-white/5">
                  {group.matches.map(match => <MatchListCard key={match.id} match={match} />)}
                </div>
              </div>

            </details>;
      })}
      </div>

    </>;
}
export function MatchHistoryPagination({
  selectedClub,
  from,
  to,
  limit,
  offset,
  total
}: {
  selectedClub?: string;
  from?: string;
  to?: string;
  limit: number;
  offset: number;
  total: number;
}) {
  const previousOffset = Math.max(offset - limit, 0);
  const nextOffset = offset + limit;
  const hasPrevious = offset > 0;
  const hasNext = nextOffset < total;
  return <>

      <section className="rounded-3xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-slate-500">
            Показано <span className="text-slate-300">{offset + 1}</span> -{' '}
            <span className="text-slate-300">{Math.min(offset + limit, total)}</span> из{' '}
            <span className="text-slate-300">{total}</span>
          </p>
          <div className="flex gap-3">

            <Link aria-disabled={!hasPrevious} href={hasPrevious ? getHistoryPageHref({
            club: selectedClub,
            from,
            to,
            limit: String(limit),
            offset: String(previousOffset)
          }) : '#'} className={`flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${hasPrevious ? 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:text-white' : 'pointer-events-none bg-white/[0.02] text-slate-700'}`}>
              Назад
            </Link>

            <Link aria-disabled={!hasNext} href={hasNext ? getHistoryPageHref({
            club: selectedClub,
            from,
            to,
            limit: String(limit),
            offset: String(nextOffset)
          }) : '#'} className={`flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${hasNext ? 'bg-primary/10 text-primary hover:bg-primary hover:text-background' : 'pointer-events-none bg-white/[0.02] text-slate-700'}`}>
              Далее
            </Link>

          </div>
        </div>
      </section>

    </>;
}
function MatchListCard({
  match
}: {
  match: HistoryMatchListItem;
}) {
  return <>

      <Link href={`/matches/${match.id}`} className="group/card relative flex items-center justify-between gap-4 bg-transparent px-6 py-4 transition-all hover:bg-white/[0.04] sm:px-8">
        <span className="sr-only">Перейти к матчу </span>

        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-slate-400 transition-colors group-hover/card:bg-primary/10 group-hover/card:text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white sm:text-base">
              {formatMatchDateTime(match.playedAt)}
            </p>
            <div className="mt-1 flex items-center gap-2 overflow-hidden text-[10px] font-mono uppercase tracking-wider text-slate-500">
              <span className="truncate">{formatModeLabel(match.mode)}</span>
              <span className="opacity-30">•</span>
              <span className="truncate">{formatMapLabel(match.map)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 sm:gap-10">
          <div className="hidden flex-col items-center space-y-0.5 sm:items-end md:flex">
            <p className="font-mono text-[10px] uppercase tracking-super-wide text-slate-500">
              Счёт
            </p>
            <p className="font-mono text-2xl font-black tabular-nums tracking-cyber text-white">
              {getMatchScoreline(match.teams)}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-slate-400 transition-all group-hover/card:border-primary/30 group-hover/card:bg-primary group-hover/card:text-background group-hover/card:shadow-[0_0_20px_rgba(13,166,166,0.3)]">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>

      </Link>

    </>;
}
