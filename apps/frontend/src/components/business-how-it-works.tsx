const panelClassName = 'group relative overflow-hidden rounded-xl border border-white/5 bg-background/40 p-8 transition-all duration-500 hover:border-primary/30 hover:bg-background/60';
const sectionTitleClassName = 'font-heading text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl';

const howItWorks = [
  { step: '01', title: 'Заявка', description: 'Оставьте контакты и кратко опишите вашу площадку.' },
  { step: '02', title: 'Обсуждение', description: 'Сверим формат запуска SHOOTER VR с вашим пространством и задачами.' },
  { step: '03', title: 'Подключение', description: 'Определим технические требования, сценарий работы и формат запуска.' },
  { step: '04', title: 'Старт', description: 'После согласования можно переходить к запуску игры на площадке партнера.' }
];

export const BusinessHowItWorks = () => {
  return (
    <section className="relative z-10 bg-white/[0.01] py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
          <p className="font-heading text-xs uppercase tracking-[0.4em] text-primary/60">СЦЕНАРИЙ ПОДКЛЮЧЕНИЯ</p>
          <h2 className={sectionTitleClassName}>
            Путь&nbsp;
            <span className="bg-gradient-to-r from-primary to-[#601F8C] bg-clip-text text-transparent">
              партнера
            </span>
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {howItWorks.map((item, idx) => (
            <article key={item.step} className={panelClassName}>
              <div className="font-heading absolute -right-4 -top-4 text-8xl font-black text-white/[0.03] transition-colors group-hover:text-primary/5">
                {item.step}
              </div>
              <div className="absolute left-0 top-0 h-4 w-4 border-l border-t border-primary opacity-0 transition-opacity group-hover:opacity-100"></div>

              <div className="relative z-10 space-y-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-sm font-bold tracking-tighter text-primary">Step {item.step}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading flex items-center gap-3 text-lg font-black uppercase leading-tight tracking-tight text-white lg:text-xl">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    {item.title}
                  </h3>

                  <p className="font-mono text-xs leading-relaxed text-slate-400 lg:text-sm">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="h-px w-full bg-gradient-to-r from-primary/20 to-transparent"></div>
                </div>

                <div className="flex gap-1 pt-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-0.5 w-full rounded-full transition-colors duration-700 ${i <= idx ? 'bg-primary' : 'bg-white/10'}`}></div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
