export const BusinessHero = () => {
  return (
    <div className="flex-1 space-y-8 text-center lg:text-left">
      <h1 className="font-heading flex flex-col gap-4 font-black uppercase leading-none tracking-tight text-white">
        <span className="text-5xl drop-shadow-[0_4px_15px_rgba(13,166,166,0.3)] sm:text-7xl lg:text-8xl">
          SHOOTER VR
        </span>
        <div className="relative inline-block self-center lg:self-start">
          <div className="absolute -inset-x-8 -inset-y-2 -skew-x-12 bg-gradient-to-r from-[#601F8C] to-[#1D04BF] shadow-[0_0_50px_rgba(96,31,140,0.6)]"></div>
          <span className="font-heading relative z-10 block whitespace-nowrap -skew-x-12 px-4 text-2xl font-black tracking-tighter text-white sm:text-4xl lg:text-5xl">
            ПОДКЛЮЧЕНИЕ ДЛЯ ПАРТНЕРОВ
          </span>
        </div>
      </h1>
      <p className="mx-auto max-w-2xl font-mono text-base leading-relaxed text-slate-200 drop-shadow-md md:text-xl lg:mx-0 lg:text-2xl">
        Подключите SHOOTER VR на площадке партнера и запустите у себя командную игру с матчами, картами и архивом завершенных встреч.
      </p>
      <div className="flex items-center justify-center gap-4 font-mono text-sm uppercase tracking-widest text-primary lg:justify-start">
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
        ПРОДУКТОВОЕ ПРЕДЛОЖЕНИЕ ДЛЯ ПЛОЩАДОК
      </div>
    </div>
  );
};
