import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Sign in · Equitas" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="label-kicker">Sign in</div>
        <h1 className="display" style={{ fontSize: 28 }}>
          Welcome back.
        </h1>
      </header>
      {error ? (
        <p className="font-mono text-[11px] text-negative">{error}</p>
      ) : null}
      <AuthForm mode="login" />
      <p className="text-center font-sans text-[11px] text-ink-3">
        Want to preview the product first?{" "}
        <Link href="/#demos" className="text-ink underline">
          Explore the public demos
        </Link>
        .
      </p>
    </div>
  );
}
