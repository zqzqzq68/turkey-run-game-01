// render.js — everything the eye sees except the two characters: the sky,
// hills and props of each stage, the hazards and pickups, and the HUD.
// All art is drawn with canvas paths; the game ships no image files.
import { GROUND_Y, VIEW_H, VIEW_W } from './config.js';

// The kitchen is indoors: a warm tiled wall with a dusk window instead of
// sky, clouds and hills. The scrolling props (pots, windows) hang on it.
export function drawKitchenInterior(ctx, stage, distance) {
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  grad.addColorStop(0, '#c97e3f');
  grad.addColorStop(1, '#e8b06a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Tile courses with staggered seams.
  ctx.strokeStyle = 'rgba(120, 70, 30, 0.28)';
  ctx.lineWidth = 2;
  for (let y = 72; y < GROUND_Y; y += 62) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_W, y);
    ctx.stroke();
  }
  for (let row = 0; row < 7; row += 1) {
    const y = 72 + row * 62;
    const off = row % 2 === 0 ? 0 : 46;
    for (let x = off; x < VIEW_W; x += 92) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 62);
      ctx.stroke();
    }
  }
  // One big window, dusk outside, fixed to the wall.
  ctx.fillStyle = '#f7c46b';
  ctx.fillRect(700, 64, 170, 150);
  ctx.strokeStyle = '#8a6b3d';
  ctx.lineWidth = 5;
  ctx.strokeRect(700, 64, 170, 150);
  ctx.beginPath();
  ctx.moveTo(785, 64);
  ctx.lineTo(785, 214);
  ctx.moveTo(700, 139);
  ctx.lineTo(870, 139);
  ctx.stroke();
  ctx.fillStyle = '#b3402a';
  ctx.beginPath();
  ctx.arc(830, 180, 22, 0, Math.PI * 2);
  ctx.fill();
  void stage;
  void distance;
}

