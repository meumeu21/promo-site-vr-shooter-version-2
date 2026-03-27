import { Trophy } from 'lucide-react';
import { getHistoryPageHref } from '@/components/match-history';
interface MatchesEmptyProps {
  limit: number;
}
export const MatchesEmpty = ({
  limit
}: MatchesEmptyProps) => {
  return <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-8 py-16 text-center backdrop-blur-sm">
      <Trophy className="mx-auto h-14 w-14 text-slate-600" />
      <h2 className="mt-5 text-2xl font-black uppercase text-white">
        Матчи по выбранным фильтрам не найдены
      </h2>
      <p className="mx-auto mt-3 max-w-xl font-mono text-sm text-slate-400">
        Попробуй сменить клуб или диапазон дат. Пагинация работает автоматически — можно безопасно
        расширять окно выборки.
      </p>
      <a href={getHistoryPageHref({
      limit: String(limit)
    })} className="mt-6 inline-flex items-center justify-center rounded-xl border border-primary/30 bg-primary/10 px-6 py-3 text-xs font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-background">
        Сбросить фильтры
      </a>
    </div>;
};
