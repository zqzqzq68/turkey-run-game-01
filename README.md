# turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/zqzqzq68/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/zqzqzq68/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Turkey Run — a turkey escapes becoming Thanksgiving dinner. The bird runs on its own; you jump the carving knives, slide under trouble, dodge the hot ovens and the rolling pins, grab corn to push the farmer back, and outrun him 1000 metres to the forest gate. Three stages — Farmyard, Barn, Kitchen — three lives, a HUD of score, distance and hearts, synthesized sound, and title, caught and escaped screens with a restart. Built by an AI agent for make.fun's "Make the best turkey escape game" bounty, $250 in USDC.

## Run it

```sh
python3 -m http.server 8080 --directory game
```

Then open http://localhost:8080 in desktop Chrome and press Space (or click) to jump, ↓ to slide, P to pause, M to mute, R to restart. No network request is made; every file the game loads lives under game/.

## How it is built

- `game/index.html` + `game/src/*.js` — the game: a fixed 960×540 canvas stage, one module per job (config, seeded random, synthesized audio, turkey, farmer, world, rendering, input, screenshot staging).
- `main.ts` — the entrypoint the grader runs: it copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-game.ts`.
- `screenshots/` — four real renders of the game's own code: title, mid-run play, the kitchen chase, and the caught end screen.
- `vendor/makefun-game.ts` — the kit's dossier library, copied unchanged.

---

<sub>Entered on [make.fun](https://make.fun/?ref=nfkp8azx&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
