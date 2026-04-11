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

    const tokenUrl = isDirect
      ? `https://api.instagram.com/oauth/access_token`
      : `https://graph.facebook.com/v19.0/oauth/access_token`;

    console.log("Token exchange params:", {
      tokenUrl,
      client_id: clientId,
      redirect_uri: redirectUri,
      isDirect,
      codeLength: code?.length,
      hasSecret: !!clientSecret,
      secretLength: clientSecret?.length,
    });

    let tokenRes: Response;

    if (isDirect) {
      // Basic Display API requires multipart/form-data for code exchange
      const formData = new FormData();
      formData.append("client_id", clientId);
      formData.append("client_secret", clientSecret);
      formData.append("grant_type", "authorization_code");
      formData.append("redirect_uri", redirectUri);
      formData.append("code", code);

      tokenRes = await fetch(tokenUrl, {
        method: "POST",
        body: formData,
      });
    } else {
      // Graph API uses application/x-www-form-urlencoded
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code: code,
      });

      tokenRes = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });
    }

    const responseText = await tokenRes.text();
    console.log("Raw token response:", responseText.substring(0, 300));

    let tokenData: any;
    try {
      tokenData = JSON.parse(responseText);
    } catch (e) {
      throw new Error(
        `Instagram returned non-JSON (status ${tokenRes.status}): ${responseText.substring(0, 150)}`
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

    let longLived: { access_token: string; expires_in: number };
    
    if (isDirect) {
      // For Instagram Login for Business, the token returned from api.instagram.com 
      // is already a long-lived token (usually 60 days).
      console.log("Direct connection: Using token from Stage 1 as long-lived");
      longLived = {
        access_token: tokenData.access_token,
        expires_in: 5183944 // ~60 days default
      };
    } else {
      longLived = await getLongLivedToken(tokenData.access_token, isDirect);
    }

    const igAccounts = await getInstagramAccounts(longLived.access_token, isDirect, tokenData.user_id);

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
        console.error(
          "Supabase upsert error for account",
          account.id,
          upsertError
        );
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