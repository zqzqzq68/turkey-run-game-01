// main.ts — the entrypoint the grader runs (Node 22, `node /bot/main.ts`).
// It hands the game in: copy game/ and screenshots/ from this repository
// into the output directory, then write /output/dossier.json with
// buildDossier from vendor/makefun-game.ts. Nothing here depends on the
// clock, the network or the environment, so two runs write the same bytes.
import { copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The caps the gate holds the game to: at most 993 files and 48 MiB under
// game/, 3 to 4 screenshots of at most 256 KiB each, and 160 KiB of text.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
};

function copyTree(fromDir: string, toDir: string): void {
  mkdirSync(toDir, { recursive: true });
  const names = readdirSync(fromDir).sort();
  for (const name of names) {
    const from = join(fromDir, name);
    const to = join(toDir, name);
    if (statSync(from).isDirectory()) copyTree(from, to);
    else copyFileSync(from, to);
  }
}

function main(): void {
  const repoRoot = fileURLToPath(new URL('.', import.meta.url));
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outDir, { recursive: true });
  copyTree(join(repoRoot, 'game'), join(outDir, 'game'));
  copyTree(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));
  const dossier = buildDossier(outDir, CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

main();
