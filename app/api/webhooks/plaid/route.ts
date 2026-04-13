import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { plaidClient } from "@/lib/plaid";
import { decrypt } from "@/lib/encryption";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { webhook_type, webhook_code, item_id, error } = body;

    console.log(`Plaid webhook: ${webhook_type}.${webhook_code} for ${item_id}`);

    const plaidItem = await prisma.plaidItem.findUnique({
      where: { itemId: item_id },
      include: { bankAccounts: true },
    });

    if (!plaidItem) {
      console.warn(`Webhook for unknown item: ${item_id}`);
      return NextResponse.json({ received: true });
    }

    if (webhook_type === "TRANSACTIONS") {
      const syncCodes = [
        "SYNC_UPDATES_AVAILABLE",
        "DEFAULT_UPDATE",
        "INITIAL_UPDATE",
        "HISTORICAL_UPDATE",
      ];

      if (syncCodes.includes(webhook_code)) {
        await syncItem(plaidItem);
      }
    }

    if (webhook_type === "ITEM") {
      if (webhook_code === "ERROR") {
        const errorCode = error?.error_code || "UNKNOWN_ERROR";
        await prisma.plaidItem.update({
          where: { id: plaidItem.id },
          data: {
            status: "ERROR",
            errorCode,
          },
        });
      }

      if (webhook_code === "PENDING_EXPIRATION") {
        await prisma.plaidItem.update({
          where: { id: plaidItem.id },
          data: { status: "STALE" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ received: true });
  }
}

async function syncItem(
  plaidItem: Awaited<ReturnType<typeof prisma.plaidItem.findUnique>> & {
    bankAccounts: Array<{ id: string; plaidAccountId: string }>;
  }
) {
  if (!plaidItem) return;

  const accessToken = decrypt(plaidItem.accessTokenEncrypted);
  const accountMap = new Map(
    plaidItem.bankAccounts.map((a) => [a.plaidAccountId, a.id])
  );

  let cursor = plaidItem.cursor ?? undefined;
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
    }

    for (const removedTxn of data.removed) {
      if (removedTxn.transaction_id) {
        await prisma.transaction
          .delete({
            where: { plaidTransactionId: removedTxn.transaction_id },
          })
          .catch(() => {});
      }
    }

    cursor = data.next_cursor;
    hasMore = data.has_more;
  }

  // Refresh balances
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
    where: { id: plaidItem.id },
    data: {
      cursor,
      lastSynced: new Date(),
      status: "HEALTHY",
      errorCode: null,
    },
  });
}
