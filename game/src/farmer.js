// farmer.js — the pursuer. He runs behind the turkey, closes in on every
// stumble, and every few seconds stops to sniff the air and look around,
// which is the turkey's chance to pull away again.
import { GROUND_Y } from './config.js';

export class Farmer {
  constructor() {
    this.gap = 60; // metres behind the turkey
    this.searching = false;
    this.searchTimer = 0;
    this.searchCooldown = 9;
    this.runCycle = 0;
    this.caughtPose = false;
  }

  get pxPerMetre() {
    return 6;
  }

  // Screen x of the farmer's feet, from the gap. Off-screen while far away.
  screenX(turkeyX) {
    return turkeyX - this.gap * this.pxPerMetre;
  }

  update(dt, speed, turkeyX) {
    this.runCycle += dt * (speed / 26);
    if (this.searching) {
      this.searchTimer -= dt;
      if (this.searchTimer <= 0) this.searching = false;
      return;
    }
    this.searchCooldown -= dt;
    if (this.searchCooldown <= 0) {
      this.searching = true;
      this.searchTimer = 1.4;
      this.searchCooldown = 9;
    }
    void turkeyX;
  }

  draw(ctx, turkeyX, time) {
    const x = this.screenX(turkeyX);
    if (x < -140) return; // too far back to see: the chase is not on screen yet
    const groundY = GROUND_Y;
    ctx.save();
    ctx.translate(x, groundY);

    // Legs, pumping hard, unless he is stopped and searching.
    const step = this.searching ? 0 : Math.sin(this.runCycle) * 10;
    ctx.strokeStyle = '#3d4a6b';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-6, -34);
    ctx.lineTo(-6 + step, 0);
    ctx.moveTo(8, -34);
    ctx.lineTo(8 - step, 0);
    ctx.stroke();

    // Blue overalls over a red checked shirt.
    ctx.fillStyle = '#b3402a';
    ctx.fillRect(-16, -78, 34, 26);
    ctx.fillStyle = '#3d4a6b';
    ctx.fillRect(-16, -56, 34, 24);
    ctx.fillStyle = '#d8c27a';
    ctx.fillRect(-14, -78, 5, 24);
    ctx.fillRect(11, -78, 5, 24);

    // Arms: one pumping, one holding the pitchfork high.
    ctx.strokeStyle = '#b3402a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(14, -72);
    ctx.lineTo(26 + (this.searching ? 0 : step * 0.4), -52);
    ctx.stroke();
    ctx.strokeStyle = '#8a6b3d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(20, -96);
    ctx.lineTo(30, -20);
    ctx.stroke();
    // Pitchfork tines.
    ctx.strokeStyle = '#c9c9c9';
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(20 + i * 7, -96);
      ctx.lineTo(20 + i * 7, -110);
      ctx.stroke();
    }

    // Head with a straw hat and a moustache; angry when close.
    ctx.fillStyle = '#e8b06a';
    ctx.beginPath();
    ctx.arc(2, -88, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d8c27a';
    ctx.beginPath();
    ctx.ellipse(2, -96, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-6, -108, 16, 12);
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(-4, -84, 12, 4); // moustache
    // Eyes: narrowed slits while chasing, wide while searching.
    ctx.fillStyle = '#1d1d1d';
    if (this.searching) {
      ctx.beginPath();
      ctx.arc(-2, -90, 2, 0, Math.PI * 2);
      ctx.arc(7, -90, 2, 0, Math.PI * 2);
      ctx.fill();
      // A hand shading his eyes, scanning the horizon.
      ctx.strokeStyle = '#e8b06a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(12, -92);
      ctx.lineTo(22, -98);
      ctx.stroke();
    } else {
      ctx.fillRect(-4, -91, 5, 2);
      ctx.fillRect(5, -91, 5, 2);
    }

    // A speech bubble when he is close enough to be a real threat.
    if (this.gap <= 12 && !this.searching) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3d3d3d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-78, -148, 152, 30, 8);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8, -118);
      ctx.lineTo(-2, -106);
      ctx.lineTo(4, -118);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3d3d3d';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Come back here!', -2, -128);
    }
    ctx.restore();
    void time;
  }
}
