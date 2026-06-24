import OpenAI from "openai";

let client: OpenAI | undefined;

export function getOpenAI(): OpenAI {
  if (client) return client;

  const apiKey =
    process.env.OPENAI_API_KEY ?? process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL =
    process.env.OPENAI_BASE_URL ?? process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY must be set. Add it in your Render environment variables.",
    );
  }

  client = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });

  return client;
}

/** @deprecated Use getOpenAI() so missing keys fail at request time, not import time. */
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return Reflect.get(getOpenAI(), prop);
  },
});
