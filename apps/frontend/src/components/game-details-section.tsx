'use client';

import React from 'react';
import Image from 'next/image';
import { Info } from 'lucide-react';
export function GameDetailsSection() {
  return <section className="relative w-full overflow-hidden py-16 lg:py-28">
      <div className="absolute inset-0 z-0">
        <Image src="/contents/shoter_background.webp" alt="Game Background" fill className="opacity-80 brightness-[1] contrast-[1.1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-16 flex justify-center lg:justify-start">
          <div className="relative inline-block">
            <div className="absolute -inset-x-8 -inset-y-2 -skew-x-12 bg-gradient-to-r from-[#601F8C] to-[#1D04BF] shadow-[0_0_40px_rgba(96,31,140,0.3)]"></div>
            <h2 className="relative z-10 text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white -skew-x-12">
              ПОДРОБНЕЙ ПРО ИГРУ SHOOTER VR
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-20">
          <div className="space-y-10 lg:w-1/2">
            <div className="space-y-6">
              <p className="text-xl lg:text-2xl font-bold text-white leading-snug">
                Командный тактический шутер в виртуальной реальности, где две команды сражаются друг
                против друга.
              </p>
              <p className="text-primary font-mono text-base lg:text-lg">
                [ Супер-реалистичный VR-шутер с современной графикой, точной физикой оружия и полной
                свободой перемещения! ]
              </p>
              <p className="text-slate-400 font-mono text-sm lg:text-base leading-relaxed">
                Множество уникальных карт, разнообразный арсенал и несколько игровых режимов —
                выбирай свой стиль сражения и отправляйся на поле боя. Продуманный левел-дизайн,
                современное оборудование, качественная картинка и звук - все это SHOOTER VR!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
              <div className="space-y-1">
                <p className="text-xs font-mono text-primary uppercase tracking-widest">Возраст</p>
                <p className="text-xl lg:text-2xl font-black text-white uppercase">Для всех (6+)</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-mono text-primary uppercase tracking-widest">Карты</p>
                <p className="text-xl lg:text-2xl font-black text-white uppercase">
                  Множество арен
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-mono text-primary uppercase tracking-widest">Игроки</p>
                <p className="text-xl lg:text-2xl font-black text-white uppercase">
                  Командный формат
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-mono text-primary uppercase tracking-widest">Режим</p>
                <p className="text-xl lg:text-2xl font-black text-white uppercase">PvP Шутер</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary via-[#601F8C] to-[#1D04BF] opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-700"></div>

              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
                <iframe src="https://vkvideo.ru/video_ext.php?oid=-224730488&id=456239078&hash=cd9542f48e90d3f9" width="100%" height="100%" frameBorder="0" allowFullScreen={true} className="bg-black" allow="autoplay; encrypted-media; fullscreen; picture-in-picture"></iframe>
              </div>

              <div className="absolute -top-4 -right-4 h-12 w-12 border-t-2 border-r-2 border-primary opacity-40"></div>
              <div className="absolute -bottom-4 -left-4 h-12 w-12 border-b-2 border-l-2 border-[#1D04BF] opacity-40"></div>
            </div>

            <p className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
              <Info className="h-3 w-3 text-primary" />
              Станьте героем новой реальности прямо сейчас
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-2 w-full -skew-y-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20"></div>
    </section>;
}
