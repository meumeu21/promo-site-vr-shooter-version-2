import React from 'react';
import Image from 'next/image';
const events = [{
  id: 'match',
  title: 'Командный матч',
  subtitle: 'Собирай свой отряд и докажи превосходство на арене',
  description: 'Формируйте команды, выбирайте карты и сражайтесь в динамичных PvP режимах. Слаженная работа, тактическое мышление и быстрая реакция — ключи к победе.',
  image: '/contents/friends_image.png',
  thumbnails: ['/contents/friends_vector_1.png', '/contents/friends_vector_2.png'],
  align: 'left'
}, {
  id: 'tournaments',
  title: 'Киберспортивные турниры',
  subtitle: 'Соревнуйтесь за звание лучших игроков',
  description: 'Регулярные турниры для самых амбициозных игроков. Зарабатывайте рейтинговые очки, поднимайтесь в таблице лидеров и выигрывайте призы.',
  image: '/contents/corporate_image.png',
  thumbnails: ['/contents/corporate_vector_1.png', '/contents/corporate_vector_2.png'],
  align: 'right'
}, {
  id: 'training',
  title: 'Тренировка',
  subtitle: 'Отрабатывайте навыки и изучайте карты',
  description: 'Изучайте новые тактики, тренируйте стрельбу и осваивайте каждый уголок на картах, чтобы в бою быть на шаг впереди.',
  image: '/contents/family_image.png',
  thumbnails: ['/contents/family_vector_1.png', '/contents/family_vector_2.png'],
  align: 'left'
}];
export function EventsSection() {
  return <section className="relative py-12 lg:py-24">

      <div className="mb-16 lg:mb-24">
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_15px_rgba(13,166,166,0.3)]">
          Игровые форматы
        </h2>
      </div>

      <div className="space-y-24 lg:space-y-48">
        {events.map(event => <div key={event.id} className={`flex flex-col gap-12 lg:flex-row lg:items-center ${event.align === 'right' ? 'lg:flex-row-reverse' : ''}`}>

            <div className="relative z-10 lg:w-1/2">

              <div className="absolute -left-10 -top-10 opacity-20 pointer-events-none -z-10">
                <svg width="300" height="300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                  <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                  <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="2" fill="currentColor" />
                </svg>
              </div>

              <h3 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-black uppercase leading-tight text-white">
                {event.title}
              </h3>

              <p className="mb-6 text-primary font-mono text-sm sm:text-base leading-relaxed">
                [ {event.subtitle} ]
              </p>

              {event.thumbnails && <div className="mb-8 flex gap-4">
                  {event.thumbnails.map((thumb, idx) => <div key={idx} className="h-24 w-40 overflow-hidden rounded-lg border border-white/10 shadow-lg lg:h-32 lg:w-48">
                      <Image src={thumb} alt="" width={400} height={300} className="h-full w-full object-cover" />
                    </div>)}
                </div>}

              <p className="text-slate-300 font-mono text-sm sm:text-base leading-relaxed lg:max-w-xl">
                {event.description}
              </p>
            </div>

            <div className="relative lg:w-1/2">
              <div className="relative overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(13,166,166,0.15)] border border-white/5">
                <Image src={event.image} alt={event.title} width={1200} height={1500} className="h-[400px] w-full object-cover sm:h-[500px] lg:h-[650px] contrast-[1.1]" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
              </div>

              <div className={`absolute -bottom-6 -right-6 h-32 w-32 border-b-2 border-r-2 border-primary opacity-30 ${event.align === 'right' ? '-left-6 -right-auto border-r-0 border-l-2' : ''}`}></div>
            </div>
          </div>)}
      </div>
    </section>;
}
