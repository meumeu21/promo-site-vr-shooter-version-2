'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight } from 'lucide-react';
export function CostCalculatorCTA() {
  return <section className="relative w-full overflow-hidden py-16 lg:py-24">

      <div className="absolute left-0 top-1/2 -z-10 h-full w-1/2 -translate-y-1/2 bg-[#601F8C]/5 blur-[120px]"></div>
      <div className="absolute right-0 top-1/2 -z-10 h-full w-1/2 -translate-y-1/2 bg-primary/5 blur-[120px]"></div>

      <div className="absolute left-0 top-0 z-20 h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan"></div>

      <div className="w-full px-6 lg:px-16 sm:px-12">
        <div className="lg:px-20 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">

          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[1.1]">
              ГОТОВЫ К <br />
              <span className="text-primary">ПЕРВОМУ МАТЧУ?</span>
            </h2>

            <p className="flex items-center gap-3 text-primary font-mono text-sm sm:text-lg lg:text-xl tracking-wider">
              <span className="opacity-50">[</span>
              <span>ЗАПИШИТЕСЬ НА ИГРУ И ПОЛУЧИТЕ ИНСТРУКЦИИ</span>
              <span className="opacity-50">]</span>
            </p>
          </div>

          <div className="flex items-center gap-8 lg:gap-16">

            <div className="hidden xl:flex items-center gap-4 text-primary opacity-40">
              <div className="h-[2px] w-32 bg-gradient-to-r from-transparent to-primary"></div>
              <ArrowRight className="h-10 w-10 animate-pulse" />
            </div>

            <div className="relative group w-full sm:w-auto">

              <div className="absolute -inset-1 bg-primary opacity-20 blur-xl group-hover:opacity-50 transition-opacity duration-500"></div>

              <Button asChild className="relative h-20 w-full sm:w-80 bg-primary border-none px-12 text-xl font-black uppercase tracking-[0.15em] text-background hover:bg-[#0dc2c2] transition-all duration-300 shadow-[0_0_30px_rgba(13,166,166,0.3)] active:scale-95 clip-tech">
                <Link
                  href="https://drive-vr.ru/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-4"
                >
                  <span>Записаться</span>
                  <Target className="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 h-px w-64 bg-gradient-to-r from-primary/40 to-transparent"></div>
      <div className="absolute bottom-0 right-0 h-px w-64 bg-gradient-to-l from-primary/40 to-transparent"></div>

      <style jsx global>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
        .animate-scan {
          animation: scan 6s linear infinite;
        }
        .clip-tech {
          clip-path: polygon(8% 0%, 100% 0%, 100% 70%, 92% 100%, 0% 100%, 0% 30%);
        }
      `}</style>
    </section>;
}
