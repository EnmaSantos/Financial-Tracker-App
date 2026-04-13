import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { plaidClient } from "@/lib/plaid";
import { CountryCode, Products } from "plaid";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const plaidItemId = body.plaidItemId as string | undefined;

    let accessToken: string | undefined;
    if (plaidItemId) {
      const item = await prisma.plaidItem.findUnique({
        where: { id: plaidItemId, userId: session.user.id },
      });
      if (item) {
        accessToken = decrypt(item.accessTokenEncrypted);
      }
    }

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: session.user.id },
      client_name: "Equitas Financial",
      products: accessToken ? undefined : [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
      access_token: accessToken,
      webhook: process.env.PLAID_WEBHOOK_URL || undefined,
    });

    return NextResponse.json({ linkToken: response.data.link_token });
  } catch (error) {
    console.error("create-link-token error:", error);
    return NextResponse.json(
      { error: "Failed to create link token" },
      { status: 500 }
    );
  }
}
