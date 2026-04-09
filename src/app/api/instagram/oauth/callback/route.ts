import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getLongLivedToken, getInstagramAccounts } from "@/lib/instagram";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (error) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=instagram_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_callback`);
  }

  // Decode state
  let userId: string;
  let isDirect = false;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64").toString());
    userId = decoded.userId;
    isDirect = !!decoded.isDirect;
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_state`);
  }

  try {
    const redirectUri = `${appUrl}/api/instagram/oauth/callback`;

    const clientId = isDirect
      ? process.env.INSTAGRAM_APP_ID
      : process.env.META_APP_ID;
    const clientSecret = isDirect
      ? process.env.INSTAGRAM_APP_SECRET
      : process.env.META_APP_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error(
        `Missing credentials: clientId=${!!clientId}, clientSecret=${!!clientSecret}, isDirect=${isDirect}`
      );
    }

    // FIX: Use the correct token exchange endpoint based on the flow type.
    // - isDirect (Instagram Basic Display API): use api.instagram.com
    // - Business Login / Graph API: use graph.facebook.com
    const tokenUrl = isDirect
      ? `https://api.instagram.com/oauth/access_token`
      : `https://graph.facebook.com/v19.0/oauth/access_token`;

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code: code,
    });

    console.log("Token exchange params:", {
      tokenUrl,
      client_id: clientId,
      redirect_uri: redirectUri,
      isDirect,
      codeLength: code?.length,
      hasSecret: !!clientSecret,
      secretLength: clientSecret?.length,
    });

    // Exchange code for short-lived token
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const responseText = await tokenRes.text();
    let tokenData: any;

    try {
      tokenData = JSON.parse(responseText);
    } catch (e) {
      console.error("Token response parse error:", e, "Raw response:", responseText.substring(0, 200));
      throw new Error(
        `Failed to parse token response: ${responseText.substring(0, 100)}`
      );
    }

    console.log("Token response:", {
      ok: tokenRes.ok,
      status: tokenRes.status,
      hasError: !!tokenData.error,
      errorMessage: tokenData.error?.message || tokenData.error_message,
    });

    if (!tokenRes.ok || tokenData.error) {
      throw new Error(
        tokenData.error?.message ||
          tokenData.error_message ||
          `Token exchange failed with status ${tokenRes.status}`
      );
    }

    // FIX: For isDirect (Basic Display API), the short-lived token field is
    // "access_token" but the long-lived exchange uses a different endpoint.
    // Make sure getLongLivedToken handles both flows correctly.
    const longLived = await getLongLivedToken(tokenData.access_token, isDirect);

    // Get Instagram accounts linked to this Facebook account (or the direct IG account)
    const igAccounts = await getInstagramAccounts(longLived.access_token, isDirect);

    if (igAccounts.length === 0) {
      const errorMessage = encodeURIComponent(
        'No Instagram Business account found. Ensure your Instagram is a "Business" or "Creator" account. ' +
          "If using Facebook login, ensure it is linked to a Facebook Page."
      );
      return NextResponse.redirect(
        `${appUrl}/dashboard?error=no_instagram_account&message=${errorMessage}`
      );
    }

    const supabase = await createAdminClient();
    const tokenExpiresAt = new Date(
      Date.now() + longLived.expires_in * 1000
    ).toISOString();

    // Save each Instagram account found
    for (const account of igAccounts) {
      const { error: upsertError } = await supabase
        .from("instagram_accounts")
        .upsert(
          {
            user_id: userId,
            ig_user_id: account.id,
            username: account.username,
            profile_pic_url: account.profile_picture_url,
            access_token: longLived.access_token,
            token_expires_at: tokenExpiresAt,
            is_active: true,
          },
          {
            onConflict: "ig_user_id",
          }
        );

      if (upsertError) {
        console.error("Supabase upsert error for account", account.id, upsertError);
      }
    }

    return NextResponse.redirect(
      `${appUrl}/dashboard?success=instagram_connected`
    );
  } catch (err) {
    console.error("Instagram OAuth error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=oauth_failed&message=${encodeURIComponent(message)}`
    );
  }
}