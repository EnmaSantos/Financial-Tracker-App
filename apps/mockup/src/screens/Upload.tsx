import { useRef, useState } from "react";
import { Card, Pill, SectionHead, fmt$ } from "../design/ui";
import { useParseStatement } from "../lib/queries";

const STEPS = [
  "Loading statement…",
  "Extracting transactions…",
  "Matching merchants…",
  "Categorizing spending…",
];

export function Upload() {
  const parse = useParseStatement();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(fileName: string) {
    setBusy(true);
    setStep(0);
    for (let i = 0; i < STEPS.length; i++) {
      // Visual pacing — the real parse call resolves fast in mock mode.
      await new Promise((r) => setTimeout(r, 420));
      setStep(i + 1);
    }
    await parse.mutateAsync(fileName);
    setBusy(false);
  }

  return (
    <>
      <SectionHead
        kicker="Upload"
        title="Bring your statements in"
        subtitle="Drop a PDF. We'll pretend to read it (for now)."
      />

      <Card>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: "1.5px dashed var(--rule)",
            borderRadius: "var(--radius-l)",
            padding: "60px 32px",
            textAlign: "center",
            cursor: "pointer",
            background: "var(--paper)",
          }}
        >
          <div className="display" style={{ fontSize: 28 }}>
            Drop a PDF statement
          </div>
          <div style={{ color: "var(--ink-3)", marginTop: 8, fontFamily: "var(--sans)", fontSize: 13 }}>
            or click to browse · Chase · Amex · Bank of America · Fidelity
          </div>
          <input
            type="file"
            ref={fileRef}
            hidden
            accept="application/pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f.name);
            }}
          />
        </div>

        {busy && (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            {STEPS.map((s, i) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  color: i < step ? "var(--ink)" : "var(--ink-3)",
                  fontFamily: "var(--sans)",
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: i < step ? "var(--accent)" : "var(--rule)",
                  }}
                />
                {s}
              </div>
            ))}
          </div>
        )}

        {parse.data && (
          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <div className="label-kicker">Review</div>
                <div style={{ fontFamily: "var(--serif-display)", fontSize: 22, marginTop: 4 }}>
                  {parse.data.fileName}
                </div>
                <div className="label-mono" style={{ marginTop: 4 }}>
                  {parse.data.range}
                </div>
              </div>
              <Pill tone="accent">{parse.data.transactions.length} txns</Pill>
            </div>
            <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
              <tbody>
                {parse.data.transactions.map((t, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--rule)" }}>
                    <td
                      className="label-mono"
                      style={{ padding: "10px 0", width: 100 }}
                    >
                      {t.date}
                    </td>
                    <td style={{ padding: "10px 0", fontFamily: "var(--serif-text)" }}>
                      {t.merchant}
                      <div className="label-mono" style={{ marginTop: 2 }}>
                        {t.category}
                      </div>
                    </td>
                    <td
                      className="num"
                      style={{
                        padding: "10px 0",
                        textAlign: "right",
                        color: t.amount < 0 ? "var(--ink)" : "var(--positive)",
                      }}
                    >
                      {fmt$(t.amount, { signed: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
