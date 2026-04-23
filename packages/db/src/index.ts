import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __ledgerPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__ledgerPrisma ??
  new PrismaClient({
    log: process.env["DEBUG_PRISMA"] ? ["query", "error", "warn"] : ["error"],
  });

if (process.env["NODE_ENV"] !== "production") {
  globalThis.__ledgerPrisma = prisma;
}

export type {
  Prisma,
  Account,
  User,
  Goal,
  Milestone,
  Transaction,
  TransactionImportPreset,
} from "@prisma/client";
export { PrismaClient } from "@prisma/client";
