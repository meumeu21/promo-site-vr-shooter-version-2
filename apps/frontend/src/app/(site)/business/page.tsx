import { ComingSoon } from '@/components/coming-soon';
export default function BusinessPage() {
  return <section className="relative min-h-screen overflow-hidden bg-background px-4 py-12 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-3xl space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-primary/70">Business</p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
            Партнёрам
          </h1>
          <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
            Партнёрская поверхность временно переведена в состояние «В разработке».
          </p>
        </div>

        <ComingSoon />
      </div>
    </section>;
}
