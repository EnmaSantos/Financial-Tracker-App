type Props = {
  name: string;
  asOf: string;
  joinedYear: number;
};

export function Masthead({ name, asOf, joinedYear }: Props) {
  const firstName = name.split(" ")[0] ?? name;
  return (
    <header className="masthead-row">
      <div>
        <div className="label-kicker">Issue · {asOf}</div>
        <div
          className="display mt-1"
          style={{ fontSize: "clamp(44px, 6vw, 68px)" }}
        >
          {firstName}&rsquo;s ledger
        </div>
      </div>
      <div className="text-right">
        <div className="label-mono">established {joinedYear}</div>
        <div className="font-serif-text italic text-[14px] text-ink-2 mt-1.5">
          a quiet record of where you&rsquo;re going
        </div>
      </div>
    </header>
  );
}
