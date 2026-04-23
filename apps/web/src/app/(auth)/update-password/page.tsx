import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = { title: "Update password · Equitas" };

export default function UpdatePasswordPage() {
  const enabled = isSupabaseConfigured();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="label-kicker">Recovery link</div>
        <h1 className="display" style={{ fontSize: 28 }}>
          Choose a new password.
        </h1>
      </header>
      <UpdatePasswordForm enabled={enabled} />
    </div>
  );
}
