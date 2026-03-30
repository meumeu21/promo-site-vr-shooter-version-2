interface MatchDetailWinnerProps {
  side: string | null;
}
export const MatchDetailWinner = ({
  side
}: MatchDetailWinnerProps) => {
  return <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-visible py-4">
    <div className="flex w-fit items-stretch">
      <div className="w-[max(0.5rem,calc((100vw-1400px)/2+0.5rem))] shrink-0 bg-[#0DA5A5] sm:w-[max(1rem,calc((100vw-1400px)/2+1rem))]"></div>
      <div className="relative -ml-px bg-[#0DA5A5] py-3 pr-8 shadow-[0_0_30px_rgba(13,165,165,0.25)] [clip-path:polygon(0%_0%,calc(100%_-_24px)_0%,100%_20%,100%_80%,calc(100%_-_24px)_100%,0%_100%)] sm:pr-24">
        <p className="relative z-10 block whitespace-nowrap text-lg font-heading font-black uppercase tracking-[0.2em] text-white sm:text-3xl">
          ПОБЕДИТЕЛЬ:
          {side === 'home' ? ' КРАСНЫЕ' : side === 'away' ? ' СИНИЕ' : ' НИЧЬЯ'}
        </p>
      </div>
    </div>
  </div>;
};
