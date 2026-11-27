// shots.js — the screenshot stager. A ?shot= parameter in the page URL
// stages one fixed moment of the game (title, play, chase, caught or
// escaped) and freezes the simulation there, so a browser capture shows
// the same real frame every time. Nothing here is a mock-up: the staged
// states are built from the same World, Turkey and Farmer the game plays
// with, and drawn by the same render code. Without the parameter the game
// simply starts on its title screen.
import { GROUND_Y, TURKEY_H } from './config.js';

export function shotFromUrl() {
  try {
    return new URLSearchParams(window.location.search).get('shot');
  } catch {
    return null;
  }
}

function cornArc(world, x, baseY) {
  for (let i = 0; i < 4; i += 1) {
    world.pickups.push({
      kind: 'corn',
      x: x + i * 34,
      y: baseY + Math.abs(i - 1.5) * 26,
      r: 13,
      taken: false,
    });
  }
}

// A mid-run frame in the farmyard: the turkey mid-jump over a knife,
// an oven ahead, corn in the air, the farmer closing in behind.
function stagePlay(game) {
  game.resetRun(20261127);
  const { world, turkey, farmer } = game;
  world.distance = 214;
  world.corn = 5;
  world.score = Math.floor(world.distance * 10) + world.corn * 100;
  world.farmerGap = 14;
  farmer.gap = 14;
  world.obstacles = [
    { kind: 'pin', x: 430, y: GROUND_Y - 22, w: 46, h: 22, passed: false },
    { kind: 'knife', x: 620, y: GROUND_Y - 26, w: 36, h: 26, passed: false },
    { kind: 'oven', x: 820, y: GROUND_Y - 88, w: 68, h: 88, passed: false },
  ];
  world.pickups = [];
  cornArc(world, 590, GROUND_Y - 150);
  turkey.y = GROUND_Y - TURKEY_H - 96;
  turkey.vy = -220;
  turkey.onGround = false;
  game.state = 'playing';
  game.frozen = true;
}

// The kitchen stretch, nearly caught: one heart left, the farmer right
// behind, the turkey stumbling over an oven's edge.
function stageChase(game) {
  game.resetRun(777001);
  const { world, turkey, farmer } = game;
  world.distance = 812;
  world.corn = 17;
  world.score = Math.floor(world.distance * 10) + world.corn * 100;
  world.lives = 1;
  world.farmerGap = 10;
  farmer.gap = 10;
  world.obstacles = [
    { kind: 'oven', x: 560, y: GROUND_Y - 88, w: 68, h: 88, passed: false },
    { kind: 'knife', x: 760, y: GROUND_Y - 26, w: 36, h: 26, passed: false },
  ];
  world.pickups = [];
  cornArc(world, 700, GROUND_Y - 150);
  turkey.stumbleTimer = 0.45;
  turkey.invulnerableTimer = 0.9;
  game.state = 'playing';
  game.frozen = true;
}

// The end screens, staged with fixed numbers so the capture is stable.
function stageCaught(game) {
  game.resetRun(424242);
  const { world, farmer } = game;
  world.distance = 486;
  world.corn = 9;
  world.score = Math.floor(world.distance * 10) + world.corn * 100;
  world.lives = 0;
  world.farmerGap = 0;
  farmer.gap = 0;
  farmer.caughtPose = true;
  world.finished = true;
  world.outcome = 'caught';
  game.endGame('caught', true);
  game.frozen = true;
}

function stageEscaped(game) {
  game.resetRun(999331);
  const { world, farmer } = game;
  world.distance = 1000;
  world.corn = 23;
  world.score = Math.floor(world.distance * 10) + world.corn * 100;
  world.lives = 2;
  world.farmerGap = 48;
  farmer.gap = 48;
  world.finished = true;
  world.outcome = 'escaped';
  game.endGame('escaped', true);
  game.frozen = true;
}

export function applyShot(game, name) {
  if (name === 'play') stagePlay(game);
  else if (name === 'chase') stageChase(game);
  else if (name === 'caught') stageCaught(game);
  else if (name === 'escaped') stageEscaped(game);
  else if (name === 'title') game.toTitle();
}
