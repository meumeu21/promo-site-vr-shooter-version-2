import { Construction } from 'lucide-react';
export const ComingSoon = () => {
  return <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl animate-pulse"></div>
        <Construction className="relative h-20 w-20 text-primary" />
      </div>
      <h2 className="font-heading text-4xl font-black uppercase tracking-tighter text-white sm:text-6xl">
        Раздел в{' '}
        <span className="text-primary" style={{
        textShadow: '0 0 15px rgba(13, 166, 166, 0.5)'
      }}>
          разработке
        </span>
      </h2>
      <p className="mt-6 max-w-lg font-mono text-sm uppercase tracking-widest text-slate-400 sm:text-base">
        Мы готовим нечто крутое. Совсем скоро здесь появится возможность записи и подробная
        информация.
      </p>
      <div className="mt-10 h-1 w-24 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
    </div>;
};
