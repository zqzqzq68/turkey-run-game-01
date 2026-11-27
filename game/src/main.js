// main.js — the game itself: the state machine (title, playing, paused,
// caught, escaped), the frame loop, the screens and their buttons, and the
// wiring between input, world, turkey, farmer and sound.
import {
  FARMER_START_GAP,
  GOAL_DISTANCE,
  GROUND_Y,
  VIEW_H,
  VIEW_W,
} from './config.js';
import { SoundBank } from './audio.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { World } from './world.js';
import { Input } from './input.js';
import {
  drawClouds,
  drawCorn,
  drawGround,
  drawHills,
  drawHUD,
  drawKitchenInterior,
  drawKnife,
  drawOven,
  drawPie,
  drawPin,
  drawProps,
  drawSky,
} from './render.js';
import { applyShot, shotFromUrl } from './shots.js';

function loadBest() {
  try {
    return Number(window.localStorage.getItem('turkey-run-best') || 0) || 0;
  } catch {
    return 0;
  }
}

function saveBest(score) {
  try {
    window.localStorage.setItem('turkey-run-best', String(score));
  } catch {
    // Storage is unavailable (private mode, file://): the run still counts.
  }
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sounds = new SoundBank();
    this.state = 'title';
    this.time = 0;
    this.runTime = 0;
    this.frozen = false; // screenshot staging freezes the simulation
    this.buttons = []; // {x, y, w, h, action} rebuilt every frame
    this.best = loadBest();
    this.finalStats = null;
    this.resetRun((Date.now() % 2147483647) >>> 0);
    this.toTitle();
    this.input = new Input(canvas, {
      onJump: () => this.pressJump(),
      onSlide: () => this.pressSlide(),
      onPause: () => this.pressPause(),
      onMute: () => this.pressMute(),
      onRestart: () => this.pressRestart(),
      onConfirm: () => this.pressConfirm(),
      onClick: (x, y) => this.pressClick(x, y),
    });
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resetRun(seed) {
    this.world = new World(seed);
    this.turkey = new Turkey();
    this.farmer = new Farmer();
    this.farmer.gap = FARMER_START_GAP;
    this.runTime = 0;
    this.finalStats = null;
  }

  toTitle() {
    this.state = 'title';
    this.resetRun(1234567);
    this.frozen = false;
  }

  startRun() {
    this.sounds.ensure();
    this.sounds.gobble();
    this.resetRun((Date.now() % 2147483647) >>> 0);
    this.state = 'playing';
    this.frozen = false;
    this.sounds.startMusic();
  }

  endGame(outcome, silent = false) {
    this.state = outcome;
    this.finalStats = {
      score: this.world.score,
      distance: Math.floor(this.world.distance),
      corn: this.world.corn,
      time: this.runTime,
    };
    if (this.finalStats.score > this.best) {
      this.best = this.finalStats.score;
      saveBest(this.best);
    }
    this.sounds.stopMusic();
    if (!silent) {
      if (outcome === 'caught') this.sounds.caught();
      else this.sounds.escaped();
    }
  }

  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = VIEW_W * dpr;
    this.canvas.height = VIEW_H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --- input ---------------------------------------------------------------

  pressJump() {
    this.sounds.ensure();
    if (this.state === 'title') {
      this.startRun();
      return;
    }
    if (this.state === 'playing' && !this.frozen) this.turkey.jump(this.sounds);
  }

  pressSlide() {
    this.sounds.ensure();
    if (this.state === 'playing' && !this.frozen) this.turkey.slide(this.sounds);
  }

  pressPause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.sounds.stopMusic();
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.sounds.startMusic();
    }
  }

  pressMute() {
    this.sounds.ensure();
    this.sounds.setMuted(!this.sounds.muted);
  }

  pressRestart() {
    if (this.state === 'playing' || this.state === 'paused' || this.state === 'caught' || this.state === 'escaped') {
      this.startRun();
    }
  }

  pressConfirm() {
    if (this.state === 'title') this.startRun();
    else if (this.state === 'caught' || this.state === 'escaped') this.startRun();
    else if (this.state === 'paused') this.pressPause();
  }

  pressClick(x, y) {
    this.sounds.ensure();
    for (const b of this.buttons) {
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        if (b.action === 'start' || b.action === 'restart') this.startRun();
        else if (b.action === 'resume') this.pressPause();
        else if (b.action === 'mute') this.pressMute();
        return;
      }
    }
    if (this.state === 'playing') this.pressJump();
  }

  // --- loop ------------------------------------------------------------------

  frame(now) {
    const dt = Math.min(0.05, (now - (this.lastNow ?? now)) / 1000 || 0);
    this.lastNow = now;
    this.time += dt;
    if (!this.frozen && this.state === 'playing') this.update(dt);
    else if (!this.frozen && this.state === 'title') this.updateBackdrop(dt);
    this.render();
    window.requestAnimationFrame((t) => this.frame(t));
  }

  updateBackdrop(dt) {
    // The title screen lives over a quiet farmyard: the turkey paces and
    // the farmer loiters far behind, both idle.
    this.turkey.update(dt, 120);
  }

  update(dt) {
    this.runTime += dt;
    const result = this.world.update(dt, this.turkey, this.farmer, this.sounds);
    this.turkey.update(dt, this.world.speed);
    this.farmer.update(dt, this.world.speed, this.turkey.x);
    this.farmer.gap = this.world.farmerGap;
    if (result === 'caught') this.endGame('caught');
    else if (result === 'escaped') this.endGame('escaped');
  }

  // --- render ----------------------------------------------------------------

  render() {
    const ctx = this.ctx;
    const world = this.world;
    const stage = world.stage;
    this.buttons = [];
    if (world.stageIndex === 2) drawKitchenInterior(ctx, stage, world.distance);
    else {
      drawSky(ctx, stage);
      drawClouds(ctx, world.distance, this.time);
      drawHills(ctx, stage, world.distance);
    }
    drawProps(ctx, stage, world.distance, world.stageIndex);
    drawGround(ctx, stage, world.distance);

    for (const p of world.pickups) {
      if (p.kind === 'corn') drawCorn(ctx, p, this.time);
      else drawPie(ctx, p, this.time);
    }
    for (const ob of world.obstacles) {
      if (ob.kind === 'knife') drawKnife(ctx, ob, this.time);
      else if (ob.kind === 'oven') drawOven(ctx, ob, this.time);
      else drawPin(ctx, ob, this.time);
    }
    this.farmer.draw(ctx, this.turkey.x, this.time);
    this.turkey.draw(ctx, this.time);

    if (this.state === 'playing' || this.state === 'paused') drawHUD(ctx, world);
    if (this.state === 'title') this.renderTitle(ctx);
    if (this.state === 'paused') this.renderPaused(ctx);
    if (this.state === 'caught') this.renderEnd(ctx, false);
    if (this.state === 'escaped') this.renderEnd(ctx, true);
    this.renderMuteButton(ctx);
  }

  panel(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(255, 251, 240, 0.94)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();
    ctx.strokeStyle = '#8a6b3d';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  button(ctx, x, y, w, h, label, action) {
    ctx.fillStyle = '#c23b22';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 19px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h / 2 + 7);
    this.buttons.push({ x, y, w, h, action });
  }

  renderTitle(ctx) {
    ctx.fillStyle = 'rgba(60, 30, 5, 0.25)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    this.panel(ctx, 230, 66, 500, 326);
    ctx.fillStyle = '#b3402a';
    ctx.font = 'bold 54px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TURKEY RUN', 480, 136);
    ctx.fillStyle = '#3d2b1a';
    ctx.font = 'bold 21px system-ui, sans-serif';
    ctx.fillText('A Thanksgiving Escape', 480, 168);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = '#5d4a33';
    ctx.fillText('Thanksgiving is coming. The farmer is coming faster.', 480, 200);
    ctx.fillText('Outrun him 1000 m to the forest gate — and mind the oven.', 480, 222);
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillStyle = '#3d2b1a';
    ctx.fillText('SPACE / CLICK — jump      ↓ — slide under the knives', 480, 256);
    ctx.fillText('Corn pushes the farmer back · pie restores a life', 480, 278);
    ctx.fillText('P — pause · M — mute · R — restart', 480, 300);
    this.button(ctx, 380, 316, 200, 40, '▶  START THE RUN', 'start');
    if (this.best > 0) {
      ctx.fillStyle = '#8a6b3d';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText(`Best score so far: ${this.best}`, 480, 382 - 12);
    }
    void GROUND_Y;
  }

  renderPaused(ctx) {
    ctx.fillStyle = 'rgba(60, 30, 5, 0.45)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    this.panel(ctx, 330, 180, 300, 160);
    ctx.fillStyle = '#3d2b1a';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', 480, 232);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText('The turkey catches its breath.', 480, 260);
    this.button(ctx, 380, 282, 200, 40, 'RESUME  (P)', 'resume');
  }

  renderEnd(ctx, escaped) {
    ctx.fillStyle = escaped ? 'rgba(30, 70, 20, 0.35)' : 'rgba(60, 10, 5, 0.45)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    this.panel(ctx, 250, 84, 460, 320);
    ctx.textAlign = 'center';
    if (escaped) {
      ctx.fillStyle = '#3d7a2e';
      ctx.font = 'bold 46px system-ui, sans-serif';
      ctx.fillText('ESCAPED!', 480, 152);
      ctx.fillStyle = '#3d2b1a';
      ctx.font = '17px system-ui, sans-serif';
      ctx.fillText('The turkey made it to the forest gate.', 480, 184);
      ctx.fillText('No Thanksgiving dinner tonight — gobble gobble!', 480, 208);
    } else {
      ctx.fillStyle = '#b3402a';
      ctx.font = 'bold 46px system-ui, sans-serif';
      ctx.fillText('CAUGHT!', 480, 152);
      ctx.fillStyle = '#3d2b1a';
      ctx.font = '17px system-ui, sans-serif';
      ctx.fillText('The farmer got his turkey after all.', 480, 184);
      ctx.fillText('The oven was already warm. Better luck next run!', 480, 208);
    }
    const s = this.finalStats || { score: 0, distance: 0, corn: 0, time: 0 };
    ctx.fillStyle = '#3d2b1a';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(`Score  ${s.score}      Distance  ${s.distance} m`, 480, 252);
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillStyle = '#5d4a33';
    ctx.fillText(
      `Corn ${s.corn}  ·  Time ${Math.floor(s.time / 60)}:${String(Math.floor(s.time % 60)).padStart(2, '0')}  ·  Best ${this.best}`,
      480,
      282,
    );
    this.button(ctx, 380, 316, 200, 40, '↻  RUN AGAIN  (R)', 'restart');
    ctx.fillStyle = '#8a6b3d';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Tip: a clean run pulls ahead — corn buys you room.', 480, 388);
    void GOAL_DISTANCE;
  }

  renderMuteButton(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.beginPath();
    ctx.roundRect(VIEW_W - 46, VIEW_H - 46, 34, 34, 8);
    ctx.fill();
    ctx.fillStyle = '#3d2b1a';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.sounds.muted ? '✕' : '♪', VIEW_W - 29, VIEW_H - 23);
    this.buttons.push({ x: VIEW_W - 46, y: VIEW_H - 46, w: 34, h: 34, action: 'mute' });
  }
}

// Boot: the page holds one canvas; the game starts on the title screen,
// or on a staged screenshot state when ?shot= is present.
const canvas = document.getElementById('game');
const game = new Game(canvas);
const shot = shotFromUrl();
if (shot) applyShot(game, shot);
window.requestAnimationFrame((t) => game.frame(t));
