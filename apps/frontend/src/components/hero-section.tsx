import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function HeroSection() {
  return <section className="relative w-full overflow-hidden pb-12 pt-24 lg:pb-24 lg:pt-32">
      <div className="absolute inset-0 z-0 opacity-15">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0DA6A620_1px,transparent_1px),linear-gradient(to_bottom,#0DA6A620_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center">
          <div className="relative z-10 mb-12 shrink-0 lg:mb-0 lg:w-[65%]">
            <div className="relative mx-auto w-full overflow-hidden rounded-3xl shadow-[0_0_60px_rgba(29,4,191,0.25)] lg:mx-0">
              <Image src="/contents/family_vector_2.png" alt="VR Arena Players" width={1200} height={800} className="h-auto w-full object-cover contrast-[1.1] brightness-[0.9]" priority />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80 lg:to-background/60"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent"></div>
            </div>

            <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-[#601F8C]/15 blur-[120px]"></div>
            <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-[#1D04BF]/15 blur-[120px]"></div>
          </div>

          <div className="relative z-20 flex flex-col items-center text-center lg:-ml-40 lg:w-[45%] lg:items-end lg:pr-12 lg:text-right">
            <div className="mb-8 space-y-4">
              <h1 className="flex flex-col gap-3 font-black uppercase tracking-tight text-white">
                <span className="text-4xl drop-shadow-[0_4px_15px_rgba(13,166,166,0.3)] sm:text-5xl md:text-6xl lg:text-7xl">
                  SHOOTER VR
                </span>

                <div className="relative inline-block self-center lg:self-end">
                  <div className="absolute -inset-x-6 -inset-y-1 -skew-x-12 bg-gradient-to-r from-[#601F8C] to-[#1D04BF] shadow-[0_0_40px_rgba(96,31,140,0.5)]"></div>
                  <span className="relative z-10 block -skew-x-12 whitespace-nowrap px-2 text-2xl font-black text-white sm:text-3xl md:text-4xl lg:text-5xl">
                    ИСТОРИЯ МАТЧЕЙ
                  </span>
                </div>
              </h1>
            </div>

            <div className="max-w-xl">
              <p className="mb-10 font-mono text-base font-medium leading-relaxed text-slate-200 drop-shadow-md md:text-lg lg:text-xl">
                Командные матчи в виртуальной реальности. <br className="hidden md:block" />
                Выбирай карту, собирай отряд и возвращайся <br className="hidden md:block" />к
                истории матчей, чтобы разобрать результат.
              </p>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row">
              <Button asChild size="lg" className="h-16 bg-primary px-12 text-xl font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(13,166,166,0.4)] transition-all duration-300 hover:bg-[#0b8a8a] active:scale-95">
                <Link href="/booking">Запись на игру</Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="group h-16 border-primary/40 px-12 text-xl font-bold uppercase tracking-wider text-primary backdrop-blur-sm transition-all duration-300 hover:bg-primary/10 active:scale-95">
                <Link href="/matches" className="flex items-center gap-2">
                  История матчей
                  <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-[3px] w-full -skew-y-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30"></div>
    </section>;
}
