import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = { title: "Forgot password · Equitas" };

export default function ForgotPasswordPage() {
  const enabled = isSupabaseConfigured();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="label-kicker">Password recovery</div>
        <h1 className="display" style={{ fontSize: 28 }}>
          Reset via Supabase.
        </h1>
      </header>
      <ForgotPasswordForm enabled={enabled} />
    </div>
  );
}
