const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(
  secret: string,
  token: string,
  remoteip?: string
): Promise<{ success: boolean; errorCodes?: string[] }> {
  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteip) {
    body.set("remoteip", remoteip);
  }

  const res = await fetch(SITEVERIFY_URL, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const data = (await res.json()) as {
    success: boolean;
    "error-codes"?: string[];
  };

  return {
    success: data.success === true,
    errorCodes: data["error-codes"],
  };
}