export function drawSky(ctx, stage) {
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  grad.addColorStop(0, stage.skyTop);
  grad.addColorStop(1, stage.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // A low autumn sun with a warm halo.
  ctx.fillStyle = stage.sun;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(820, 84, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(820, 84, 34, 0, Math.PI * 2);
  ctx.fill();
}

// Drifting clouds, placed by a fixed seed so the sky is stable per distance.
export function drawClouds(ctx, distance, time) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (let i = 0; i < 5; i += 1) {
    const x = ((i * 263 - distance * 6 - time * 4) % 1100 + 1100) % 1100 - 80;
    const y = 36 + i * 26;
    ctx.beginPath();
    ctx.ellipse(x, y, 42, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 28, y + 5, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawHills(ctx, stage, distance) {
  ctx.fillStyle = stage.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW_W; x += 40) {
    const y = GROUND_Y - 58 - Math.sin((x + distance * 8) * 0.004) * 26;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(VIEW_W, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = stage.hillNear;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW_W; x += 40) {
    const y = GROUND_Y - 26 - Math.sin((x + distance * 14) * 0.006 + 2) * 16;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(VIEW_W, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

function drawFence(ctx, x, stage) {
  ctx.strokeStyle = '#8a6b3d';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, GROUND_Y - 52);
  ctx.lineTo(x, GROUND_Y - 4);
  ctx.moveTo(x + 44, GROUND_Y - 52);
  ctx.lineTo(x + 44, GROUND_Y - 4);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 8, GROUND_Y - 42);
  ctx.lineTo(x + 52, GROUND_Y - 42);
  ctx.moveTo(x - 8, GROUND_Y - 20);
  ctx.lineTo(x + 52, GROUND_Y - 20);
  ctx.stroke();
  void stage;
}

function drawBarn(ctx, x) {
  ctx.fillStyle = '#a83c28';
  ctx.fillRect(x, GROUND_Y - 150, 150, 150);
  ctx.fillStyle = '#7e2a1a';
  ctx.beginPath();
  ctx.moveTo(x - 12, GROUND_Y - 148);
  ctx.lineTo(x + 75, GROUND_Y - 210);
  ctx.lineTo(x + 162, GROUND_Y - 148);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f7ead0';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 52, GROUND_Y - 96);
  ctx.lineTo(x + 98, GROUND_Y - 96);
  ctx.moveTo(x + 52, GROUND_Y - 40);
  ctx.lineTo(x + 98, GROUND_Y - 40);
  ctx.moveTo(x + 52, GROUND_Y - 96);
  ctx.lineTo(x + 98, GROUND_Y - 40);
  ctx.moveTo(x + 98, GROUND_Y - 96);
  ctx.lineTo(x + 52, GROUND_Y - 40);
  ctx.stroke();
  ctx.fillStyle = '#f7ead0';
  ctx.beginPath();
  ctx.arc(x + 75, GROUND_Y - 128, 12, 0, Math.PI * 2);
  ctx.fill();
}

function drawPumpkin(ctx, x, y, r) {
  ctx.fillStyle = '#e07b28';
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b95e14';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.4, y - r * 0.7);
  ctx.quadraticCurveTo(x - r * 0.5, y, x - r * 0.4, y + r * 0.7);
  ctx.moveTo(x + r * 0.4, y - r * 0.7);
  ctx.quadraticCurveTo(x + r * 0.5, y, x + r * 0.4, y + r * 0.7);
  ctx.stroke();
  ctx.strokeStyle = '#5d7a2e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.85);
  ctx.quadraticCurveTo(x + 4, y - r * 1.3, x + 12, y - r * 1.25);
  ctx.stroke();
}

function drawKitchenProps(ctx, x) {
  // Hanging pots and a window, floating in the warm kitchen air.
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, 90);
  ctx.lineTo(x, 130);
  ctx.stroke();
  ctx.fillStyle = '#4a4a4a';
  ctx.beginPath();
  ctx.arc(x, 146, 20, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#d8c9a8';
  ctx.fillRect(x + 60, 60, 70, 90);
  ctx.strokeStyle = '#8a6b3d';
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 60, 60, 70, 90);
  ctx.beginPath();
  ctx.moveTo(x + 95, 60);
  ctx.lineTo(x + 95, 150);
  ctx.moveTo(x + 60, 105);
  ctx.lineTo(x + 130, 105);
  ctx.stroke();
}

// Stage props scroll past at the world's speed; each kind repeats on its own.
export function drawProps(ctx, stage, distance, stageIndex) {
  const spacing = 320;
  const offset = (distance * 26) % spacing;
  for (let x = -offset; x < VIEW_W + spacing; x += spacing) {
    if (stageIndex === 0) drawFence(ctx, x + 40, stage);
    if (stageIndex === 1) {
      if (Math.floor((x + offset) / spacing) % 3 === 0) drawBarn(ctx, x - 40);
      else drawPumpkin(ctx, x + 60, GROUND_Y - 16, 18);
    }
    if (stageIndex === 2) drawKitchenProps(ctx, x + 30);
  }
  // Pumpkins line the road in every stage near the end of the farmyard.
  if (stageIndex === 0) {
    for (let x = -((distance * 26) % 480); x < VIEW_W + 100; x += 480) {
      drawPumpkin(ctx, x + 300, GROUND_Y - 12, 13);
    }
  }
}

export function drawGround(ctx, stage, distance) {
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = stage.groundDark;
  for (let x = -((distance * 26) % 46); x < VIEW_W; x += 46) {
    ctx.fillRect(x, GROUND_Y + 14, 22, 5);
    ctx.fillRect(x + 24, GROUND_Y + 48, 18, 5);
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.fillRect(0, GROUND_Y, VIEW_W, 4);
}

// --- Hazards and pickups -------------------------------------------------

export function drawKnife(ctx, ob, time) {
  const glint = 0.5 + Math.sin(time * 6 + ob.x * 0.05) * 0.5;
  ctx.save();
  ctx.translate(ob.x, ob.y);
  // Handle, stuck in the ground at a jaunty angle.
  ctx.fillStyle = '#4a2f1d';
  ctx.save();
  ctx.rotate(-0.5);
  ctx.fillRect(-8, -4, 22, 9);
  ctx.restore();
  // The blade, pointing up and catching the light.
  ctx.fillStyle = '#d7dde3';
  ctx.beginPath();
  ctx.moveTo(8, 4);
  ctx.lineTo(30, -ob.h + 4);
  ctx.lineTo(36, -ob.h + 10);
  ctx.lineTo(16, 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + glint * 0.5})`;
  ctx.beginPath();
  ctx.moveTo(14, -2);
  ctx.lineTo(28, -ob.h + 8);
  ctx.lineTo(31, -ob.h + 11);
  ctx.lineTo(18, 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawOven(ctx, ob, time) {
  const flicker = 0.6 + Math.sin(time * 9) * 0.25;
  ctx.save();
  ctx.translate(ob.x, ob.y);
  // Body and chimney.
  ctx.fillStyle = '#3d3d3d';
  ctx.fillRect(0, 0, ob.w, ob.h);
  ctx.fillRect(ob.w - 20, -26, 16, 28);
  ctx.fillStyle = '#575757';
  ctx.fillRect(4, 4, ob.w - 8, 10);
  // The oven door, glowing with heat, and a warning wisp of smoke.
  ctx.fillStyle = `rgba(255, ${Math.floor(120 + flicker * 60)}, 40, ${0.55 + flicker * 0.3})`;
  ctx.beginPath();
  ctx.roundRect(10, 26, ob.w - 20, 44, 6);
  ctx.fill();
  ctx.strokeStyle = '#1d1d1d';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 26, ob.w - 20, 44);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOT!', ob.w / 2, 52);
  ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
  ctx.beginPath();
  ctx.ellipse(ob.w - 12, -32 - Math.sin(time * 3) * 4, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawPin(ctx, ob, time) {
  ctx.save();
  ctx.translate(ob.x + ob.w / 2, ob.y + ob.h / 2);
  ctx.rotate(time * 7);
  ctx.fillStyle = '#c9a06a';
  ctx.beginPath();
  ctx.roundRect(-ob.w / 2, -ob.h / 2, ob.w, ob.h, 9);
  ctx.fill();
  ctx.fillStyle = '#8a6b3d';
  ctx.fillRect(-ob.w / 2 - 6, -4, 7, 8);
  ctx.fillRect(ob.w / 2 - 1, -4, 7, 8);
  ctx.restore();
}

export function drawCorn(ctx, p, time) {
  const bob = Math.sin(time * 4 + p.x * 0.02) * 4;
  ctx.save();
  ctx.translate(p.x, p.y + bob);
  ctx.fillStyle = '#f2c230';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d9a41f';
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.arc(i * 5, -6 + Math.abs(i) * 4, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#5d8a2e';
  ctx.beginPath();
  ctx.ellipse(-8, -12, 7, 4, -0.6, 0, Math.PI * 2);
  ctx.ellipse(8, -12, 7, 4, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawPie(ctx, p, time) {
  const bob = Math.sin(time * 4 + p.x * 0.02) * 4;
  ctx.save();
  ctx.translate(p.x, p.y + bob);
  // A slice of pumpkin pie on a little plate, worth a life.
  ctx.fillStyle = '#e8e8e8';
  ctx.beginPath();
  ctx.ellipse(0, 10, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e07b28';
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.lineTo(14, 8);
  ctx.lineTo(0, -12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c98a3d';
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.lineTo(-4, 8);
  ctx.lineTo(0, -12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(2, -8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// --- HUD -------------------------------------------------------------------

function drawHeart(ctx, x, y, filled) {
  ctx.fillStyle = filled ? '#d23b2e' : 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.moveTo(x, y + 8);
  ctx.bezierCurveTo(x - 11, y - 2, x - 6, y - 12, x, y - 5);
  ctx.bezierCurveTo(x + 6, y - 12, x + 11, y - 2, x, y + 8);
  ctx.fill();
}

export function drawHUD(ctx, world) {
  // Score, top left.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.beginPath();
  ctx.roundRect(14, 12, 210, 52, 10);
  ctx.fill();
  ctx.fillStyle = '#3d2b1a';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE', 26, 30);
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillText(String(world.score).padStart(6, '0'), 26, 56);

  // Distance to freedom, top centre, with a progress bar.
  const barX = 330;
  const barW = 300;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.beginPath();
  ctx.roundRect(barX - 10, 12, barW + 20, 52, 10);
  ctx.fill();
  ctx.fillStyle = '#3d2b1a';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`FREEDOM  ${Math.floor(world.distance)} / 1000 m`, barX + barW / 2, 30);
  ctx.fillStyle = '#d8c9a8';
  ctx.beginPath();
  ctx.roundRect(barX, 38, barW, 12, 6);
  ctx.fill();
  ctx.fillStyle = '#5d8a2e';
  ctx.beginPath();
  ctx.roundRect(barX, 38, barW * world.progress, 12, 6);
  ctx.fill();
  // A little pine at the end of the bar: the forest gate.
  ctx.fillStyle = '#3d5a1e';
  ctx.beginPath();
  ctx.moveTo(barX + barW + 10, 36);
  ctx.lineTo(barX + barW + 2, 50);
  ctx.lineTo(barX + barW + 18, 50);
  ctx.closePath();
  ctx.fill();

  // Lives and stage, top right.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.beginPath();
  ctx.roundRect(700, 12, 246, 52, 10);
  ctx.fill();
  for (let i = 0; i < 3; i += 1) drawHeart(ctx, 724 + i * 30, 32, i < world.lives);
  ctx.fillStyle = '#3d2b1a';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(world.stage.name, 932, 34);
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`corn ${world.corn} · ${Math.round(world.speed)} px/s`, 932, 54);
}
