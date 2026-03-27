import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatMatchDateTimeDots } from '@/lib/api';
interface MatchDetailHeroProps {
  clubName: string;
  playedAt: string;
}
export const MatchDetailHero = ({
  clubName,
  playedAt
}: MatchDetailHeroProps) => {
  const [firstPart, ...rest] = clubName.split(' ');
  const secondPart = rest.join(' ');
  return <header className="container mx-auto max-w-[1400px] px-2 sm:px-4 mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
      <div className="space-y-6">
        <Link href="/matches" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-300 transition-colors hover:border-primary/30 hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Ко всем матчам
        </Link>

        <h1 className="flex flex-col gap-2 font-black uppercase tracking-tight text-white leading-none">
          <span className="text-5xl sm:text-7xl lg:text-8xl drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {firstPart}{' '}
            <span className="text-primary" style={{
            textShadow: '0 0 15px rgba(13, 166, 166, 0.5)'
          }}>
              {secondPart}
            </span>
          </span>
        </h1>
      </div>

      <div className="flex h-fit items-center gap-8 border-l border-white/10 pl-8">
        <div className="text-center">
          <p className="mb-1 font-mono text-[11px] uppercase text-slate-500 tracking-widest">
            Дата и время
          </p>
          <p className="font-mono font-bold text-white whitespace-nowrap">
            {formatMatchDateTimeDots(playedAt)}
          </p>
        </div>
      </div>
    </header>;
};
