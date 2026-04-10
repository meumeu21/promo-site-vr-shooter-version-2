const panelClassName = 'group relative overflow-hidden rounded-xl border border-white/5 bg-background/40 p-8 transition-all duration-500 hover:border-primary/30 hover:bg-background/60';
const sectionTitleClassName = 'font-heading text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl';

const benefitCards = [
  {
    title: 'Игровой продукт',
    description: 'SHOOTER VR подается как отдельная командная игра с матчами, картами и историей результатов, а не как абстрактная VR-услуга.',
    detailLabel: 'Понятное позиционирование'
  },
  {
    title: 'Повторные сессии',
    description: 'Матчевый формат, соревновательная динамика и сравнение результатов создают основу для повторных визитов игроков.',
    detailLabel: 'Возврат аудитории'
  },
  {
    title: 'Пост-матчевый интерес',
    description: 'История матчей и детальная статистика помогают обсуждать итоги встреч после игры и усиливают ценность игрового опыта.',
    detailLabel: 'Сценарий возврата'
  }
];

export const BusinessBenefits = () => {
  return (
    <section className="relative z-10 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
          <p className="font-heading text-xs uppercase tracking-[0.4em] text-primary/60">ПРЕИМУЩЕСТВА ФОРМАТА</p>
          <h2 className={sectionTitleClassName}>
            Почему&nbsp;
            <span className="bg-gradient-to-r from-primary to-[#601F8C] bg-clip-text text-transparent">
              SHOOTER VR
            </span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {benefitCards.map((card, idx) => (
            <article key={card.title} className={panelClassName}>
              <div className="font-heading absolute -right-4 -top-4 text-8xl font-black text-white/[0.03] transition-colors group-hover:text-primary/5">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div className="absolute left-0 top-0 h-4 w-4 border-l border-t border-primary opacity-0 transition-opacity group-hover:opacity-100"></div>

              <div className="relative z-10 space-y-3">
                <div className="space-y-2">
                  <h3 className="font-heading flex items-center gap-3 text-xl font-black uppercase tracking-tight text-white lg:text-2xl">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    {card.title}
                  </h3>

                  <p className="font-mono text-sm leading-relaxed text-slate-400 lg:text-base">
                    {card.description}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="h-px w-full bg-gradient-to-r from-primary/20 to-transparent"></div>
                </div>

                <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500 transition-colors group-hover:text-primary/50">
                  {card.detailLabel}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
