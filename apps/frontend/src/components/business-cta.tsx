import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BusinessCTA = () => {
  return (
    <section className="relative z-10 px-2 pb-12 pt-10 sm:pb-16 sm:pt-12 lg:pb-20 lg:pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-[linear-gradient(135deg,rgba(96,31,140,0.2),rgba(29,4,191,0.15),rgba(9,9,20,0.94))] px-6 py-12 shadow-[0_0_80px_rgba(29,4,191,0.15)] backdrop-blur-xl sm:px-12 sm:py-16">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(29,4,191,0.15),transparent_70%)] lg:block" />

          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-6">
              <p className="font-heading text-xs uppercase tracking-[0.4em] text-primary/80">ГОТОВЫ ОБСУДИТЬ ЗАПУСК?</p>
              <h2 className="font-heading text-3xl font-black uppercase leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
                Если SHOOTER VR подходит вашей площадке, переходите к предметному обсуждению
              </h2>
              <p className="font-mono text-sm leading-7 text-slate-300 opacity-80 sm:text-base">
                Оставьте заявку, чтобы обсудить формат подключения, игровые сценарии и условия запуска продукта у партнера.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 sm:w-80">
              <Button asChild size="lg" className="h-16 w-full rounded-2xl bg-primary text-background shadow-[0_0_30px_rgba(13,166,166,0.3)] transition-transform hover:scale-105">
                <Link href="https://drive-vr.ru/#rec818741749">Отправить заявку</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 w-full rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10">
                <Link href="/booking" className="flex items-center justify-center gap-3">
                  Запись на игру
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
