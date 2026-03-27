import { MatchHistoryFilters } from '@/components/match-history';
import { MatchHistoryAutoRefresh } from '@/components/match-history-auto-refresh';
import { MatchesHero } from '@/components/matches-hero';
import { MatchesEmpty } from '@/components/matches-empty';
import { MatchesError } from '@/components/matches-error';
import { MatchHistoryFeed } from '@/components/match-history-feed';
import { getGroupedHistoryMatches, getHistoryMatches } from '@/lib/api';
interface MatchesPageProps {
  searchParams?: Promise<{
    club?: string;
    from?: string;
    to?: string;
  }>;
}
export default async function MatchesPage({
  searchParams
}: MatchesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  try {
    const result = await getGroupedHistoryMatches({
      clubLimit: 15,
      clubOffset: 0,
      matchLimit: 5,
      clubSlug: resolvedSearchParams.club,
      from: resolvedSearchParams.from,
      to: resolvedSearchParams.to
    });
    const allMatchesForClubs = await getHistoryMatches({
      limit: 100
    });
    const clubs = Array.from(new Map(allMatchesForClubs.data.map(match => [match.club.id, {
      id: match.club.id,
      slug: match.club.slug,
      name: match.club.name,
      address: match.club.address
    }])).values());
    return <div className="relative min-h-screen overflow-hidden pb-20">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0DA6A620_1px,transparent_1px),linear-gradient(to_bottom,#0DA6A620_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>
        <div className="absolute -left-20 top-20 h-[520px] w-[520px] rounded-full bg-[#601F8C]/15 blur-[160px]"></div>
        <div className="absolute -right-16 top-1/3 h-[440px] w-[440px] rounded-full bg-primary/10 blur-[150px]"></div>

        <section className="relative z-10 px-4 pb-10 pt-24 lg:pt-32">
          <MatchHistoryAutoRefresh />
          <div className="mx-auto max-w-6xl space-y-8">
            <MatchesHero />

            <MatchHistoryFilters selectedClub={resolvedSearchParams.club} from={resolvedSearchParams.from} to={resolvedSearchParams.to} clubs={clubs} currentLimit={15} />

            {result.data.length === 0 ? <MatchesEmpty limit={15} /> : <MatchHistoryFeed key={`${resolvedSearchParams.club}-${resolvedSearchParams.from}-${resolvedSearchParams.to}`} initialData={result.data} initialTotalClubs={result.meta.totalClubs} filters={{
            clubSlug: resolvedSearchParams.club,
            from: resolvedSearchParams.from,
            to: resolvedSearchParams.to
          }} />}
          </div>
        </section>
      </div>;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось загрузить историю матчей';
    return <MatchesError message={message} />;
  }
}
