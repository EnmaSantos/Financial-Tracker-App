import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Create account · Equitas" };

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="label-kicker">New here</div>
        <h1 className="display" style={{ fontSize: 28 }}>
          Start your ledger.
        </h1>
      </header>
      <AuthForm mode="signup" />
    </div>
  );
}
