export const MatchesHero = () => {
  return <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-6xl space-y-4">
        <h1 className="font-black uppercase tracking-tight text-white">
          <span className="block text-5xl sm:text-7xl lg:text-8xl">История матчей</span>
          <span className="block text-3xl text-slate-300 sm:text-5xl lg:text-6xl">
            по клубам SHOOTER VR
          </span>
        </h1>
        <p className="max-w-2xl font-mono text-sm leading-relaxed text-slate-300 sm:text-base">
          Архив завершённых встреч теперь собран по клубам.
        </p>
      </div>
    </header>;
};
