'use client';

import React from 'react';
const rules = [{
  title: 'Возрастные ограничения',
  text: 'Участвовать в матчах SHOOTER VR могут игроки от 6 лет. Игровые механики и оборудование адаптированы для безопасной игры.'
}, {
  title: 'Рекомендуемое время прибытия',
  text: 'Приходите за 10-15 минут до начала забронированного времени. Это необходимо для прохождения инструктажа и настройки оборудования перед матчем.'
}, {
  title: 'Одежда и обувь',
  text: 'Матчи проходят на специальном покрытии. Рекомендуется удобная, не стесняющая движения спортивная одежда и сменная обувь.'
}, {
  title: 'Право отказа',
  text: 'К игре не допускаются лица в состоянии алкогольного или наркотического опьянения. Безопасность игроков на арене — наш приоритет.'
}, {
  title: 'Отношение к оборудованию',
  text: 'Мы используем современные VR-гарнитуры и контроллеры-оружие. Игроки несут ответственность за сохранность выданного на матч оборудования.'
}, {
  title: 'Запись на игру',
  text: 'Для гарантированного участия рекомендуем записываться заранее. При отмене брони менее чем за 24 часа возврат средств не производится.'
}, {
  title: 'Безопасность на арене',
  text: 'SHOOTER VR — динамичная игра с активными перемещениями. Внимательно слушайте инструктора и соблюдайте правила нахождения на игровой зоне.'
}];
export function RulesSection() {
  return <section className="relative py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 flex flex-col items-center text-center lg:items-start lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
            ПРАВИЛА&nbsp;
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#601F8C]">
              ИГРЫ
            </span>
          </h2>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2">
          {rules.map((rule, index) => <div key={index} className="group relative overflow-hidden rounded-xl border border-white/5 bg-background/40 p-8 transition-all duration-500 hover:border-primary/30 hover:bg-background/60">
              <div className="absolute -right-4 -top-4 text-8xl font-black text-white/[0.03] transition-colors group-hover:text-primary/5">
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-primary opacity-0 transition-opacity group-hover:opacity-100"></div>

              <div className="relative z-10 space-y-4">
                <h3 className="flex items-center gap-3 text-xl lg:text-2xl font-black uppercase text-white tracking-tight">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  {rule.title}
                </h3>

                <p className="text-slate-400 font-mono text-sm leading-relaxed lg:text-base">
                  {rule.text}
                </p>

                <div className="pt-2">
                  <div className="h-px w-full bg-gradient-to-r from-primary/20 to-transparent"></div>
                </div>
              </div>
            </div>)}

          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/5 bg-transparent p-8 text-center opacity-50">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Остались вопросы?
            </p>
            <p className="mt-2 text-sm text-slate-500">Свяжитесь с нами любым удобным способом</p>
          </div>
        </div>
      </div>

      <div className="absolute -right-64 top-1/4 -z-10 h-96 w-96 rounded-full bg-[#1D04BF]/5 blur-[120px]"></div>
    </section>;
}
