// turkey.js — the player: a plump Thanksgiving turkey with somewhere to be.
// Physics live here (jump, gravity, slide); drawing lives here too, so the
// bird looks the same in play, in the title screen and in screenshots.
import {
  GRAVITY,
  GROUND_Y,
  JUMP_VELOCITY,
  SLIDE_TIME,
  TURKEY_H,
  TURKEY_SLIDE_H,
  TURKEY_W,
  TURKEY_X,
} from './config.js';

export class Turkey {
  constructor() {
    this.x = TURKEY_X;
    this.y = GROUND_Y - TURKEY_H;
    this.vy = 0;
    this.onGround = true;
    this.sliding = false;
    this.slideTimer = 0;
    this.runCycle = 0;
    this.stumbleTimer = 0;
    this.invulnerableTimer = 0;
    this.blink = false;
  }

  get width() {
    return this.sliding ? TURKEY_W + 16 : TURKEY_W;
  }

  get height() {
    return this.sliding ? TURKEY_SLIDE_H : TURKEY_H;
  }

  get box() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }

  jump(sounds) {
    if (!this.onGround) return false;
    this.vy = JUMP_VELOCITY;
    this.onGround = false;
    this.sliding = false;
    this.slideTimer = 0;
    if (sounds) sounds.jump();
    return true;
  }

  slide(sounds) {
    if (!this.onGround || this.sliding) return false;
    this.sliding = true;
    this.slideTimer = SLIDE_TIME;
    if (sounds) sounds.slide();
    return true;
  }

  stumble() {
    this.stumbleTimer = 0.6;
    this.invulnerableTimer = 1.3;
    this.sliding = false;
    this.slideTimer = 0;
  }

  update(dt, speed) {
    this.runCycle += dt * (speed / 28);
    if (this.stumbleTimer > 0) this.stumbleTimer -= dt;
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      this.blink = Math.floor(this.invulnerableTimer * 12) % 2 === 0;
    } else {
      this.blink = false;
    }
    if (this.slideTimer > 0) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) this.sliding = false;
    }
    if (!this.onGround) {
      this.vy += GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.y >= GROUND_Y - this.height) {
        this.y = GROUND_Y - this.height;
        this.vy = 0;
        this.onGround = true;
      }
    }
  }

  // A stumble tips the bird backwards; a slide flattens it; a jump tucks it.
  draw(ctx, time) {
    if (this.blink) return; // invulnerability blink
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    ctx.save();
    ctx.translate(x + w / 2, y + h);
    if (this.stumbleTimer > 0) ctx.rotate(-0.45);
    else if (!this.onGround) ctx.rotate(0.12);
    else if (this.sliding) ctx.scale(1.15, 0.62);
    ctx.translate(-w / 2, -h);

    // Tail feathers, fanned behind the body.
    ctx.fillStyle = '#8a5a2b';
    for (let i = -2; i <= 2; i += 1) {
      ctx.save();
      ctx.translate(8, 26);
      ctx.rotate(i * 0.42);
      ctx.beginPath();
      ctx.ellipse(-16, -14, 7, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c98a3d';
      ctx.beginPath();
      ctx.ellipse(-16, -26, 4, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a5a2b';
      ctx.restore();
    }

    // Body: a plump brown oval with a lighter belly.
    ctx.fillStyle = '#7a4a22';
    ctx.beginPath();
    ctx.ellipse(w / 2 + 4, h - 24, 24, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a06a35';
    ctx.beginPath();
    ctx.ellipse(w / 2 + 10, h - 20, 15, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing, flapping a little with the run cycle.
    const flap = this.onGround ? Math.sin(this.runCycle * 2) * 0.25 : -0.5;
    ctx.save();
    ctx.translate(w / 2 + 2, h - 30);
    ctx.rotate(flap);
    ctx.fillStyle = '#5d3a1a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 8, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Neck and head, always held high and proud.
    ctx.fillStyle = '#7a4a22';
    ctx.fillRect(w - 6, 2, 12, 22);
    ctx.fillStyle = '#e8b06a';
    ctx.beginPath();
    ctx.arc(w + 2, 8, 10, 0, Math.PI * 2);
    ctx.fill();

    // Beak, wattle and a wide, worried eye.
    ctx.fillStyle = '#e07b28';
    ctx.beginPath();
    ctx.moveTo(w + 10, 6);
    ctx.lineTo(w + 22, 10);
    ctx.lineTo(w + 10, 13);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d23b2e';
    ctx.beginPath();
    ctx.ellipse(w + 8, 16, 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w + 5, 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d1d1d';
    ctx.beginPath();
    ctx.arc(w + 6, 5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Legs: two orange sticks, stepping while on the ground.
    ctx.strokeStyle = '#e07b28';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const step = this.onGround ? Math.sin(this.runCycle) * 9 : 4;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 2, h - 4);
    ctx.lineTo(w / 2 - 2 + step, h + 2);
    ctx.moveTo(w / 2 + 10, h - 4);
    ctx.lineTo(w / 2 + 10 - step, h + 2);
    ctx.stroke();

    // Stumble stars: three little stars circling the head.
    if (this.stumbleTimer > 0) {
      ctx.fillStyle = '#ffd94a';
      for (let i = 0; i < 3; i += 1) {
        const a = time * 6 + (i * Math.PI * 2) / 3;
        const sx = w + 2 + Math.cos(a) * 20;
        const sy = -6 + Math.sin(a) * 8;
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}
