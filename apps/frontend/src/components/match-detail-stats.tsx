import { Trophy, Users } from 'lucide-react';
import { formatMapLabel, formatModeLabel } from '@/lib/api';
import { DISPLAY_CONFIG } from '@/config/display';
interface MatchDetailStatsProps {
  map: string;
  mode: string;
  score1: number;
  score2: number;
  clubAddress: string;
  playersCount: number;
  mvpNickname: string;
  mvpKda: number;
  mvpKills: number;
  mvpDeaths: number;
}
export const MatchDetailStats = ({
  map,
  mode,
  score1,
  score2,
  clubAddress,
  playersCount,
  mvpNickname,
  mvpKda,
  mvpKills,
  mvpDeaths
}: MatchDetailStatsProps) => {
  return <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-md p-8">
        <div className="grid items-center gap-8 md:grid-cols-3">
          <div className="space-y-4">
            {DISPLAY_CONFIG.match.showMapMode && <div className="space-y-1">
                <p className="font-mono text-[11px] uppercase tracking-super-wide text-primary">
                  Карта
                </p>
                <p className="font-heading text-3xl font-black uppercase text-white">
                  {formatMapLabel(map)}
                </p>
                <div className="flex gap-4 pt-1">
                  <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-[clamp(9px,2.5vw,11px)] uppercase tracking-normal text-slate-300 whitespace-nowrap">
                    Режим: {formatModeLabel(mode)}
                  </div>
                </div>
              </div>}
          </div>

          <div className="relative flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-black/40 p-6 shadow-[inset_0_0_30px_rgba(13,166,166,0.1)]">
            {DISPLAY_CONFIG.match.showScoreline && <>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-cyber text-slate-500">
                  Счет матча
                </p>
                <div className="flex items-center gap-6">
                  <span className="text-6xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                    {score1}
                  </span>
                  <span className="text-3xl font-black text-slate-700">:</span>
                  <span className="text-6xl font-black text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    {score2}
                  </span>
                </div>
              </>}
          </div>

          <div className="space-y-4 text-right">
            {DISPLAY_CONFIG.match.showClubAddress && <div className="space-y-1">
                <p className="font-mono text-[11px] uppercase tracking-super-wide text-primary">
                  Данные матча
                </p>
                <p className="font-mono text-xs font-bold text-slate-300">{clubAddress}</p>
              </div>}
            <div className="flex justify-end gap-3 font-mono text-[11px] uppercase text-slate-500 tracking-wider">
              <Users className="h-3 w-3" />
              <span>Игроков в матче: {playersCount}</span>
            </div>
          </div>
        </div>
      </div>

      {DISPLAY_CONFIG.match.showMvpSection && <div className="relative flex flex-col justify-center overflow-hidden rounded-[2.5rem] border border-primary/20 bg-primary/5 p-8 shadow-[0_0_50px_rgba(13,166,166,0.05)] backdrop-blur-md transition-all">
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center border-r border-primary/20 pr-8">
              <p className="font-mono text-[11px] uppercase text-slate-500 tracking-widest mb-1">
                K/D
              </p>
              <p className="text-5xl font-black text-primary drop-shadow-[0_0_15px_rgba(13,166,166,0.3)]">
                {mvpKda.toFixed(1)}
              </p>
            </div>
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <Trophy className="h-6 w-6 text-primary drop-shadow-[0_0_10px_rgba(13,166,166,0.4)]" />
                <h3 className="text-lg font-black uppercase text-white leading-none">
                  Лучший игрок
                </h3>
              </div>
              <p className="font-mono text-[11px] uppercase text-slate-500 mb-1 leading-none">
                Никнейм
              </p>
              <p className="text-2xl font-black uppercase tracking-tight text-white leading-none">
                {mvpNickname || '—'}
              </p>
              <div className="mt-4 flex gap-4 font-mono text-[11px] font-bold uppercase text-slate-400">
                <span>Убийств: {mvpKills || '0'}</span>
                <span>Смертей: {mvpDeaths || '0'}</span>
              </div>
            </div>
          </div>
        </div>}
    </div>;
};
