# QVAC-Villain-Motivation-Generator

Describe your story's hero and central conflict, get a believable antagonist motivation tied to that specific conflict. On-device AI, no cloud call, no API key.

## Run

```bash
npm install
npm start
```

Then open http://localhost:30107

## QVAC SDK version

`@qvac/sdk` ^0.19.0 (see `package.json`).

## How it works

Built on [Tether's QVAC SDK](https://www.npmjs.com/package/@qvac/sdk) — all inference runs on-device, no cloud call, no API key. The app loads `LLAMA_3_2_1B_INST_Q4_0` locally with `loadModel()`, generates with `completion()` (streamed via `tokenStream`), and releases the model with `unloadModel()` on shutdown. The GUI (`src/gui.js`) is a small HTTP server: the page POSTs the form fields to `/api/villain`, which calls `generate(modelId, { hero, conflict })` in `src/logic.js`.

## Example

**Input:** Hero: "A young mechanic named Rosa who discovers she can repair ancient magical machines." — Conflict: "The town's water supply depends on a machine only Rosa can fix, but fixing it will flood the mines where her rival's family works."

**Output:** "The antagonist is the rival's older brother, a mine foreman who stands to lose the livelihood of everyone in the mines if Rosa fixes the machine. He's not against Rosa personally — he's watched his crew's families struggle before and sees her 'fix' as an outsider's solution that ignores who actually pays the cost..."

## Grounding & fallback

`isGrounded()` extracts the significant (4+ letter, non-stopword) words from the hero and conflict text and checks that the generated motivation actually reuses at least one of them — this is what stops the model from defaulting to a generic "wants power" villain untethered from the actual story. If that check fails, or the output looks unusable, `fallbackMotivation()` builds a motivation that quotes the conflict and hero directly instead.

## License

MIT
