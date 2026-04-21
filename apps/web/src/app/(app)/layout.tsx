import { Sidebar } from "@/components/shell/Sidebar";
import { requireUser } from "@/lib/auth";

/**
 * Guarded layout — every route below it requires a session. `requireUser`
 * redirects to /login when the cookie is missing/invalid, so child pages
 * can safely assume an authenticated viewer.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={user.name} />
      <main
        className="flex-1"
        style={{ padding: "40px 48px 80px", maxWidth: 1280 }}
      >
        {children}
      </main>
    </div>
  );
}
