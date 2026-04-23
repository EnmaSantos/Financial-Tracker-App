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
        <div className="label-kicker">Updated {asOf}</div>
        <div
          className="display mt-1"
          style={{ fontSize: "clamp(44px, 6vw, 68px)" }}
        >
          {firstName}&rsquo;s money
        </div>
      </div>
      <div className="text-right">
        <div className="label-mono">since {joinedYear}</div>
        <div className="font-serif-text italic text-[14px] text-ink-2 mt-1.5">
          a clearer view of where things stand
        </div>
      </div>
    </header>
  );
}
