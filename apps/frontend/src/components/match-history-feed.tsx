'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { GroupedHistoryMatches, HistoryMatchListItem } from '@/lib/api';
import { getGroupedHistoryMatches, getHistoryMatches, formatMatchDateTime, formatModeLabel, formatMapLabel, getMatchScoreline } from '@/lib/api';
interface MatchHistoryFeedProps {
  initialData: GroupedHistoryMatches[];
  initialTotalClubs: number;
  filters?: {
    clubSlug?: string;
    from?: string;
    to?: string;
  };
}
export function MatchHistoryFeed({
  initialData,
  initialTotalClubs,
  filters
}: MatchHistoryFeedProps) {
  const [clubs, setClubs] = useState<GroupedHistoryMatches[]>(initialData);
  const [clubOffset, setClubOffset] = useState(initialData.length);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [totalClubs, setTotalClubs] = useState(initialTotalClubs);

  useEffect(() => {
    setClubs(initialData);
    setClubOffset(initialData.length);
    setTotalClubs(initialTotalClubs);
  }, [initialData, initialTotalClubs]);

  const loadMoreClubs = async () => {
    if (loadingClubs) return;
    setLoadingClubs(true);
    try {
      const result = await getGroupedHistoryMatches({
        clubLimit: 5,
        clubOffset,
        matchLimit: 5,
        clubSlug: filters?.clubSlug,
        from: filters?.from,
        to: filters?.to
      });
      setClubs(prev => [...prev, ...result.data]);
      setClubOffset(prev => prev + result.data.length);
    } catch (error) {
      console.error('Failed to load more clubs:', error);
    } finally {
      setLoadingClubs(false);
    }
  };
  const hasMoreClubs = clubOffset < totalClubs;
  return <div className="space-y-8">
      <div className="space-y-6">
        {clubs.map(group => <ClubHistoryAccordion key={group.club.id} initialGroup={group} filters={filters} />)}
      </div>

      {hasMoreClubs && <div className="flex justify-center pt-4">
          <button onClick={loadMoreClubs} disabled={loadingClubs} className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4 font-black uppercase tracking-widest text-white transition-all hover:border-primary/50 hover:bg-primary/10 disabled:opacity-50">
            {loadingClubs ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <>
                <span className="relative z-10">Загрузить ещё</span>
                <ChevronDown className="relative z-10 h-5 w-5 transition-transform group-hover:translate-y-0.5" />
              </>}
          </button>
        </div>}
    </div>;
}
function ClubHistoryAccordion({
  initialGroup,
  filters
}: {
  initialGroup: GroupedHistoryMatches;
  filters?: MatchHistoryFeedProps['filters'];
}) {
  const [matches, setMatches] = useState<HistoryMatchListItem[]>(initialGroup.matches);
  const [offset, setOffset] = useState(initialGroup.matches.length);
  const [hasMore, setHasMore] = useState(initialGroup.hasMoreMatches);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(!!filters?.clubSlug);

  useEffect(() => {
    setMatches(initialGroup.matches);
    setOffset(initialGroup.matches.length);
    setHasMore(initialGroup.hasMoreMatches);
  }, [initialGroup.matches, initialGroup.hasMoreMatches]);

  const loadMoreMatches = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const result = await getHistoryMatches({
        clubId: initialGroup.club.id,
        limit: 10,
        offset,
        from: filters?.from,
        to: filters?.to
      });
      setMatches(prev => [...prev, ...result.data]);
      setOffset(prev => prev + result.data.length);
      setHasMore(offset + result.data.length < result.meta.total);
    } catch (error) {
      console.error('Failed to load more matches:', error);
    } finally {
      setLoading(false);
    }
  };
  return <details open={isOpen} onToggle={e => setIsOpen((e.target as HTMLDetailsElement).open)} className="group overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md transition-all duration-300">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/[0.04] sm:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h2 className="truncate text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
              {initialGroup.club.name}
            </h2>
            <span className="hidden rounded-full bg-primary/10 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary sm:inline-block">
              Всего матчей: {initialGroup.totalMatches}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-400 sm:text-sm">
            {initialGroup.club.address}
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
          {matches.map(match => <MatchCard key={match.id} match={match} />)}
        </div>

        {hasMore && <div className="p-4">
            <button onClick={loadMoreMatches} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.03] py-3 text-xs font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
                  Показать ещё
                  <ChevronDown className="h-4 w-4" />
                </>}
            </button>
          </div>}
      </div>
    </details>;
}
function MatchCard({
  match
}: {
  match: HistoryMatchListItem;
}) {
  return <Link href={`/matches/${match.id}`} className="group/card relative flex items-center justify-between gap-4 bg-transparent px-6 py-4 transition-all hover:bg-white/[0.04] sm:px-8">
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
          <p className="font-mono text-[10px] uppercase tracking-super-wide text-slate-500">Счёт</p>
          <p className="font-mono text-2xl font-black tabular-nums tracking-cyber text-white">
            {getMatchScoreline(match.teams)}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-slate-400 transition-all group-hover/card:border-primary/30 group-hover/card:bg-primary group-hover/card:text-background group-hover/card:shadow-[0_0_20px_rgba(13,166,166,0.3)]">
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>;
}
