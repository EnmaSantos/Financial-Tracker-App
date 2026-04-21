import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@ledger/db";
import { readSession } from "./session";

/**
 * Auth helpers built on top of the session cookie.
 *
 * `getCurrentUser` returns null when unauthenticated; `requireUser` redirects
 * to /login. Use the latter from RSC page components and server actions so
 * unauthenticated traffic never sees a user's data.
 *
 * React's `cache()` deduplicates the Prisma lookup within a single request,
 * so multiple server components calling `getCurrentUser` cost one query.
 */

export const getCurrentUser = cache(async () => {
  const session = await readSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      retireAge: true,
      returnRate: true,
      joinedYear: true,
      incomeNet: true,
      incomeGross: true,
      expensesMonthly: true,
    },
  });
  return user ?? null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
