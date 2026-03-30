import type { MatchPlayerStats, MatchTeam } from '@/types/api';
import { DISPLAY_CONFIG } from '@/config/display';
const teamAccent = {
  home: {
    panel: 'border-red-500/20 bg-red-500/5',
    text: 'text-red-500',
    light: 'bg-red-500',
    bg: 'bg-red-500/10'
  },
  away: {
    panel: 'border-blue-500/20 bg-blue-500/5',
    text: 'text-blue-500',
    light: 'bg-blue-500',
    bg: 'bg-blue-500/10'
  }
} satisfies Record<MatchTeam['side'], {
  panel: string;
  text: string;
  light: string;
  bg: string;
}>;
interface TeamPanelProps {
  team: MatchTeam;
}
export const TeamPanel = ({
  team
}: TeamPanelProps) => {
  const accent = teamAccent[team.side];
  return <div className={`relative overflow-hidden border ${accent.panel} p-6 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.3)] backdrop-blur-md`}>
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="font-mono text-[11px] uppercase tracking-super-wide text-slate-500">
            Состав команды
          </p>
          <h2 className={`text-3xl font-black uppercase tracking-tighter ${accent.text}`}>
            {team.side === 'home' ? 'КРАСНЫЕ' : 'СИНИЕ'}
          </h2>
        </div>
        <div className="text-right space-y-0.5">
          <p className="font-mono text-[11px] uppercase tracking-super-wide text-slate-500">Счет</p>
          <p className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {team.score}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {team.players.map((player: MatchPlayerStats) => <div key={player.id} className="group relative flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.05] sm:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className={`h-10 w-1 shrink-0 rounded-full ${accent.light}`}></div>
              <div className="min-w-0">
                <p className="truncate font-bold uppercase tracking-tight text-white">{player.nickname}</p>
                {DISPLAY_CONFIG.match.showPlayerId && <p className="hidden font-mono text-[11px] text-slate-500 md:block">
                    ID игрока: {player.id.slice(0, 6)}
                  </p>}
              </div>
            </div>
 
            <div className="flex shrink-0 items-center gap-4 sm:gap-6">
              {DISPLAY_CONFIG.match.showPlayerStats && <>
                  <div className="hidden text-center w-16 md:block">
                    <p className="font-mono text-[11px] uppercase text-slate-500">Убийств</p>
                    <p className="font-black text-white">{player.kills}</p>
                  </div>
                  <div className="hidden text-center w-16 md:block">
                    <p className="font-mono text-[11px] uppercase text-slate-500">Смертей</p>
                    <p className="font-black text-slate-400">{player.deaths}</p>
                  </div>
                </>}
              {DISPLAY_CONFIG.match.showPlayerKda && <div className="text-center w-12 sm:w-14">
                  <p className="font-mono text-[11px] uppercase text-slate-500">K/D</p>
                  <p className={`font-black ${player.kda >= 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {player.kda.toFixed(1)}
                  </p>
                </div>}
            </div>
          </div>)}
      </div>
    </div>;
};
