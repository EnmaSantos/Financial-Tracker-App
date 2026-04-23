import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Create account · Equitas" };

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="label-kicker">New here</div>
        <h1 className="display" style={{ fontSize: 28 }}>
          Create your account.
        </h1>
      </header>
      <AuthForm mode="signup" />
      <p className="text-center font-sans text-[11px] text-ink-3">
        Want to look around first?{" "}
        <Link href="/#demos" className="text-ink underline">
          Browse the public demos
        </Link>
        .
      </p>
    </div>
  );
}
