// config.js — every tunable number for Turkey Run lives here, in one place.
// The game runs on a fixed logical stage of 960 x 540 and scales to the window.
export const VIEW_W = 960;
export const VIEW_H = 540;
export const GROUND_Y = 462;

export const TURKEY_X = 185;
export const TURKEY_W = 46;
export const TURKEY_H = 58;
export const TURKEY_SLIDE_H = 30;

export const GRAVITY = 2600;
export const JUMP_VELOCITY = -980;
export const SLIDE_TIME = 0.55;

export const GOAL_DISTANCE = 1000; // metres of running to the forest gate
export const BASE_SPEED = 250; // px per second at the start line
export const SPEED_PER_METRE = 0.32; // the run gets faster the further you get
export const MAX_SPEED = 540;

export const START_LIVES = 3;
export const MAX_LIVES = 3;
export const CORN_SCORE = 100;
export const PIE_SCORE = 250;
export const STUMBLE_GAP_LOSS = 22; // metres the farmer gains on a hit
export const CORN_GAP_GAIN = 4; // metres the turkey pulls ahead per corn
export const FARMER_START_GAP = 60; // metres behind the turkey
export const FARMER_MAX_GAP = 60;
export const FARMER_RECOVERY = 1.4; // metres per second the turkey pulls ahead clean
export const FARMER_SEARCH_EVERY = 9; // seconds between the farmer stopping to look
export const FARMER_SEARCH_TIME = 1.4; // seconds he stands still, sniffing the air
export const FARMER_SEARCH_GAIN = 9; // metres gained while he searches
export const INVULNERABLE_TIME = 1.3; // seconds of grace after a stumble

// One stage per stretch of the escape, each with its own palette and props.
export const STAGES = [
  {
    name: 'Farmyard',
    from: 0,
    skyTop: '#ffd9a0',
    skyBottom: '#fff3d6',
    sun: '#ffcf5c',
    hillFar: '#c9d68a',
    hillNear: '#9db95e',
    ground: '#b98a4e',
    groundDark: '#a1763f',
    accent: '#d97b29',
  },
  {
    name: 'Barn',
    from: 300,
    skyTop: '#f7b267',
    skyBottom: '#ffe3b3',
    sun: '#ff9d45',
    hillFar: '#b98a5e',
    hillNear: '#8f6b3d',
    ground: '#a5713d',
    groundDark: '#8d5f33',
    accent: '#b3402a',
  },
  {
    name: 'Kitchen',
    from: 650,
    skyTop: '#e8a04c',
    skyBottom: '#f7d9a8',
    sun: '#ffc46b',
    hillFar: '#7d5a3a',
    hillNear: '#5f4630',
    ground: '#8a5a34',
    groundDark: '#744a2b',
    accent: '#c23b22',
  },
];

// How often each hazard appears, per stage (weights, not probabilities).
export const SPAWN_TABLE = [
  { knife: 5, oven: 2, pin: 3 }, // Farmyard: knives and rolling pins
  { knife: 4, oven: 3, pin: 4 }, // Barn: ovens join in
  { knife: 3, oven: 5, pin: 4 }, // Kitchen: ovens everywhere
];

export const SPAWN_MIN_GAP = 340; // px between hazard groups, at spawn time
export const SPAWN_MAX_GAP = 560;
export const CORN_RUN_MIN = 3; // corn comes in little arcs of 3 to 5
export const CORN_RUN_MAX = 5;
