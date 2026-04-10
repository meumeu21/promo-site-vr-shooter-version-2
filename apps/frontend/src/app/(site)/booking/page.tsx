import { BookingApplicationPreview } from '@/components/booking-application-preview';
import { BookingWizard } from '@/components/booking-wizard';

export default function BookingPage() {
  return <div className="relative min-h-screen overflow-hidden pb-20 pt-24 lg:pt-32">
    <div className="absolute inset-0 z-0 opacity-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0DA6A620_1px,transparent_1px),linear-gradient(to_bottom,#0DA6A620_1px,transparent_1px)] bg-[size:40px_40px]"></div>
    </div>
    <div className="absolute -left-20 top-20 h-[520px] w-[520px] rounded-full bg-[#601F8C]/15 blur-[160px]"></div>
    <div className="absolute -right-16 top-1/3 h-[440px] w-[440px] rounded-full bg-primary/10 blur-[150px]"></div>

    <section className="relative z-10 px-4 pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="max-w-3xl space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-primary/70">Booking</p>
          <h1 className="font-heading text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
            Запись на игру
          </h1>
          <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
            Страница показывает будущий сценарий бронирования и сразу направляет на рабочий способ записи, пока внутренняя
            форма проходит финальную доработку.
          </p>
        </div>

        <BookingApplicationPreview />

        <BookingWizard />
      </div>
    </section>
  </div>;
}
