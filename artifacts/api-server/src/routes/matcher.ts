import { Router } from "express";
import { getOpenAI } from "@workspace/integrations-openai-ai-server";

const matcherRouter = Router();

const PATHWAYS = [
  {
    id: "domestic-career",
    name: "Start a Career in Canada",
    description: "OSAP-funded diploma programs for domestic residents & new immigrants",
    bestFor: "Canadian residents, newcomers, and PR holders seeking funded career training in healthcare, trades, business, and tech",
  },
  {
    id: "study-international",
    name: "Study Internationally",
    description: "Admissions support for international students applying to top Canadian colleges",
    bestFor: "Students outside Canada who want to study at a recognized Canadian institution",
  },
  {
    id: "corporate-training",
    name: "Corporate Training & Upskilling",
    description: "Custom workforce training and upskilling programs for businesses and organizations",
    bestFor: "Employed professionals, HR managers, and businesses wanting to upskill their teams or transition careers",
  },
  {
    id: "business-consulting",
    name: "Business Consulting",
    description: "Cross-border business setup, trade facilitation, market entry strategy between Canada and Africa",
    bestFor: "Entrepreneurs, business owners, and corporate representatives looking to expand between Canada and Africa",
  },
];

matcherRouter.post("/match", async (req, res) => {
  const { currentRole, skills, goals } = req.body as {
    currentRole?: string;
    skills?: string;
    goals?: string;
  };

  if (!currentRole || !goals) {
    res.status(400).json({ error: "Current role and goals are required." });
    return;
  }

  const systemPrompt = `You are an expert advisor for PRAIT Consulting Inc., a Canada/Africa cross-border education and career development company. Your job is to analyze a visitor's profile and recommend the single best PRAIT pathway for them.

The available pathways are:
${PATHWAYS.map((p) => `- ${p.name}: ${p.bestFor}`).join("\n")}

You must respond with a JSON object in exactly this format:
{
  "recommendedPathway": "<pathway name exactly as listed>",
  "pathwayId": "<pathway id exactly as listed>",
  "confidence": "<High|Medium>",
  "headline": "<a short, punchy 1-sentence recommendation headline tailored to this person, max 15 words>",
  "reasoning": "<2-3 sentences explaining why this pathway is the best fit for them specifically>",
  "nextStep": "<1 specific action they should take next, e.g. 'Book a free consultation to explore OSAP funding options for your Healthcare Diploma'>",
  "alternativePathway": "<name of a secondary pathway they might also consider, or null>"
}

Be warm, encouraging, and specific to their situation. Do not recommend pathways that don't fit. Always pick the single best match.`;

  const userMessage = `My current role: ${currentRole}
My skills: ${skills || "Not specified"}
What I'm looking for: ${goals}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const choice = completion.choices[0];
    const raw = choice?.message?.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`No JSON in response`);
    const result = JSON.parse(jsonMatch[0]);

    res.status(200).json({ success: true, result });
  } catch (err) {
    req.log.error({ err }, "AI matcher failed");
    res.status(500).json({ error: "Failed to analyze your profile. Please try again." });
  }
});

export default matcherRouter;
