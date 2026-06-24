import { Resend } from "resend";

let connectionSettings: { settings: { api_key: string; from_email: string } } | null = null;

async function getReplitCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error("X-Replit-Token not found for repl/depl");
  }

  if (!hostname) {
    throw new Error("REPLIT_CONNECTORS_HOSTNAME not set");
  }

  const data = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=resend",
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    },
  )
    .then((res) => res.json())
    .then((d: { items?: typeof connectionSettings[] }) => d.items?.[0]);

  connectionSettings = data ?? null;

  if (!connectionSettings?.settings?.api_key) {
    throw new Error("Resend not connected — check integration");
  }

  return {
    apiKey: connectionSettings.settings.api_key,
    fromEmail: connectionSettings.settings.from_email,
  };
}

async function getCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (apiKey && fromEmail) {
    return { apiKey, fromEmail };
  }

  return getReplitCredentials();
}

export async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail,
  };
}
