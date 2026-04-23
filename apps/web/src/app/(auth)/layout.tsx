import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

/**
 * Auth layout. Mirrored styling against the app shell but without the
 * sidebar. If the viewer already has a valid session, send them home —
 * a signed-in user has no business on the sign-in screen.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/app");

  return (
    <main className="min-h-screen grid place-items-center px-6 py-16">
      <div className="w-full" style={{ maxWidth: 380 }}>
        <div className="mb-10 text-center">
          <div className="display" style={{ fontSize: 32, letterSpacing: "-0.02em" }}>
            Equitas
          </div>
          <div className="label-mono mt-1">a quiet record</div>
        </div>
        {children}
      </div>
    </main>
  );
}
