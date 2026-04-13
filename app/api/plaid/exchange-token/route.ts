import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { plaidClient } from "@/lib/plaid";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { z } from "zod";

const exchangeSchema = z.object({
  publicToken: z.string().min(1),
  institutionId: z.string().optional(),
  institutionName: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { publicToken, institutionId, institutionName } =
      exchangeSchema.parse(body);

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const { access_token, item_id } = exchangeResponse.data;

    const plaidItem = await prisma.plaidItem.upsert({
      where: { itemId: item_id },
      create: {
        userId: session.user.id,
        itemId: item_id,
        accessTokenEncrypted: encrypt(access_token),
        institutionId: institutionId ?? null,
        institutionName: institutionName ?? null,
        status: "HEALTHY",
      },
      update: {
        accessTokenEncrypted: encrypt(access_token),
        status: "HEALTHY",
        errorCode: null,
      },
    });

    const accountsResponse = await plaidClient.accountsGet({
      access_token,
    });

    for (const account of accountsResponse.data.accounts) {
      await prisma.bankAccount.upsert({
        where: { plaidAccountId: account.account_id },
        create: {
          plaidItemId: plaidItem.id,
          plaidAccountId: account.account_id,
          name: account.name,
          officialName: account.official_name ?? null,
          type: account.type,
          subtype: account.subtype ?? null,
          currentBalance: account.balances.current,
          availableBalance: account.balances.available,
          isoCurrencyCode: account.balances.iso_currency_code ?? "USD",
          lastSynced: new Date(),
        },
        update: {
          name: account.name,
          officialName: account.official_name ?? null,
          type: account.type,
          subtype: account.subtype ?? null,
          currentBalance: account.balances.current,
          availableBalance: account.balances.available,
          isoCurrencyCode: account.balances.iso_currency_code ?? "USD",
          lastSynced: new Date(),
        },
      });
    }

    // Trigger initial sync
    const syncUrl = new URL("/api/plaid/sync", request.url);
    fetch(syncUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plaidItemId: plaidItem.id }),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      itemId: plaidItem.id,
      accountCount: accountsResponse.data.accounts.length,
    });
  } catch (error) {
    console.error("exchange-token error:", error);
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 }
    );
  }
}
