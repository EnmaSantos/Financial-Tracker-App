import "server-only";

import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@ledger/db";

function fallbackName(email: string | null | undefined) {
  const localPart = email?.split("@")[0]?.trim();
  return localPart && localPart.length > 0 ? localPart : "Member";
}

function resolveName(
  rawName: unknown,
  email: string | null | undefined,
) {
  const text = typeof rawName === "string" ? rawName.trim() : "";
  return text.length > 0 ? text : fallbackName(email);
}

export async function ensureMirrorUser({
  id,
  email,
  name,
}: {
  id: string;
  email: string | null | undefined;
  name?: string;
}) {
  const resolvedEmail = email ?? null;
  const resolvedName = resolveName(name, email);
  const existingById = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      age: true,
      retireAge: true,
      returnRate: true,
      joinedYear: true,
      incomeNet: true,
      incomeGross: true,
      expensesMonthly: true,
    },
  });

  if (existingById) {
    return prisma.user.update({
      where: { id },
      data: {
        email: resolvedEmail,
        name: resolvedName,
      },
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
  }

  const existingByEmail = resolvedEmail
    ? await prisma.user.findUnique({
        where: { email: resolvedEmail },
      })
    : null;

  if (existingByEmail && existingByEmail.id !== id) {
    const migratedEmail = `${existingByEmail.id}.migrated.${resolvedEmail}`;

    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existingByEmail.id },
        data: { email: migratedEmail },
      });

      await tx.user.create({
        data: {
          id,
          email: resolvedEmail,
          name: resolvedName,
          passwordHash: null,
          age: existingByEmail.age,
          retireAge: existingByEmail.retireAge,
          returnRate: existingByEmail.returnRate,
          joinedYear: existingByEmail.joinedYear,
          incomeNet: existingByEmail.incomeNet,
          incomeGross: existingByEmail.incomeGross,
          expensesMonthly: existingByEmail.expensesMonthly,
        },
      });

      await tx.account.updateMany({
        where: { userId: existingByEmail.id },
        data: { userId: id },
      });
      await tx.goal.updateMany({
        where: { userId: existingByEmail.id },
        data: { userId: id },
      });
      await tx.milestone.updateMany({
        where: { userId: existingByEmail.id },
        data: { userId: id },
      });
      await tx.transaction.updateMany({
        where: { userId: existingByEmail.id },
        data: { userId: id },
      });

      await tx.user.delete({
        where: { id: existingByEmail.id },
      });

      return tx.user.findUniqueOrThrow({
        where: { id },
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
    });
  }

  return prisma.user.upsert({
    where: { id },
    update: {
      email: resolvedEmail,
      name: resolvedName,
    },
    create: {
      id,
      email: resolvedEmail,
      name: resolvedName,
      passwordHash: null,
      incomeNet: 0,
      incomeGross: 0,
      expensesMonthly: 0,
    },
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
}

export async function ensureMirrorUserFromSupabaseUser(user: SupabaseUser) {
  return ensureMirrorUser({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.["name"],
  });
}
