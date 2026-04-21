import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Sign in · Equitas" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="label-kicker">Sign in</div>
        <h1 className="display" style={{ fontSize: 28 }}>
          Welcome back.
        </h1>
      </header>
      <AuthForm mode="login" />
      <p className="font-sans text-[11px] text-ink-3 text-center">
        Demo accounts: <span className="font-mono">maya@example.com</span>,{" "}
        <span className="font-mono">david@example.com</span>,{" "}
        <span className="font-mono">linda@example.com</span> · password{" "}
        <span className="font-mono">password123</span>
      </p>
    </div>
  );
}
