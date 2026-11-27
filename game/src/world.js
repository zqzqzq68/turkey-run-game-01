// world.js — the run itself: distance, score, lives, the farmer's gap,
// and everything the turkey meets on the road: knives, ovens, rolling
// pins, corn and the occasional life-saving pie.
import {
  CORN_GAP_GAIN,
  CORN_RUN_MAX,
  CORN_RUN_MIN,
  CORN_SCORE,
  FARMER_MAX_GAP,
  FARMER_RECOVERY,
  FARMER_SEARCH_GAIN,
  FARMER_START_GAP,
  GOAL_DISTANCE,
  GROUND_Y,
  PIE_SCORE,
  SPAWN_MAX_GAP,
  SPAWN_MIN_GAP,
  SPAWN_TABLE,
  STAGES,
  START_LIVES,
  STUMBLE_GAP_LOSS,
  VIEW_W,
} from './config.js';
import { makeRandom } from './random.js';

export const OBSTACLE_KINDS = ['knife', 'oven', 'pin'];

function obstacleSize(kind) {
  if (kind === 'knife') return { w: 36, h: 26 };
  if (kind === 'oven') return { w: 68, h: 88 };
  return { w: 46, h: 22 }; // rolling pin
}

function pickHazard(random, stageIndex) {
  const table = SPAWN_TABLE[stageIndex];
  const total = table.knife + table.oven + table.pin;
  let roll = random.next() * total;
  if (roll < table.knife) return 'knife';
  roll -= table.knife;
  if (roll < table.oven) return 'oven';
  return 'pin';
}

export class World {
  constructor(seed) {
    this.random = makeRandom(seed >>> 0);
    this.distance = 0; // metres run
    this.score = 0;
    this.bonus = 0; // one-off bonuses (pie), kept apart from distance score
    this.corn = 0;
    this.lives = START_LIVES;
    this.speed = 250;
    this.farmerGap = FARMER_START_GAP;
    this.searchGainPending = false;
    this.obstacles = [];
    this.pickups = [];
    this.nextSpawnX = VIEW_W + 200;
    this.time = 0;
    this.finished = false;
    this.outcome = null; // 'caught' | 'escaped'
  }

  get stageIndex() {
    let index = 0;
    for (let i = 0; i < STAGES.length; i += 1) {
      if (this.distance >= STAGES[i].from) index = i;
    }
    return index;
  }

  get stage() {
    return STAGES[this.stageIndex];
  }

  get progress() {
    return Math.min(1, this.distance / GOAL_DISTANCE);
  }

  updateSpeed() {
    this.speed = Math.min(540, 250 + this.distance * 0.32);
  }

  spawnGroup(x) {
    const kind = pickHazard(this.random, this.stageIndex);
    const size = obstacleSize(kind);
    this.obstacles.push({
      kind,
      x,
      y: GROUND_Y - size.h,
      w: size.w,
      h: size.h,
      passed: false,
    });
    // A second knife sometimes rides well behind the first, so the pair
    // takes two jumps: one jump cannot carry both.
    if (kind === 'knife' && this.random.chance(0.25)) {
      this.obstacles.push({
        kind: 'knife',
        x: x + 280,
        y: GROUND_Y - 26,
        w: 36,
        h: 26,
        passed: false,
      });
    }
    // Corn arcs over the hazard, so a good jump pays twice.
    if (this.random.chance(0.75)) {
      const count = this.random.int(CORN_RUN_MIN, CORN_RUN_MAX);
      for (let i = 0; i < count; i += 1) {
        this.pickups.push({
          kind: 'corn',
          x: x - 30 + i * 34,
          y: GROUND_Y - 150 + Math.abs(i - (count - 1) / 2) * 26,
          r: 13,
          taken: false,
        });
      }
    } else if (this.random.chance(0.2)) {
      // Rare pie on the ground, worth a life.
      this.pickups.push({ kind: 'pie', x: x + 120, y: GROUND_Y - 22, r: 15, taken: false });
    }
  }

