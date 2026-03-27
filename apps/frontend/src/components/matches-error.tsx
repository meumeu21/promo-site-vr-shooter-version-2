interface MatchesErrorProps {
  message: string;
}
export const MatchesError = ({
  message
}: MatchesErrorProps) => {
  return <div className="px-4 pb-20 pt-28 lg:pt-36">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-amber-500/20 bg-amber-500/5 px-8 py-12 text-center">
        <h1 className="text-3xl font-black uppercase text-white">
          История матчей временно недоступна
        </h1>
        <p className="mt-4 font-mono text-sm text-amber-100/80">{message}</p>
      </div>
    </div>;
};
