import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { plaidClient } from "@/lib/plaid";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { categorizePlaidError } from "@/lib/plaid-errors";
import { z } from "zod";

const syncSchema = z.object({
  plaidItemId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { plaidItemId } = syncSchema.parse(body);

    const plaidItem = await prisma.plaidItem.findUnique({
      where: { id: plaidItemId, userId: session.user.id },
      include: { bankAccounts: true },
    });

    if (!plaidItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const accessToken = decrypt(plaidItem.accessTokenEncrypted);
    const accountMap = new Map(
      plaidItem.bankAccounts.map((a) => [a.plaidAccountId, a.id])
    );

    let cursor = plaidItem.cursor ?? undefined;
    let added = 0;
    let modified = 0;
    let removed = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor: cursor || undefined,
      });

      const data = response.data;

      for (const txn of data.added) {
        const bankAccountId = accountMap.get(txn.account_id);
        if (!bankAccountId) continue;

        await prisma.transaction.upsert({
          where: { plaidTransactionId: txn.transaction_id },
          create: {
            bankAccountId,
            plaidTransactionId: txn.transaction_id,
            amount: txn.amount,
            date: new Date(txn.date),
            name: txn.name,
            merchantName: txn.merchant_name ?? null,
            categoryPrimary: txn.personal_finance_category?.primary ?? null,
            categoryDetailed: txn.personal_finance_category?.detailed ?? null,
            pending: txn.pending,
            isoCurrencyCode: txn.iso_currency_code ?? "USD",
          },
          update: {
            amount: txn.amount,
            date: new Date(txn.date),
            name: txn.name,
            merchantName: txn.merchant_name ?? null,
            categoryPrimary: txn.personal_finance_category?.primary ?? null,
            categoryDetailed: txn.personal_finance_category?.detailed ?? null,
            pending: txn.pending,
          },
        });
        added++;
      }

      for (const txn of data.modified) {
        const bankAccountId = accountMap.get(txn.account_id);
        if (!bankAccountId) continue;

        await prisma.transaction.upsert({
          where: { plaidTransactionId: txn.transaction_id },
          create: {
            bankAccountId,
            plaidTransactionId: txn.transaction_id,
            amount: txn.amount,
            date: new Date(txn.date),
            name: txn.name,
            merchantName: txn.merchant_name ?? null,
            categoryPrimary: txn.personal_finance_category?.primary ?? null,
            categoryDetailed: txn.personal_finance_category?.detailed ?? null,
            pending: txn.pending,
            isoCurrencyCode: txn.iso_currency_code ?? "USD",
          },
          update: {
            amount: txn.amount,
            date: new Date(txn.date),
            name: txn.name,
            merchantName: txn.merchant_name ?? null,
            categoryPrimary: txn.personal_finance_category?.primary ?? null,
            categoryDetailed: txn.personal_finance_category?.detailed ?? null,
            pending: txn.pending,
          },
        });
        modified++;
      }

      for (const removedTxn of data.removed) {
        if (removedTxn.transaction_id) {
          await prisma.transaction
            .delete({
              where: { plaidTransactionId: removedTxn.transaction_id },
            })
            .catch(() => {});
          removed++;
        }
      }

      cursor = data.next_cursor;
      hasMore = data.has_more;
    }

    // Refresh balances and snapshot
    const balancesResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    for (const account of balancesResponse.data.accounts) {
      const bankAccountId = accountMap.get(account.account_id);
      if (!bankAccountId) continue;

      await prisma.bankAccount.update({
        where: { plaidAccountId: account.account_id },
        data: {
          currentBalance: account.balances.current,
          availableBalance: account.balances.available,
          lastSynced: new Date(),
        },
      });

      await prisma.balanceSnapshot.create({
        data: {
          bankAccountId,
          balance: account.balances.current ?? 0,
        },
      });
    }

    await prisma.plaidItem.update({
      where: { id: plaidItemId },
      data: {
        cursor,
        lastSynced: new Date(),
        status: "HEALTHY",
        errorCode: null,
      },
    });

    return NextResponse.json({
      success: true,
      added,
      modified,
      removed,
    });
  } catch (error) {
    const categorized = categorizePlaidError(error);

    if (categorized.category === "ITEM_ERROR") {
      await prisma.plaidItem
        .update({
          where: { id: (await request.json()).plaidItemId },
          data: {
            status: "ERROR",
            errorCode: categorized.code,
          },
        })
        .catch(() => {});
    }

    console.error("sync error:", categorized);
    return NextResponse.json(
      { error: categorized.message, code: categorized.code },
      { status: 500 }
    );
  }
}
