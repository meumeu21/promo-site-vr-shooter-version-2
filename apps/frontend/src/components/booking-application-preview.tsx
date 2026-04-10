import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BookingApplicationPreview = () => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block" />

        <div className="relative z-10 flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="space-y-3">
              <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
                Онлайн-заявка скоро появится на сайте
              </h2>
            </div>
          </div>

          <Button
            asChild
            size="lg"
            className="h-12 w-full rounded-2xl border-none bg-amber-300 px-4 text-sm text-black shadow-[0_0_30px_rgba(245,158,11,0.22)] hover:bg-amber-200 sm:h-14 sm:w-auto sm:px-6 sm:text-base"
          >
            <Link
              href="https://drive-vr.ru/#BukzaContainer31692"
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 sm:gap-3"
            >
              Оформить запись сейчас
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
