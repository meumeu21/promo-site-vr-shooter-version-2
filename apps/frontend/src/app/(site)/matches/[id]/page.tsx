import Link from 'next/link';
import { CostCalculatorCTA } from '@/components/cost-calculator-cta';
import { MatchDetailHero } from '@/components/match-detail-hero';
import { MatchDetailStats } from '@/components/match-detail-stats';
import { MatchDetailWinner } from '@/components/match-detail-winner';
import { TeamPanel } from '@/components/team-panel';
import { getMatchDetail, sortTeamsBySide } from '@/lib/api';
export default async function MatchDetailPage({
  params
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const {
    id
  } = await params;
  try {
    const match = await getMatchDetail(id);
    const teams = sortTeamsBySide(match.teams);
    const winner = teams.find(team => team.id === match.winnerTeamId) ?? null;
    const allPlayers = teams.flatMap(team => team.players);
    const mvpPlayer = allPlayers.length > 0 ? allPlayers.reduce((prev, current) => {
      if (current.kda !== prev.kda) {
        return current.kda > prev.kda ? current : prev;
      }

      if (current.kills !== prev.kills) {
        return current.kills > prev.kills ? current : prev;
      }

      if (current.deaths !== prev.deaths) {
        return current.deaths < prev.deaths ? current : prev;
      }

      return prev;
    }) : null;
    return <div className="relative min-h-screen overflow-hidden pb-20">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0DA6A620_1px,transparent_1px),linear-gradient(to_bottom,#0DA6A620_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>
        <div className="absolute -left-20 top-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[160px]"></div>

        <div className="relative z-10 py-12 lg:py-20">
          <MatchDetailHero clubName={match.club.name} playedAt={match.playedAt} />

          <div className="space-y-8">
            <div className="container mx-auto max-w-[1400px] px-2 sm:px-4 space-y-8">
              <MatchDetailWinner side={winner?.side || null} />

              <MatchDetailStats map={match.map} mode={match.mode} score1={teams[0].score} score2={teams[1].score} clubAddress={match.club.address} playersCount={allPlayers.length} mvpNickname={mvpPlayer?.nickname || ''} mvpKda={mvpPlayer?.kda || 0} mvpKills={mvpPlayer?.kills || 0} mvpDeaths={mvpPlayer?.deaths || 0} />

              <div className="grid gap-6 lg:grid-cols-2">
                {teams.map(team => <TeamPanel key={team.id} team={team} />)}
              </div>
            </div>

            <div className="mt-20 w-full">
              <CostCalculatorCTA />
            </div>
          </div>
        </div>
      </div>;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Матч не найден';
    return <div className="px-4 pb-20 pt-28 text-center lg:pt-36">
        <h1 className="text-3xl font-black uppercase text-white">Матч недоступен</h1>
        <p className="mt-4 font-mono text-sm text-slate-400">{message}</p>
        <Link href="/matches" className="mt-8 inline-block font-bold uppercase tracking-widest text-primary hover:underline">
          Вернуться к истории
        </Link>
      </div>;
  }
}