  static boxesOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // Advance the world one frame. Returns 'hit' when the turkey stumbles,
  // 'caught' when the farmer closes the gap, 'escaped' at the forest gate.
  update(dt, turkey, farmer, sounds) {
    this.time += dt;
    this.updateSpeed();
    const dx = this.speed * dt;
    this.distance += dx / 26; // 26 px on screen is about a metre of road
    this.score = Math.floor(this.distance * 10) + this.corn * CORN_SCORE + this.bonus;

    // The farmer: clean running pulls ahead; while he stops to search,
    // the turkey gains ground once his search ends.
    if (!farmer.searching) {
      this.farmerGap = Math.min(FARMER_MAX_GAP, this.farmerGap + FARMER_RECOVERY * dt);
      if (this.searchGainPending) {
        this.searchGainPending = false;
        this.farmerGap = Math.min(FARMER_MAX_GAP, this.farmerGap + FARMER_SEARCH_GAIN);
      }
    } else {
      this.searchGainPending = true;
    }
    if (this.farmerGap <= 0) {
      this.finished = true;
      this.outcome = 'caught';
      return 'caught';
    }

    // Spawn hazards ahead of the screen, then slide everything left.
    // The gap between groups grows with speed, so the turkey always has
    // time to land from one jump before the next hazard arrives.
    this.nextSpawnX -= dx;
    if (this.nextSpawnX <= VIEW_W) {
      this.spawnGroup(VIEW_W + 60);
      this.nextSpawnX =
        VIEW_W + 60 + this.random.range(SPAWN_MIN_GAP, SPAWN_MAX_GAP) + this.speed * 0.35;
    }
    for (const ob of this.obstacles) {
      ob.x -= dx;
      if (ob.kind === 'pin') ob.x -= 70 * dt; // pins roll in on top of the scroll
    }
    for (const p of this.pickups) p.x -= dx;
    this.obstacles = this.obstacles.filter((ob) => ob.x + ob.w > -80);
    this.pickups = this.pickups.filter((p) => p.x + p.r > -40);

    // Corn and pie: a forgiving circle check against the turkey's centre.
    const centre = {
      x: turkey.x + turkey.width / 2,
      y: turkey.y + turkey.height / 2,
    };
    for (const p of this.pickups) {
      if (p.taken) continue;
      const dxp = centre.x - p.x;
      const dyp = centre.y - p.y;
      if (dxp * dxp + dyp * dyp < (p.r + 24) * (p.r + 24)) {
        p.taken = true;
        if (p.kind === 'corn') {
          this.corn += 1;
          this.farmerGap = Math.min(FARMER_MAX_GAP, this.farmerGap + CORN_GAP_GAIN);
          if (sounds) sounds.pickup();
        } else {
          this.lives = Math.min(3, this.lives + 1);
          this.bonus += PIE_SCORE;
          if (sounds) sounds.pie();
        }
      }
    }
    this.pickups = this.pickups.filter((p) => !p.taken);

    // Hazards: a hit costs a life and a stumble, unless briefly invulnerable.
    if (turkey.invulnerableTimer <= 0) {
      const box = turkey.box;
      // Shrink the box a little: near misses should feel fair, not cruel.
      const fair = { x: box.x + 6, y: box.y + 4, w: box.w - 12, h: box.h - 6 };
      for (const ob of this.obstacles) {
        if (ob.passed) continue;
        if (World.boxesOverlap(fair, ob)) {
          ob.passed = true;
          this.lives -= 1;
          this.farmerGap -= STUMBLE_GAP_LOSS;
          turkey.stumble();
          if (sounds) sounds.stumble();
          if (this.lives <= 0 || this.farmerGap <= 0) {
            this.finished = true;
            this.outcome = 'caught';
            return 'caught';
          }
          return 'hit';
        }
        if (ob.x + ob.w < turkey.x) ob.passed = true;
      }
    }

    if (this.distance >= GOAL_DISTANCE) {
      this.finished = true;
      this.outcome = 'escaped';
      return 'escaped';
    }
    return 'ok';
  }
}
