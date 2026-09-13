import OpenAI from "openai";

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set. Configure AI in .env.");
  return new OpenAI({ apiKey });
}

/**
 * Thin wrapper around the OpenAI-compatible chat completion API. The AI
 * Store Builder and in-dashboard assistant (Phase 10) call this — never the
 * SDK directly — so the underlying model/provider can change in one place.
 */
export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
      { role: "user" as const, content: prompt },
    ],
  });

  return completion.choices[0]?.message?.content ?? "";
}
