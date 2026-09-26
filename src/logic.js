// QVAC Villain Motivation Generator — core logic.
// Turns a hero + central conflict into a grounded antagonist motivation
// tied to that specific setup (not a generic "wants power" motivation).

import { completion } from "@qvac/sdk";

function looksUnusable(text) {
  if (!text || text.trim().length < 10) return true;
  const bad = ["i cannot", "i can't", "as an ai", "i'm not able", "not enough information"];
  const lower = text.toLowerCase();
  return bad.some((phrase) => lower.includes(phrase));
}

function stripPreamble(text) {
  return text
    .trim()
    .replace(/^here'?s[^:\n]*:\s*/i, "")
    .replace(/^sure[,!]?\s*/i, "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
}

function significantWords(str) {
  const STOP = new Set([
    "the", "and", "for", "with", "that", "this", "from", "have", "has",
    "their", "they", "them", "who", "what", "when", "where", "into",
    "about", "over", "your", "story", "hero", "central", "conflict",
  ]);
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));
}

function isGrounded(text, hero, conflict) {
  const inputWords = new Set([...significantWords(hero), ...significantWords(conflict)]);
  if (inputWords.size === 0) return true;
  const outputWords = new Set(significantWords(text));
  let overlap = 0;
  for (const w of inputWords) if (outputWords.has(w)) overlap++;
  return overlap >= 1;
}

function fallbackMotivation(hero, conflict) {
  return (
    `The antagonist believes they are the one truly justified in this: given "${conflict.trim()}", ` +
    `they see ${hero.trim()}'s involvement as the real threat, and their opposition is a direct, personal ` +
    `response to what that conflict cost them — not cartoonish evil, just someone convinced they're in the right.`
  );
}

export async function generate(modelId, { hero, conflict }) {
  const heroText = (hero || "").trim();
  const conflictText = (conflict || "").trim();
  if (!heroText || !conflictText) {
    return { error: "Please describe both your hero and the central conflict." };
  }

  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "You help writers develop antagonists. Given a hero description and the story's central conflict, " +
          "write ONE grounded, believable motivation for an antagonist that is tied specifically to that hero and " +
          "conflict — reference concrete details from what was given, not generic villain tropes like 'wants power' " +
          "or 'is evil'. Reply with ONLY the motivation in 2-4 sentences, no preamble.",
      },
      {
        role: "user",
        content:
          "Hero: A young mechanic named Rosa who discovers she can repair ancient magical machines.\n" +
          "Conflict: The town's water supply depends on a machine only Rosa can fix, but fixing it will flood the mines where her rival's family works.",
      },
      {
        role: "assistant",
        content:
          "The antagonist is the rival's older brother, a mine foreman who stands to lose the livelihood of everyone " +
          "in the mines if Rosa fixes the machine. He's not against Rosa personally — he's watched his crew's families " +
          "struggle before and sees her 'fix' as an outsider's solution that ignores who actually pays the cost. " +
          "He'll sabotage her work not out of malice, but because he genuinely believes protecting the mines matters more.",
      },
      { role: "user", content: `Hero: ${heroText}\nConflict: ${conflictText}` },
    ],
    stream: true,
    completionOpts: { temperature: 0.8, maxTokens: 250 },
  });

  let text = "";
  for await (const token of run.tokenStream) text += token;
  text = stripPreamble(text);

  const motivation = (!looksUnusable(text) && isGrounded(text, heroText, conflictText))
    ? text
    : fallbackMotivation(heroText, conflictText);

  return { motivation };
}
