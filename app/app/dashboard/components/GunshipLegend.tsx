"use client";
// npm install pixi.js@7
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { getHeartQuestionAction } from "../../heart-question/actions";
import { submitScoreAction } from "../actions";

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS & TYPES
// ════════════════════════════════════════════════════════════════════════════
const W = 480, H = 600, GY = H - 55;
let uid = 0;
const nid = () => ++uid;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
function lerpColor(c1: number, c2: number, t: number) {
  const r = Math.round(lerp((c1 >> 16) & 0xff, (c2 >> 16) & 0xff, t));
  const g = Math.round(lerp((c1 >> 8) & 0xff, (c2 >> 8) & 0xff, t));
  const b = Math.round(lerp(c1 & 0xff, c2 & 0xff, t));
  return (r << 16) | (g << 8) | b;
}


// ════════════════════════════════════════════════════════════════════════════
// SOUND SYSTEM — Web Audio API, no files needed
// ════════════════════════════════════════════════════════════════════════════
function createSoundSystem() {
  let ctx: AudioContext | null = null;
  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctx;
  };

  function playTone(freq: number, type: OscillatorType, duration: number, vol: number, freqEnd?: number, delay = 0) {
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime + delay);
      if (freqEnd !== undefined) osc.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + delay + duration);
      gain.gain.setValueAtTime(vol, c.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
      osc.start(c.currentTime + delay);
      osc.stop(c.currentTime + delay + duration);
    } catch { }
  }

  function playNoise(duration: number, vol: number, filterFreq: number, delay = 0) {
    try {
      const c = getCtx();
      const bufSize = c.sampleRate * duration;
      const buf = c.createBuffer(1, bufSize, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      const filter = c.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = filterFreq;
      const gain = c.createGain();
      src.connect(filter); filter.connect(gain); gain.connect(c.destination);
      gain.gain.setValueAtTime(vol, c.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
      src.start(c.currentTime + delay);
      src.stop(c.currentTime + delay + duration);
    } catch { }
  }

  return {
    cannon: () => { playTone(220, "square", 0.08, 0.18, 80); playNoise(0.06, 0.12, 800); },
    missile: () => { playTone(180, "sawtooth", 0.15, 0.22, 320); playNoise(0.12, 0.1, 400); },
    spread: () => { for (let i = 0; i < 3; i++) playTone(300 + i * 80, "square", 0.07, 0.1, 150, i * 0.02); },
    plasma: () => { playTone(80, "sine", 0.25, 0.28, 1200); playTone(600, "sine", 0.2, 0.15, 80); },
    hit: () => { playNoise(0.08, 0.18, 1200); playTone(160, "square", 0.06, 0.1, 60); },
    explosion: () => { playNoise(0.4, 0.38, 200); playTone(90, "sawtooth", 0.3, 0.22, 30); },
    bigExplosion: () => { playNoise(0.7, 0.55, 120); playTone(60, "sawtooth", 0.5, 0.3, 25); playNoise(0.35, 0.25, 600, 0.05); },
    playerHit: () => { playNoise(0.25, 0.4, 300); playTone(120, "sawtooth", 0.2, 0.25, 40); },
    pickup: () => { playTone(520, "sine", 0.12, 0.18, 880); playTone(880, "sine", 0.1, 0.12, 1200, 0.08); },
    heal: () => { [0, 0.08, 0.16].forEach((d, i) => playTone(440 + i * 220, "sine", 0.14, 0.18, 880 + i * 220, d)); },
    gameOver: () => { [0, 0.15, 0.3, 0.5].forEach((d, i) => playTone(300 - i * 55, "sawtooth", 0.25, 0.22, 30, d)); },
    combo: () => { playTone(660, "sine", 0.1, 0.2, 880); playTone(880, "sine", 0.08, 0.15, 1100, 0.07); },
  };
}


type EnemyType = "scout" | "gunship" | "bomber" | "ace" | "jet" | "boss";
type WeaponType = "cannon" | "missile" | "spread";
type BulletKind = "cannon" | "missile" | "spread" | "ebullet" | "bomb" | "plasma";

interface EnemyData {
  id: number; type: EnemyType;
  x: number; y: number; baseY: number;
  hp: number; maxHp: number; speed: number;
  shootTimer: number; shootInterval: number;
  wobble: number; phase: number; phaseDir: number;
  reward: number; bombTimer: number;
  hitFlash: number;
}
interface BulletData {
  id: number; kind: BulletKind;
  x: number; y: number; vx: number; vy: number;
  trail: { x: number; y: number }[];
  targetId?: number; life: number; damage: number;
}
interface AmmoPickup { id: number; x: number; y: number; kind: "missile" | "spread" | "plasma" | "health"; vy: number; frame: number; }
interface Particle { id: number; x: number; y: number; vx: number; vy: number; life: number; r: number; color: number; grav: number; }
interface Shockwave { id: number; x: number; y: number; r: number; maxR: number; life: number; color: number; }
interface BgObj { id: number; type: "balloon" | "bird" | "cloud2" | "UFO"; x: number; y: number; vx: number; vy: number; phase: number; birdPhase?: number; }
interface DyingEnemy { id: number; x: number; y: number; vx: number; vy: number; rot: number; rotSpeed: number; timer: number; maxTimer: number; type: EnemyType; }

// ════════════════════════════════════════════════════════════════════════════
// ███  MASTER GAME CONFIG — edit anything here  ███
// ════════════════════════════════════════════════════════════════════════════
const CFG = {

  // ── Player ────────────────────────────────────────────────────────────────
  player: {
    startHp: 10,   // starting health (also the max)
    speed: 3.5,  // movement speed (px / frame)
    invincibleFrames: 108, // invincibility frames after being hit
  },

  // ── Weapons ───────────────────────────────────────────────────────────────
  weapons: {
    cannon: {
      damage: 1,
      cooldown: 9,   // frames between shots (lower = faster)
      speed: 9,   // bullet speed px/frame
    },
    missile: {
      damage: 3,
      cooldown: 20,
      speed: 9,
      startAmmo: 6,
      maxAmmo: 12,
      pickupRefill: 3,
      homingStrength: 0.12, // 0–1, how sharply it turns
    },
    spread: {
      damage: 1,
      cooldown: 16,
      speed: 9,
      spreadAngle: 0.2,  // radians between each of the 5 pellets
      startAmmo: 10,
      maxAmmo: 18,
      pickupRefill: 4,
    },
    plasma: {
      damage: 4,
      cooldown: 28,
      speed: 12,
      startAmmo: 4,
      maxAmmo: 8,
      pickupRefill: 2,
    },
  },

  // ── Health system ─────────────────────────────────────────────────────────
  health: {
    milestoneEvery: 20,  // gain +1 HP every N score points
    healthDropChance: 0.25,// extra chance any enemy drops a health crate
  },

  // ── Difficulty scaling ────────────────────────────────────────────────────
  spawn: {
    initialRate: 130,  // frames between enemy spawns at start
    minRate: 38,  // fastest possible spawn rate
    scorePerStep: 4,  // score points per difficulty step
    framesPerStep: 8,  // frames to subtract per step
  },
  bossEveryKills: 30,  // spawn a boss every N total kills

  // ── Enemy definitions ─────────────────────────────────────────────────────
  //   hp            — health points
  //   reward        — score added on kill
  //   shootInterval — frames between shots (higher = shoots less often)
  //   bulletSpeed   — speed of this enemy's bullets (px/frame)
  //   speedRange    — [min, max] horizontal move speed
  //   dropChance    — 0–1 probability of dropping a pickup on death
  enemies: {
    scout: { hp: 1, reward: 1, shootInterval: 120, bulletSpeed: 4.0, speedRange: [2.8, 4.5] as [number, number], pattern: "zigzag", dropChance: 0.3 },
    gunship: { hp: 5, reward: 4, shootInterval: 50, bulletSpeed: 4.0, speedRange: [0.8, 1.5] as [number, number], pattern: "straight", dropChance: 0.65 },
    bomber: { hp: 3, reward: 3, shootInterval: 999, bulletSpeed: 4.0, speedRange: [1.2, 2.0] as [number, number], pattern: "straight", dropChance: 0.55 },
    ace: { hp: 2, reward: 5, shootInterval: 40, bulletSpeed: 4.8, speedRange: [2.0, 3.5] as [number, number], pattern: "wave", dropChance: 0.75 },
    jet: { hp: 1, reward: 3, shootInterval: 200, bulletSpeed: 4.0, speedRange: [5.5, 9.0] as [number, number], pattern: "swoop", dropChance: 0.35 },
    boss: { hp: 25, reward: 25, shootInterval: 28, bulletSpeed: 5.2, speedRange: [0.4, 0.7] as [number, number], pattern: "straight", dropChance: 1.0 },
  },
};
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// ENEMY CONFIG (derived from CFG — do not edit directly)
// ════════════════════════════════════════════════════════════════════════════
const ENEMY_CFG: Record<EnemyType, { hp: number; reward: number; shootInterval: number; bulletSpeed: number; speedRange: [number, number]; pattern: string; dropChance: number }> = CFG.enemies;

// ════════════════════════════════════════════════════════════════════════════
// GAME STATE
// ════════════════════════════════════════════════════════════════════════════
const mkGs = () => ({
  heli: { x: 60, y: 260 }, hp: CFG.player.startHp, invincible: 0,
  weapon: "cannon" as WeaponType,
  ammo: {
    missile: CFG.weapons.missile.startAmmo,
    spread: CFG.weapons.spread.startAmmo,
    plasma: CFG.weapons.plasma.startAmmo,
  },
  bullets: [] as BulletData[],
  enemies: [] as EnemyData[],
  pickups: [] as AmmoPickup[],
  particles: [] as Particle[],
  shockwaves: [] as Shockwave[],
  bgObjs: [] as BgObj[],
  dying: [] as DyingEnemy[],
  playerMvy: 0,
  shootCooldown: 0,
  spawnTimer: 0, spawnRate: CFG.spawn.initialRate,
  frame: 0, bgOff: 0,
  tod: 0.05,
  todDir: 1,
  totalKills: 0, lastBossAt: -50,
  shake: { intensity: 0 },
  score: 0,
  combo: 0, comboTimer: 0,
  nextHealthMilestone: CFG.health.milestoneEvery,
});

// ════════════════════════════════════════════════════════════════════════════
// FX
// ════════════════════════════════════════════════════════════════════════════
function spawnExplosion(s: ReturnType<typeof mkGs>, x: number, y: number, big: boolean, color = 0xff6600) {
  const cols = [color, 0xff9900, 0xffcc00, 0xff3300, 0xffffff, 0xffee88];
  const n = big ? 32 : 14;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, spd = rnd(big ? 2 : 1, big ? 10 : 5);
    s.particles.push({ id: nid(), x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - (big ? 2 : 1), life: 1, r: rnd(big ? 3 : 2, big ? 10 : 5), color: cols[Math.floor(Math.random() * cols.length)], grav: 0.13 });
  }
  for (let i = 0; i < (big ? 22 : 9); i++) {
    const a = Math.random() * Math.PI * 2, spd = rnd(4, big ? 15 : 9);
    s.particles.push({ id: nid(), x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 3, life: 0.7, r: 1.3, color: 0xffffff, grav: 0.1 });
  }
  for (let i = 0; i < (big ? 9 : 4); i++) {
    s.particles.push({ id: nid(), x: x + rnd(-15, 15), y: y + rnd(-12, 12), vx: rnd(-0.7, 0.7), vy: rnd(-1.3, -0.3), life: 1.5, r: rnd(big ? 16 : 8, big ? 30 : 17), color: 0x556677, grav: -0.02 });
  }
  s.shockwaves.push({ id: nid(), x, y, r: 4, maxR: big ? 85 : 46, life: 1, color: big ? 0xffcc44 : 0xffee99 });
}
function spawnHitSparks(s: ReturnType<typeof mkGs>, x: number, y: number, col = 0xffcc44) {
  for (let i = 0; i < 7; i++) {
    const a = Math.random() * Math.PI * 2;
    s.particles.push({ id: nid(), x, y, vx: Math.cos(a) * rnd(2, 6), vy: Math.sin(a) * rnd(2, 6), life: 0.55, r: 1.8, color: col, grav: 0.06 });
  }
}
function spawnPickup(s: ReturnType<typeof mkGs>, x: number, y: number, dropChance: number, score: number, isBoss = false) {
  if (Math.random() > dropChance) return;
  // Boss always drops health if player is missing HP, otherwise random
  let kind: "missile" | "spread" | "plasma" | "health";
  if (isBoss && s.hp < CFG.player.startHp) {
    kind = "health";
  } else {
    const pool: typeof kind[] = score >= 15
      ? ["missile", "spread", "plasma", "health", "health"]  // higher chance of health at higher scores
      : score >= 8
        ? ["missile", "spread", "health"]
        : ["spread", "health"];
    kind = pool[Math.floor(Math.random() * pool.length)];
  }
  s.pickups.push({ id: nid(), x, y, kind, vy: -1.5, frame: 0 });
}

// ════════════════════════════════════════════════════════════════════════════
// TIME OF DAY PALETTE
// ════════════════════════════════════════════════════════════════════════════
const PAL = {
  day: { sky0: 0x0e2244, sky1: 0x1e4a8a, sky2: 0x2a6aaa, hor: 0x4a90d0, ground: 0x2a5a12, cityBase: 0x0c1a2e },
  dusk: { sky0: 0x150820, sky1: 0x3a1040, sky2: 0xc04020, hor: 0xff7730, ground: 0x1a2808, cityBase: 0x080c18 },
  night: { sky0: 0x020810, sky1: 0x0a1628, sky2: 0x0f2040, hor: 0x0f2040, ground: 0x0c1a08, cityBase: 0x060c18 },
  dawn: { sky0: 0x100818, sky1: 0x3a0a30, sky2: 0xaa3010, hor: 0xff5520, ground: 0x182205, cityBase: 0x080c14 },
};
function getPal(tod: number) {
  const blend = (a: typeof PAL.day, b: typeof PAL.day, t: number) => Object.fromEntries(Object.keys(a).map(k => [k, lerpColor((a as any)[k], (b as any)[k], t)])) as typeof PAL.day;
  if (tod < 0.25) return blend(PAL.day, PAL.dusk, tod / 0.25);
  if (tod < 0.50) return blend(PAL.dusk, PAL.night, (tod - 0.25) / 0.25);
  if (tod < 0.75) return blend(PAL.night, PAL.dawn, (tod - 0.50) / 0.25);
  return blend(PAL.dawn, PAL.day, (tod - 0.75) / 0.25);
}

function drawSkyGfx(g: any, tod: number) {
  g.clear();
  const p = getPal(tod);
  const cols = [p.sky0, p.sky0, p.sky1, p.sky1, p.sky2, p.sky2, p.hor, p.hor];
  for (let i = 0; i < 8; i++) { const y0 = (i / 8) * GY; g.beginFill(lerpColor(cols[i], cols[Math.min(i + 1, 7)], 0.5)).drawRect(0, y0, W, GY / 8 + 1).endFill(); }
  // celestial
  const isNight = tod > 0.38 && tod < 0.62;
  const isDawn = tod >= 0.62 && tod < 0.88;
  const isDusk = tod >= 0.12 && tod < 0.38;
  if (isNight) {
    g.beginFill(0xeeeedd, 0.88).drawCircle(W - 62, 58, 21).endFill();
    g.beginFill(0x030c1e, 0.82).drawCircle(W - 53, 52, 19).endFill();
  } else if (isDawn) {
    const t = Math.sin((tod - 0.62) / 0.26 * Math.PI);
    g.beginFill(0xffcc44, t * 0.78).drawCircle(80, GY - 28, 24).endFill();
    g.beginFill(0xffee88, t * 0.35).drawCircle(80, GY - 28, 40).endFill();
  } else if (isDusk) {
    const t = Math.sin((tod - 0.12) / 0.26 * Math.PI);
    g.beginFill(0xffaa33, t * 0.72).drawCircle(W - 80, GY - 32, 22).endFill();
    g.beginFill(0xffdd77, t * 0.32).drawCircle(W - 80, GY - 32, 38).endFill();
  } else {
    g.beginFill(0xffee88, 0.82).drawCircle(W - 68, 52, 19).endFill();
    g.beginFill(0xffffff, 0.22).drawCircle(W - 68, 52, 30).endFill();
  }
}
function drawStarGfx(g: any, tod: number, frame: number) {
  const alpha = tod < 0.3 ? 0 : tod < 0.45 ? (tod - 0.3) / 0.15 : tod < 0.55 ? 1 : tod < 0.7 ? (0.7 - tod) / 0.15 : 0;
  g.clear(); if (alpha < 0.02) return;
  const rng = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5; return x - Math.floor(x); };
  for (let i = 0; i < 100; i++) {
    const sx = rng(i * 2) * W, sy = rng(i * 2 + 1) * GY * 0.55;
    const sr = rng(i * 3) * 1.5 + 0.3, sa = (0.3 + rng(i * 5) * 0.7) * alpha;
    const twinkle = 0.7 + 0.3 * Math.sin(frame * 0.02 + i);
    g.beginFill([0xffffff, 0xaaddff, 0xffddaa, 0xffaacc, 0xaaffdd][i % 5], sa * twinkle).drawCircle(sx, sy, sr).endFill();
  }
}
function drawSearchlightGfx(g: any, tod: number, frame: number) {
  const a = tod > 0.4 && tod < 0.6 ? Math.min(1, Math.sin((tod - 0.4) / 0.2 * Math.PI)) : 0;
  g.clear(); if (a < 0.02) return;
  [[60, Math.sin(frame * 0.008)], [370, Math.sin(frame * 0.012 + 2)]].forEach(([bx, sw]) => {
    const tx = (bx as number) + Math.cos(sw as number) * 280, ty = GY - 280;
    g.beginFill(0xeeeebb, 0.055 * a).moveTo(bx as number, GY).lineTo(tx - 22, ty).lineTo(tx + 22, ty).closePath().endFill();
    g.beginFill(0xffffff, 0.55 * a).drawCircle(bx as number, GY, 4.5).endFill();
  });
}
function drawMountainsGfx(g: any, off: number, tod: number) {
  g.clear();
  const p = getPal(tod);
  const darkFar = lerpColor(p.sky0, 0x0a1a28, 0.5);
  const darkMid = lerpColor(p.sky1, 0x0e2235, 0.5);
  const darkNear = lerpColor(p.sky2, 0x112640, 0.45);
  // Far
  g.beginFill(darkFar);
  const fp = [0, 340, 55, 255, 110, 295, 168, 222, 235, 272, 292, 210, 352, 252, 412, 202, 480, 242, 480, GY, 0, GY];
  fp.forEach((v, i) => { if (i === 0) g.moveTo(fp[0], fp[1]); else if (i % 2 === 0) g.lineTo(fp[i], fp[i + 1]); }); g.closePath().endFill();
  // Mid
  const o2 = (off * 0.18) % 480;
  g.beginFill(darkMid);
  const mp = [0, 375, 72, 282, 145, 322, 218, 256, 295, 302, 368, 262, 442, 292, 526, 266, 610, 286, 692, 262, 776, 280];
  mp.forEach((v, i) => { if (i === 0) g.moveTo(v - o2, mp[1]); else if (i % 2 === 0) g.lineTo(v - o2, mp[i + 1]); });
  g.lineTo(776 - o2, GY).lineTo(-o2, GY).closePath().endFill();
  g.beginFill(0xd0e4f8, tod > 0.35 && tod < 0.65 ? 0.05 : 0.12);
  [[72, 282], [218, 256], [368, 262], [526, 266]].forEach(([mx, my]) => { const ax = mx - o2; if (ax < -20 || ax > W + 20) return; g.moveTo(ax, my).lineTo(ax - 19, my + 26).lineTo(ax + 19, my + 26).closePath(); }); g.endFill();
  // Near
  const o3 = (off * 0.32) % 480;
  g.beginFill(darkNear);
  const np = [0, 435, 85, 382, 165, 412, 240, 376, 318, 402, 398, 372, 478, 394, 558, 378, 638, 386];
  np.forEach((v, i) => { if (i === 0) g.moveTo(v - o3, np[1]); else if (i % 2 === 0) g.lineTo(v - o3, np[i + 1]); });
  g.lineTo(638 - o3, GY).lineTo(-o3, GY).closePath().endFill();
}
function drawCityGfx(g: any, off: number, tod: number) {
  g.clear();
  const p = getPal(tod);
  const night = tod > 0.38 && tod < 0.62;
  const ox = (off * 0.55) % 300;
  const blgs = [{ x: 0, w: 28, h: 82 }, { x: 32, w: 20, h: 115 }, { x: 55, w: 35, h: 68 }, { x: 94, w: 22, h: 98 }, { x: 119, w: 19, h: 132 }, { x: 141, w: 30, h: 72 }, { x: 174, w: 24, h: 104 }, { x: 201, w: 17, h: 88 }, { x: 221, w: 38, h: 62 }, { x: 262, w: 21, h: 118 }, { x: 286, w: 27, h: 78 }, { x: 320, w: 28, h: 82 }, { x: 352, w: 20, h: 115 }, { x: 375, w: 35, h: 68 }, { x: 414, w: 22, h: 98 }];
  blgs.forEach(b => {
    const bx = ((b.x - ox) % 320 + 320) % 320 - 10; if (bx > W + 10) return;
    g.beginFill(p.cityBase).drawRect(bx, GY - b.h, b.w, b.h).endFill();
    const wa = night ? 0.6 : 0.14;
    for (let wy = GY - b.h + 6; wy < GY - 8; wy += 11) for (let wx = bx + 3; wx < bx + b.w - 5; wx += 7) if (Math.sin(bx * wx * wy * 0.001) > 0) g.beginFill(0xffdd88, wa).drawRect(wx, wy, 4, 6).endFill();
    if (b.h > 100) {
      g.lineStyle(1.5, p.cityBase).moveTo(bx + b.w / 2, GY - b.h).lineTo(bx + b.w / 2, GY - b.h - 15).lineStyle(0);
      g.beginFill(night ? 0xff3333 : 0xff3344, 0.5 + Math.sin(off * 0.05) * 0.4).drawCircle(bx + b.w / 2, GY - b.h - 15, 2.5).endFill();
    }
  });
}
function drawGroundGfx(g: any, off: number, tod: number) {
  g.clear();
  const p = getPal(tod);
  g.beginFill(0x040802).drawRect(0, GY, W, H - GY).endFill();
  g.beginFill(p.ground).drawRect(0, GY, W, 14).endFill();
  g.beginFill(lerpColor(p.ground, 0x4aaa22, 0.6)).drawRect(0, GY, W, 6).endFill();
  g.lineStyle(2, 0xffffff, 0.06);
  const doff = (off * 1.8) % 50;
  for (let dx = -doff; dx < W + 22; dx += 50) g.moveTo(dx, GY + 24).lineTo(dx + 22, GY + 24);
  g.lineStyle(0);
  g.beginFill(lerpColor(p.ground, 0x5acc22, 0.55));
  for (let gx = -(off * 1.8 % 24); gx < W + 24; gx += 24) g.moveTo(gx, GY + 14).lineTo(gx + 3, GY + 2).lineTo(gx + 6, GY + 14).closePath();
  g.endFill();
}

// ════════════════════════════════════════════════════════════════════════════
// BG OBJECTS
// ════════════════════════════════════════════════════════════════════════════
function drawBalloonGfx(g: any, x: number, y: number, frame: number) {
  g.clear();
  const sway = Math.sin(frame * 0.012) * 3;
  g.beginFill(0xff4444).drawEllipse(x + sway, y, 23, 30).endFill();
  g.beginFill(0xffff44).moveTo(x + sway - 23, y).lineTo(x + sway, y - 30).lineTo(x + sway + 23, y).closePath().endFill();
  g.beginFill(0x44ff88).drawEllipse(x + sway, y + 15, 23, 15).endFill();
  g.lineStyle(1, 0xcc2200, 0.4);
  for (let i = -2; i <= 2; i++) g.moveTo(x + sway + i * 11, y - 30).lineTo(x + sway + i * 6, y + 30);
  g.lineStyle(0);
  g.beginFill(0xcc8822).drawRoundedRect(x + sway - 10, y + 32, 20, 12, 2).endFill();
  g.lineStyle(1, 0xaa6611, 0.7);
  [[-8, 32], [8, 32]].forEach(([dx, dy]) => g.moveTo(x + sway + dx * 0.7, y + 28).lineTo(x + sway + dx, y + dy));
  g.lineStyle(0);
}
function drawBirdsGfx(g: any, obj: BgObj, frame: number) {
  g.clear();
  const flap = Math.sin(frame * 0.18 + (obj.birdPhase || 0)) * 5;
  for (let i = 0; i < 5; i++) {
    const bx = obj.x + i * 15, by = obj.y + Math.sin(i * 1.4 + frame * 0.05) * 8;
    g.lineStyle(1.8, 0x334455, 0.6);
    g.moveTo(bx - 7, by + flap * (i % 2 === 0 ? 1 : -1)).lineTo(bx, by).lineTo(bx + 7, by + flap * (i % 2 === 0 ? -1 : 1));
    g.lineStyle(0);
  }
}
function drawUFOGfx(g: any, obj: BgObj, frame: number) {
  g.clear();
  const x = obj.x, y = obj.y + Math.sin(frame * 0.025) * 6;
  // Beam
  g.beginFill(0x88ffcc, 0.08 + 0.04 * Math.sin(frame * 0.08)).moveTo(x - 18, y + 16).lineTo(x - 40, y + 70).lineTo(x + 40, y + 70).lineTo(x + 18, y + 16).closePath().endFill();
  // Saucer body
  g.beginFill(0x223344).drawEllipse(x, y, 55, 14).endFill();
  g.beginFill(0x334455, 0.8).drawEllipse(x, y - 4, 32, 16).endFill();
  g.beginFill(0x88eeff, 0.5).drawEllipse(x, y - 6, 16, 8).endFill();
  // Lights
  const lCols = [0xff2222, 0xffee22, 0x22ffee, 0x2222ff];
  for (let i = 0; i < 8; i++) { const lx = x + Math.cos((i / 8) * Math.PI * 2) * 46, ly = y + Math.sin((i / 8) * Math.PI * 2) * 10; g.beginFill(lCols[i % 4], 0.5 + 0.5 * Math.sin(frame * 0.1 + i)).drawCircle(lx, ly, 2.5).endFill(); }
}


// ════════════════════════════════════════════════════════════════════════════
// ANIMATION HELPERS
// ════════════════════════════════════════════════════════════════════════════

// Build a motion-blur rotor: N real blades + N*2 ghost blades trailing behind
function buildRotor(PIXI: any, name: string, cx: number, cy: number, bladeLen: number, blades: number, color: number, ghostColor: number) {
  const r = new PIXI.Container(); r.name = name; r.x = cx; r.y = cy;
  // Ghost blades (trailing, fading)
  const ghostCount = blades * 3;
  for (let i = 0; i < ghostCount; i++) {
    const a = (i / ghostCount) * Math.PI * 2;
    const alpha = (1 - i / ghostCount) * 0.18;
    const g = new PIXI.Graphics();
    g.lineStyle(2.5, ghostColor, alpha).moveTo(0, 0).lineTo(0, -bladeLen);
    g.rotation = a;
    r.addChild(g);
  }
  // Real blades
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * Math.PI * 2;
    const bl = new PIXI.Graphics();
    // Blade: wide at root, tapered at tip
    bl.beginFill(color, 0.92);
    bl.moveTo(-3, 0).lineTo(-1.5, -bladeLen).lineTo(1.5, -bladeLen).lineTo(3, 0).closePath();
    bl.endFill();
    // Highlight sheen
    bl.beginFill(0xffffff, 0.3).moveTo(-1, 0).lineTo(-0.5, -bladeLen * 0.7).lineTo(0.5, -bladeLen * 0.7).lineTo(1, 0).closePath().endFill();
    bl.rotation = a;
    r.addChild(bl);
  }
  return r;
}

// Engine glow graphics — redrawn each frame, lives on its own layer
function drawEngineGlow(g: any, x: number, y: number, frame: number, color: number, isPlayer: boolean) {
  const pulse = 0.65 + 0.35 * Math.sin(frame * 0.18);
  const r1 = (isPlayer ? 7 : 5) * pulse;
  const r2 = r1 * 2.2;
  g.beginFill(color, 0.55 * pulse).drawCircle(x, y, r1).endFill();
  g.beginFill(color, 0.18 * pulse).drawCircle(x, y, r2).endFill();
  // Heat shimmer streaks
  for (let i = 0; i < 3; i++) {
    const sy = y + Math.sin(frame * 0.22 + i * 2.1) * 3;
    g.beginFill(0xffffff, 0.12 * pulse).drawEllipse(x - (isPlayer ? 6 : 5) - i * 3, sy, 4, 1.5).endFill();
  }
}


// ════════════════════════════════════════════════════════════════════════════
// PLAYER HELICOPTER
// ════════════════════════════════════════════════════════════════════════════
function buildPlayerHeli(PIXI: any) {
  const c = new PIXI.Container();
  const sh = new PIXI.Graphics();
  sh.beginFill(0x000000, 0.18).drawEllipse(42, 52, 40, 8).endFill();
  sh.filters = [new PIXI.BlurFilter(5)]; c.addChild(sh);
  const tail = new PIXI.Graphics();
  tail.beginFill(0x2a3a5a).moveTo(50, 18).lineTo(88, 20).lineTo(88, 26).lineTo(50, 26).closePath().endFill();
  for (let rx = 56; rx < 86; rx += 6)tail.beginFill(0xffffff, 0.1).drawCircle(rx, 23, 1).endFill();
  tail.beginFill(0x1a2a40).moveTo(82, 20).lineTo(90, 11).lineTo(90, 20).closePath().endFill();
  c.addChild(tail);
  const body = new PIXI.Graphics();
  body.beginFill(0x1e4a9a);
  body.moveTo(8, 22).bezierCurveTo(8, 8, 16, 8, 24, 10).lineTo(56, 10).bezierCurveTo(66, 10, 70, 14, 70, 22).bezierCurveTo(70, 30, 66, 34, 56, 34).lineTo(18, 34).bezierCurveTo(10, 34, 8, 30, 8, 22).closePath().endFill();
  body.lineStyle(0.5, 0x88aaff, 0.18).moveTo(22, 12).lineTo(22, 32).moveTo(42, 10).lineTo(42, 34).lineStyle(0);
  body.beginFill(0x5a8ee0, 0.38).drawEllipse(38, 13, 21, 5).endFill(); c.addChild(body);
  const glass = new PIXI.Graphics();
  glass.beginFill(0x4aa8e8, 0.9).drawEllipse(25, 21, 14, 10).endFill();
  glass.beginFill(0xffffff, 0.55).drawEllipse(21, 17, 5, 3).endFill();
  glass.lineStyle(1.2, 0x88ccff, 0.5).drawEllipse(25, 21, 14, 10).lineStyle(0); c.addChild(glass);
  c.addChild(new PIXI.Graphics().beginFill(0x163e88).moveTo(8, 16).lineTo(1, 22).lineTo(8, 28).closePath().endFill());
  const wp = new PIXI.Graphics();
  wp.beginFill(0x223355).drawRoundedRect(58, 16, 12, 16, 3).endFill();
  wp.beginFill(0x445566).drawRoundedRect(70, 19, 22, 3, 1).drawRoundedRect(70, 25, 22, 3, 1).endFill();
  wp.beginFill(0xffee88, 0.35).drawCircle(92, 20, 3).drawCircle(92, 27, 3).endFill(); c.addChild(wp);
  const sk = new PIXI.Graphics(); sk.lineStyle(2.5, 0x1a2a5a, 1, 0.5);
  sk.moveTo(14, 34).lineTo(14, 42).lineTo(54, 42).lineTo(54, 34); sk.moveTo(20, 42).lineTo(20, 47); sk.moveTo(48, 42).lineTo(48, 47); c.addChild(sk);
  c.addChild(new PIXI.Graphics().beginFill(0x111122).drawCircle(36, 10, 5).endFill());
  c.addChild(buildRotor(PIXI, "mr", 36, 10, 46, 3, 0x88ccff, 0x88bbff));
  c.addChild(buildRotor(PIXI, "tr", 89, 23, 11, 4, 0x88ccff, 0x7788dd));
  // Engine glow placeholder (drawn live each frame)
  const engGlow = new PIXI.Graphics(); engGlow.name = "engGlow"; c.addChild(engGlow);
  return c;
}

// ════════════════════════════════════════════════════════════════════════════
// ENEMY BUILDERS
// ════════════════════════════════════════════════════════════════════════════
function addHpBar(c: any, PIXI: any, w: number) {
  const bg = new PIXI.Graphics(); bg.beginFill(0x000000, 0.5).drawRoundedRect(2, -15, w, 8, 3).endFill(); bg.name = "hpBg"; c.addChild(bg);
  const bar = new PIXI.Graphics(); bar.name = "hpBar"; c.addChild(bar);
}
const HP_BAR_W: Record<EnemyType, number> = { scout: 56, gunship: 72, bomber: 70, ace: 64, jet: 82, boss: 120 };
const ENEMY_W: Record<EnemyType, number> = { scout: 63, gunship: 77, bomber: 77, ace: 68, jet: 85, boss: 120 };
function refreshHpBar(ec: any, hp: number, maxHp: number, type: EnemyType) {
  const bar = ec.getChildByName("hpBar") as any; if (!bar) return;
  bar.clear();
  const pct = hp / maxHp, w = HP_BAR_W[type];
  const col = pct > 0.6 ? 0x22ee55 : pct > 0.3 ? 0xffaa00 : 0xff2222;
  bar.beginFill(col, 0.28).drawRoundedRect(1, -15, w * pct, 8, 3).endFill();
  bar.beginFill(col).drawRoundedRect(2, -14, (w - 2) * pct, 6, 2).endFill();
  bar.beginFill(0xffffff, 0.24).drawRoundedRect(2, -14, (w - 2) * pct, 2, 1).endFill();
}

function buildScout(PIXI: any) {
  const c = new PIXI.Container();
  const tail = new PIXI.Graphics(); tail.beginFill(0x4a0808).moveTo(22, 16).lineTo(-10, 18).lineTo(-10, 23).lineTo(22, 23).closePath().endFill(); tail.beginFill(0x330606).moveTo(-4, 18).lineTo(-13, 11).lineTo(-13, 18).closePath().endFill(); c.addChild(tail);
  const body = new PIXI.Graphics(); body.beginFill(0xcc2020); body.moveTo(56, 19).bezierCurveTo(56, 8, 49, 7, 41, 8).lineTo(15, 8).bezierCurveTo(6, 8, 3, 12, 3, 19).bezierCurveTo(3, 26, 6, 29, 15, 29).lineTo(41, 29).bezierCurveTo(49, 29, 56, 26, 56, 19).closePath().endFill(); body.beginFill(0xff5555, 0.3).drawEllipse(30, 11, 16, 4).endFill(); c.addChild(body);
  const glass = new PIXI.Graphics(); glass.beginFill(0xff9988, 0.88).drawEllipse(41, 18, 12, 8).endFill(); glass.beginFill(0xffffff, 0.4).drawEllipse(44, 15, 4, 2.5).endFill(); c.addChild(glass);
  c.addChild(new PIXI.Graphics().beginFill(0x880808).moveTo(56, 14).lineTo(63, 19).lineTo(56, 24).closePath().endFill());
  c.addChild(new PIXI.Graphics().beginFill(0x334).drawRoundedRect(-15, 16, 16, 3, 1).drawRoundedRect(-15, 21, 16, 3, 1).endFill());
  const sk = new PIXI.Graphics(); sk.lineStyle(2, 0x880a0a, 1, 0.5); sk.moveTo(10, 29).lineTo(10, 35).lineTo(44, 35).lineTo(44, 29); sk.moveTo(15, 35).lineTo(15, 39); sk.moveTo(40, 35).lineTo(40, 39); c.addChild(sk);
  c.addChild(new PIXI.Graphics().beginFill(0x220808).drawCircle(28, 7, 4).endFill());
  c.addChild(buildRotor(PIXI, "mr", 28, 7, 32, 3, 0xff9977, 0xdd7755));
  c.addChild(buildRotor(PIXI, "tr", -12, 20, 8, 4, 0xff9977, 0xdd7755));
  const engGlow = new PIXI.Graphics(); engGlow.name = "engGlow"; c.addChild(engGlow);
  addHpBar(c, PIXI, 56); return c;
}

function buildGunship(PIXI: any) {
  const c = new PIXI.Container();
  const tail = new PIXI.Graphics(); tail.beginFill(0x2a3a10).moveTo(32, 20).lineTo(-14, 23).lineTo(-14, 29).lineTo(32, 29).closePath().endFill(); tail.beginFill(0x1a2808).moveTo(-8, 23).lineTo(-18, 14).lineTo(-18, 23).closePath().endFill(); c.addChild(tail);
  const body = new PIXI.Graphics(); body.beginFill(0x3a5520); body.moveTo(74, 26).bezierCurveTo(74, 10, 64, 9, 52, 10).lineTo(18, 10).bezierCurveTo(6, 10, 3, 16, 3, 26).bezierCurveTo(3, 36, 6, 41, 18, 41).lineTo(52, 41).bezierCurveTo(64, 41, 74, 36, 74, 26).closePath().endFill(); body.beginFill(0x4a6a28).drawRoundedRect(10, 12, 46, 8, 2).drawRoundedRect(10, 31, 46, 8, 2).endFill(); body.lineStyle(1, 0x88aa44, 0.18).moveTo(28, 10).lineTo(28, 41).moveTo(48, 10).lineTo(48, 41).lineStyle(0); body.beginFill(0x5a7a30, 0.35).drawEllipse(38, 14, 24, 6).endFill(); c.addChild(body);
  const glass = new PIXI.Graphics(); glass.beginFill(0x88cc66, 0.78).drawEllipse(52, 25, 15, 12).endFill(); glass.beginFill(0xffffff, 0.3).drawEllipse(55, 21, 5, 3).endFill(); c.addChild(glass);
  c.addChild(new PIXI.Graphics().beginFill(0x283a12).moveTo(74, 18).lineTo(82, 26).lineTo(74, 34).closePath().endFill());
  c.addChild(new PIXI.Graphics().beginFill(0x445533).drawRoundedRect(-18, 18, 20, 3, 1).drawRoundedRect(-18, 24, 20, 3, 1).drawRoundedRect(-18, 30, 20, 3, 1).endFill());
  const pods = new PIXI.Graphics(); pods.beginFill(0x2a3a18).drawRoundedRect(20, 41, 14, 10, 2).drawRoundedRect(44, 41, 14, 10, 2).endFill(); pods.beginFill(0x1a2a10).drawCircle(24, 46, 2).drawCircle(29, 46, 2).drawCircle(48, 46, 2).drawCircle(53, 46, 2).endFill(); c.addChild(pods);
  const sk = new PIXI.Graphics(); sk.lineStyle(3, 0x2a3a10, 1, 0.5); sk.moveTo(12, 41).lineTo(12, 50).lineTo(64, 50).lineTo(64, 41); sk.moveTo(18, 50).lineTo(18, 54); sk.moveTo(58, 50).lineTo(58, 54); c.addChild(sk);
  c.addChild(new PIXI.Graphics().beginFill(0x1a2208).drawCircle(24, 10, 5).drawCircle(50, 10, 5).endFill());
  c.addChild(buildRotor(PIXI, "mr1", 24, 10, 27, 4, 0x88cc44, 0x558822));
  c.addChild(buildRotor(PIXI, "mr2", 50, 10, 27, 4, 0x88cc44, 0x558822));
  c.addChild(buildRotor(PIXI, "tr", -15, 26, 9, 4, 0x88cc44, 0x558822));
  const engGlow = new PIXI.Graphics(); engGlow.name = "engGlow"; c.addChild(engGlow);
  addHpBar(c, PIXI, 72); return c;
}

function buildBomber(PIXI: any) {
  const c = new PIXI.Container();
  const tail = new PIXI.Graphics(); tail.beginFill(0x303040).moveTo(30, 18).lineTo(-12, 21).lineTo(-12, 28).lineTo(30, 28).closePath().endFill(); tail.beginFill(0x1a1a28).moveTo(-6, 21).lineTo(-16, 12).lineTo(-16, 21).closePath().endFill(); c.addChild(tail);
  const body = new PIXI.Graphics(); body.beginFill(0x4a4a5a); body.moveTo(70, 22).bezierCurveTo(70, 7, 60, 6, 48, 7).lineTo(16, 7).bezierCurveTo(4, 7, 2, 13, 2, 22).bezierCurveTo(2, 32, 4, 38, 16, 38).lineTo(48, 38).bezierCurveTo(60, 38, 70, 32, 70, 22).closePath().endFill(); body.beginFill(0x5a5a6a, 0.38).drawEllipse(36, 12, 22, 6).endFill(); body.lineStyle(0.8, 0xaaaacc, 0.14).moveTo(18, 7).lineTo(18, 38).moveTo(36, 6).lineTo(36, 38).moveTo(52, 7).lineTo(52, 38).lineStyle(0); c.addChild(body);
  const glass = new PIXI.Graphics(); glass.beginFill(0x8899cc, 0.8).drawEllipse(50, 21, 13, 10).endFill(); glass.beginFill(0xffffff, 0.34).drawEllipse(53, 17, 4.5, 3).endFill(); c.addChild(glass);
  c.addChild(new PIXI.Graphics().beginFill(0x282838).moveTo(70, 15).lineTo(79, 22).lineTo(70, 29).closePath().endFill());
  c.addChild(new PIXI.Graphics().beginFill(0x445).drawRoundedRect(-14, 17, 16, 3, 1).drawRoundedRect(-14, 23, 16, 3, 1).endFill());
  const rack = new PIXI.Graphics(); rack.beginFill(0x333344).drawRoundedRect(14, 38, 42, 7, 2).endFill(); rack.beginFill(0x222228);[18, 26, 34, 42, 50].forEach(bx => rack.drawEllipse(bx, 38, 3, 5)); rack.endFill(); c.addChild(rack);
  const sk = new PIXI.Graphics(); sk.lineStyle(2.5, 0x2a2a38, 1, 0.5); sk.moveTo(12, 38).lineTo(12, 47).lineTo(62, 47).lineTo(62, 38); sk.moveTo(20, 47).lineTo(20, 51); sk.moveTo(54, 47).lineTo(54, 51); c.addChild(sk);
  c.addChild(new PIXI.Graphics().beginFill(0x181820).drawCircle(36, 7, 5).endFill());
  c.addChild(buildRotor(PIXI, "mr", 36, 7, 36, 4, 0x99aacc, 0x778899));
  c.addChild(buildRotor(PIXI, "tr", -13, 24, 9, 4, 0x99aacc, 0x778899));
  const engGlow = new PIXI.Graphics(); engGlow.name = "engGlow"; c.addChild(engGlow);
  addHpBar(c, PIXI, 70); return c;
}

function buildAce(PIXI: any) {
  const c = new PIXI.Container();
  const tail = new PIXI.Graphics(); tail.beginFill(0x1a1400).moveTo(28, 17).lineTo(-8, 19).lineTo(-8, 24).lineTo(28, 24).closePath().endFill(); tail.beginFill(0xcc9900, 0.65).moveTo(-4, 19).lineTo(-12, 12).lineTo(-12, 19).closePath().endFill(); c.addChild(tail);
  const body = new PIXI.Graphics(); body.beginFill(0x1a1100); body.moveTo(60, 20).lineTo(55, 8).lineTo(48, 7).lineTo(14, 7).lineTo(6, 12).lineTo(4, 20).lineTo(6, 28).lineTo(14, 33).lineTo(48, 33).lineTo(55, 32).closePath().endFill(); body.beginFill(0xcc9900, 0.55).drawRoundedRect(10, 8, 42, 5, 2).drawRoundedRect(10, 27, 42, 5, 2).endFill(); body.lineStyle(1, 0xffcc44, 0.38).moveTo(26, 7).lineTo(26, 33).moveTo(44, 7).lineTo(44, 33).lineStyle(0); c.addChild(body);
  const glass = new PIXI.Graphics(); glass.beginFill(0xffcc44, 0.78).drawEllipse(44, 20, 13, 9).endFill(); glass.beginFill(0xffffff, 0.5).drawEllipse(47, 16, 4, 2.5).endFill(); c.addChild(glass);
  c.addChild(new PIXI.Graphics().beginFill(0x886600).moveTo(60, 14).lineTo(68, 20).lineTo(60, 26).closePath().endFill());
  const gun = new PIXI.Graphics(); gun.beginFill(0x554422); gun.moveTo(-14, 16).lineTo(2, 15).lineTo(2, 18).lineTo(-14, 19).closePath(); gun.moveTo(-14, 22).lineTo(2, 23).lineTo(2, 26).lineTo(-14, 25).closePath(); gun.endFill(); c.addChild(gun);
  const sk = new PIXI.Graphics(); sk.lineStyle(2, 0x664400, 1, 0.5); sk.moveTo(10, 33).lineTo(10, 39).lineTo(50, 39).lineTo(50, 33); sk.moveTo(15, 39).lineTo(15, 43); sk.moveTo(44, 39).lineTo(44, 43); c.addChild(sk);
  c.addChild(new PIXI.Graphics().beginFill(0x110e00).drawCircle(30, 7, 4).endFill());
  c.addChild(buildRotor(PIXI, "mr", 30, 7, 34, 3, 0xffcc44, 0xcc9900));
  c.addChild(buildRotor(PIXI, "tr", -9, 21, 9, 4, 0xffcc44, 0xcc9900));
  const engGlow = new PIXI.Graphics(); engGlow.name = "engGlow"; c.addChild(engGlow);
  addHpBar(c, PIXI, 64); return c;
}

function buildJet(PIXI: any) {
  const c = new PIXI.Container();
  const body = new PIXI.Graphics(); body.beginFill(0x5a6070); body.moveTo(74, 18).lineTo(62, 12).lineTo(18, 12).lineTo(4, 18).lineTo(18, 24).lineTo(62, 24).closePath().endFill(); body.beginFill(0x7a8a9a, 0.38).drawRoundedRect(22, 13, 34, 5, 2).endFill(); c.addChild(body);
  const wings = new PIXI.Graphics(); wings.beginFill(0x4a5060); wings.moveTo(16, 12).lineTo(2, -2).lineTo(-10, 3).lineTo(8, 12).closePath(); wings.moveTo(16, 24).lineTo(2, 38).lineTo(-10, 33).lineTo(8, 24).closePath(); wings.endFill(); wings.beginFill(0x6a7a8a, 0.28).moveTo(16, 12).lineTo(2, -2).lineTo(-4, 1).lineTo(10, 12).closePath().endFill(); c.addChild(wings);
  const glass = new PIXI.Graphics(); glass.beginFill(0x88aacc, 0.85).drawEllipse(50, 18, 14, 7).endFill(); glass.beginFill(0xffffff, 0.4).drawEllipse(53, 15, 5, 2.5).endFill(); c.addChild(glass);
  c.addChild(new PIXI.Graphics().beginFill(0x3a4050).moveTo(74, 14).lineTo(86, 18).lineTo(74, 22).closePath().endFill());
  const eng = new PIXI.Graphics(); eng.beginFill(0x222830).drawRoundedRect(-2, 13, 8, 10, 2).endFill(); eng.beginFill(0xff6600, 0.4).drawCircle(2, 23, 4).endFill(); eng.beginFill(0xffaa44, 0.18).drawCircle(2, 23, 7).endFill(); c.addChild(eng);
  c.addChild(new PIXI.Graphics().beginFill(0x3a4050).moveTo(6, 12).lineTo(-4, 4).lineTo(-4, 12).closePath().endFill());
  c.addChild(new PIXI.Graphics().beginFill(0x334).drawRoundedRect(-10, 16, 14, 3, 1).drawRoundedRect(-10, 20, 14, 3, 1).endFill());
  addHpBar(c, PIXI, 82); return c;
}

function buildBoss(PIXI: any) {
  const c = new PIXI.Container();
  const sh = new PIXI.Graphics(); sh.beginFill(0x000000, 0.28).drawEllipse(60, 75, 74, 13).endFill(); sh.filters = [new PIXI.BlurFilter(8)]; c.addChild(sh);
  const tail = new PIXI.Graphics(); tail.beginFill(0x1a0a2a).moveTo(50, 28).lineTo(-20, 32).lineTo(-20, 42).lineTo(50, 42).closePath().endFill(); tail.beginFill(0x2a0a3a).moveTo(-12, 32).lineTo(-28, 18).lineTo(-28, 32).closePath().endFill(); c.addChild(tail);
  const body = new PIXI.Graphics(); body.beginFill(0x2a0a4a); body.moveTo(112, 36).bezierCurveTo(112, 10, 96, 8, 78, 10).lineTo(24, 10).bezierCurveTo(6, 10, 4, 22, 4, 36).bezierCurveTo(4, 50, 6, 62, 24, 62).lineTo(78, 62).bezierCurveTo(96, 62, 112, 50, 112, 36).closePath().endFill(); body.beginFill(0x6a22aa, 0.38).drawRoundedRect(14, 14, 78, 10, 3).drawRoundedRect(14, 48, 78, 10, 3).endFill(); body.lineStyle(1, 0xaa44ff, 0.28).moveTo(32, 10).lineTo(32, 62).moveTo(54, 8).lineTo(54, 62).moveTo(76, 10).lineTo(76, 62).lineStyle(0); body.beginFill(0x8833cc, 0.32).drawEllipse(58, 18, 35, 9).endFill(); c.addChild(body);
  const glass = new PIXI.Graphics(); glass.beginFill(0xcc88ff, 0.8).drawEllipse(76, 36, 22, 16).endFill(); glass.beginFill(0xffffff, 0.44).drawEllipse(80, 29, 8, 5).endFill(); c.addChild(glass);
  c.addChild(new PIXI.Graphics().beginFill(0x1a0832).moveTo(112, 24).lineTo(124, 36).lineTo(112, 48).closePath().endFill());
  const guns = new PIXI.Graphics(); guns.beginFill(0x334); guns.drawRoundedRect(-22, 22, 24, 4, 2).drawRoundedRect(-22, 32, 24, 4, 2).drawRoundedRect(-22, 42, 24, 4, 2).endFill(); guns.beginFill(0x1a0a2e).drawRoundedRect(20, 62, 20, 14, 3).drawRoundedRect(70, 62, 20, 14, 3).endFill(); guns.beginFill(0xaa44ff, 0.28).drawCircle(24, 69, 3).drawCircle(29, 69, 3).drawCircle(74, 69, 3).drawCircle(79, 69, 3).endFill(); c.addChild(guns);
  const sk = new PIXI.Graphics(); sk.lineStyle(4, 0x1a0a2e, 1, 0.5); sk.moveTo(18, 62).lineTo(18, 74).lineTo(100, 74).lineTo(100, 62); sk.moveTo(26, 74).lineTo(26, 80); sk.moveTo(92, 74).lineTo(92, 80); c.addChild(sk);
  c.addChild(new PIXI.Graphics().beginFill(0x100620).drawCircle(26, 10, 7).drawCircle(58, 10, 7).drawCircle(90, 10, 7).endFill());
  c.addChild(buildRotor(PIXI, "mr1", 26, 10, 36, 4, 0xaa66ff, 0x7733cc));
  c.addChild(buildRotor(PIXI, "mr2", 58, 10, 36, 4, 0xaa66ff, 0x7733cc));
  c.addChild(buildRotor(PIXI, "mr3", 90, 10, 36, 4, 0xaa66ff, 0x7733cc));
  c.addChild(buildRotor(PIXI, "tr", -22, 37, 13, 4, 0xaa66ff, 0x7733cc));
  const engGlowB = new PIXI.Graphics(); engGlowB.name = "engGlow"; c.addChild(engGlowB);
  // Boss HP bar wider
  const hpBg2 = new PIXI.Graphics(); hpBg2.beginFill(0x000000, 0.6).drawRoundedRect(2, -22, 120, 10, 4).endFill(); hpBg2.name = "hpBg"; c.addChild(hpBg2);
  const hpBar2 = new PIXI.Graphics(); hpBar2.name = "hpBar"; c.addChild(hpBar2);
  const nt = new PIXI.Text("⚠ BOSS", { fontFamily: "monospace", fontSize: 9, fill: 0xee44ff, fontWeight: "bold" }); nt.x = 38; nt.y = -36; c.addChild(nt);
  return c;
}

const BUILDERS: Record<EnemyType, (p: any) => any> = { scout: buildScout, gunship: buildGunship, bomber: buildBomber, ace: buildAce, jet: buildJet, boss: buildBoss };

// ════════════════════════════════════════════════════════════════════════════
// REACT COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function GunshipLegend() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showSecondChance, setShowSecondChance] = useState(false);
  const [scQuestion, setScQuestion] = useState<{ img: string; answer: number } | null>(null);
  const [scInput, setScInput] = useState("");
  const [scError, setScError] = useState(false);
  const [scImgLoaded, setScImgLoaded] = useState(false);
  const secondChanceUsed = useRef(false); // one per session
  const [gameStarted, setGameStarted] = useState(false);
  const [uiState, setUiState] = useState({ weapon: "cannon" as WeaponType, ammo: { missile: 6, spread: 10, plasma: 4 }, hp: 3, tod: 0.05, combo: 0 });
  const [touchPos, setTouchPos] = useState<{ x: number, y: number } | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const mouseRef = useRef({ x: -1, y: -1, down: false });
  const touchMoveRef = useRef({ active: false, x: -1, y: -1, touchId: -1 });
  const fireRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scoreSubmitted = useRef(false);
  const keysRef = useRef(new Set<string>());
  const startedRef = useRef(false);
  const overRef = useRef(false);
  const gs = useRef(mkGs());

  const triggerGameOver = useCallback(async () => {
    if (scoreSubmitted.current) return;
    scoreSubmitted.current = true; overRef.current = true;
    try { (window.AudioContext || (window as any).webkitAudioContext) && createSoundSystem().gameOver(); } catch { }
    // Offer second chance once per session
    if (!secondChanceUsed.current) {
      try {
        const result = await getHeartQuestionAction();
        if (!result.success || !result.data) throw new Error(result.error);
        setScQuestion(result.data);
        setScImgLoaded(false); setScInput(""); setScError(false);
        setShowSecondChance(true);
        return; // don't show game over yet
      } catch { /* fallthrough to game over */ } 
    }
    setGameOver(true);
    const result = await submitScoreAction(gs.current.score);
    if (!result.success) toast.error(result.error ?? "Failed to submit score");
  }, []);

  const resetGame = useCallback(() => {
    uid = 0; // reset ID counter
    gs.current = mkGs(); scoreSubmitted.current = false; startedRef.current = false; overRef.current = false;
    setScore(0); setGameOver(false); setGameStarted(false);
    setUiState({ weapon: "cannon", ammo: { missile: 6, spread: 10, plasma: 4 }, hp: 3, tod: 0.05, combo: 0 });
    setGameKey(k => k + 1); // re-triggers useEffect → destroys old PixiJS, inits fresh canvas ✓
  }, []);

  const acceptSecondChance = useCallback(() => {
    if (!scQuestion) return;
    if (parseInt(scInput) !== scQuestion.answer) { setScError(true); return; }
    // Correct — resume game with restored HP
    secondChanceUsed.current = true;
    setShowSecondChance(false);
    overRef.current = false;
    scoreSubmitted.current = false;
    gs.current.hp = Math.min(CFG.player.startHp, 3);
    gs.current.invincible = CFG.player.invincibleFrames * 2;
    setGameStarted(true);
  }, [scQuestion, scInput]);

  const declineSecondChance = useCallback(() => {
    secondChanceUsed.current = true;
    setShowSecondChance(false);
    setGameOver(true);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    let app: any, destroyed = false;
    const enemyMap = new Map<number, any>();
    const bgObjGfxMap = new Map<number, { g: any, type: string }>();

    const init = async () => {
      const PIXI = await import("pixi.js");
      if (destroyed || !mountRef.current) return;
      app = new (PIXI as any).Application({ width: W, height: H, backgroundColor: 0x020810, antialias: true, resolution: 1, powerPreference: "high-performance" });
      const cv = app.view as HTMLCanvasElement;
      cv.style.width = "100%";
      cv.style.height = "100%";
      cv.style.display = "block";
      mountRef.current!.appendChild(cv);

      const snd = createSoundSystem();

      const bgLayer = new PIXI.Container();
      const midLayer = new PIXI.Container();
      const gameLayer = new PIXI.Container();
      const fxLayer = new PIXI.Container();
      const hudLayer = new PIXI.Container();
      app.stage.addChild(bgLayer, midLayer, gameLayer, fxLayer, hudLayer);

      const skyGfx = new PIXI.Graphics(); bgLayer.addChild(skyGfx);
      const starGfx = new PIXI.Graphics(); bgLayer.addChild(starGfx);
      const slGfx = new PIXI.Graphics(); bgLayer.addChild(slGfx);
      const mtGfx = new PIXI.Graphics(); midLayer.addChild(mtGfx);
      const cityGfx = new PIXI.Graphics(); midLayer.addChild(cityGfx);
      const gndGfx = new PIXI.Graphics(); midLayer.addChild(gndGfx);
      const bgObjLayer = new PIXI.Container(); midLayer.addChild(bgObjLayer);
      const balloonGfx = new PIXI.Graphics(); bgObjLayer.addChild(balloonGfx);

      const clouds = [{ x: 40, y: 50, w: 100, h: 33, spd: 0.35 }, { x: 180, y: 90, w: 82, h: 27, spd: 0.55 }, { x: 310, y: 40, w: 120, h: 39, spd: 0.22 }, { x: 400, y: 130, w: 90, h: 29, spd: 0.45 }];
      const cloudGfxArr = clouds.map(c => {
        const g = new PIXI.Graphics();
        g.beginFill(0x08112a, 0.18).drawEllipse(c.w * .5 + 3, c.h * .62 + 4, c.w * .42, c.h * .38).endFill();
        [[c.w * .5, c.h * .6, c.w * .43, c.h * .43], [c.w * .28, c.h * .65, c.w * .28, c.h * .35], [c.w * .72, c.h * .65, c.w * .26, c.h * .32], [c.w * .5, c.h * .35, c.w * .24, c.h * .31]].forEach(([ex, ey, rx, ry]) => g.beginFill(0xc8d8f0, 0.48).drawEllipse(ex, ey, rx, ry).endFill());
        g.beginFill(0xffffff, 0.26).drawEllipse(c.w * .4, c.h * .36, c.w * .13, c.h * .13).endFill();
        g.x = c.x; g.y = c.y; midLayer.addChild(g); return g;
      });

      const glowGfx = new PIXI.Graphics(); glowGfx.filters = [new PIXI.BlurFilter(7)]; fxLayer.addChild(glowGfx);
      const bulletGfx = new PIXI.Graphics(); fxLayer.addChild(bulletGfx);
      const partGfx = new PIXI.Graphics(); fxLayer.addChild(partGfx);
      const pickupGfx = new PIXI.Graphics(); fxLayer.addChild(pickupGfx);

      const player = buildPlayerHeli(PIXI);
      // Tail rotor behind body
      const pTrR = player.getChildByName("tr") as any;
      if (pTrR) { player.removeChild(pTrR); player.addChildAt(pTrR, 0); }
      player.scale.x = -1; player.x = gs.current.heli.x; player.y = gs.current.heli.y; gameLayer.addChild(player);
      const muzzleGfx = new PIXI.Graphics(); muzzleGfx.alpha = 0; gameLayer.addChild(muzzleGfx);

      // ── HUD
      const scoreBg = new PIXI.Graphics(); scoreBg.beginFill(0x000000, 0.45).drawRoundedRect(W / 2 - 55, 8, 110, 34, 8).endFill(); scoreBg.lineStyle(1, 0x4488bb, 0.22).drawRoundedRect(W / 2 - 55, 8, 110, 34, 8).lineStyle(0); hudLayer.addChild(scoreBg);
      const scoreTxt = new PIXI.Text("0000", { fontFamily: "'Courier New',monospace", fontSize: 22, fontWeight: "bold", fill: 0x88ddff, dropShadow: true, dropShadowColor: 0x0044aa, dropShadowBlur: 10, dropShadowDistance: 0 }); scoreTxt.x = W / 2 - scoreTxt.width / 2; scoreTxt.y = 12; hudLayer.addChild(scoreTxt);
      const hpBg2 = new PIXI.Graphics(); hpBg2.beginFill(0x000000, 0.45).drawRoundedRect(10, 8, CFG.player.startHp * 22 + 14, 34, 8).endFill(); hpBg2.lineStyle(1, 0xaa3333, 0.22).drawRoundedRect(10, 8, CFG.player.startHp * 22 + 14, 34, 8).lineStyle(0); hudLayer.addChild(hpBg2);
      const hpLbl = new PIXI.Text("HULL", { fontFamily: "monospace", fontSize: 9, fill: 0xff9999, dropShadowAlpha: 0.7 }); hpLbl.x = 16; hpLbl.y = 13; hudLayer.addChild(hpLbl);
      const hpBars = Array.from({ length: CFG.player.startHp }, () => { const b = new PIXI.Graphics(); hudLayer.addChild(b); return b; });
      const wpPanel = new PIXI.Graphics(); wpPanel.beginFill(0x000000, 0.44).drawRoundedRect(10, H - 68, 210, 56, 8).endFill(); wpPanel.lineStyle(1, 0x4466aa, 0.18).drawRoundedRect(10, H - 68, 210, 56, 8).lineStyle(0); hudLayer.addChild(wpPanel);
      const wpTxt = new PIXI.Text("", { fontFamily: "monospace", fontSize: 10, fill: 0x88ccff }); wpTxt.x = 16; wpTxt.y = H - 64; hudLayer.addChild(wpTxt);
      const ammoBar = new PIXI.Text("", { fontFamily: "monospace", fontSize: 8.5, fill: 0xffee88 }); ammoBar.x = 16; ammoBar.y = H - 50; hudLayer.addChild(ammoBar);
      const hintTxt = new PIXI.Text("1=CANNON  2=MISSILE  3=SPREAD  4=PLASMA  SPACE=FIRE", { fontFamily: "monospace", fontSize: 7, fill: 0x6688aa, dropShadowAlpha: 0.55 }); hintTxt.x = 16; hintTxt.y = H - 30; hudLayer.addChild(hintTxt);
      const todTxt = new PIXI.Text("", { fontFamily: "monospace", fontSize: 8, fill: 0xaabbcc, dropShadowAlpha: 0.5 }); todTxt.x = W - 70; todTxt.y = H - 22; hudLayer.addChild(todTxt);
      const killTxt = new PIXI.Text("", { fontFamily: "monospace", fontSize: 9, fill: 0xffcc44, dropShadowAlpha: 0.6 }); killTxt.anchor.set(1, 0); killTxt.x = W - 10; killTxt.y = 50; hudLayer.addChild(killTxt);
      const comboTxt = new PIXI.Text("", { fontFamily: "monospace", fontSize: 14, fontWeight: "bold", fill: 0xffcc44 }); comboTxt.anchor.set(0.5, 0); comboTxt.x = W / 2; comboTxt.y = 46; hudLayer.addChild(comboTxt);

      // ── TICKER ────────────────────────────────────────────────────────────
      app.ticker.add(() => {
        if (destroyed) return;
        const s = gs.current, started = startedRef.current, over = overRef.current;
        s.frame++;

        // TOD
        if (started && !over) { s.tod += 0.00006 * s.todDir; if (s.tod >= 1) { s.tod = 1; s.todDir = -1; } if (s.tod <= 0) { s.tod = 0; s.todDir = 1; } }

        // Shake
        s.shake.intensity *= 0.77;
        const sx = (Math.random() - 0.5) * s.shake.intensity, sy = (Math.random() - 0.5) * s.shake.intensity;
        gameLayer.x = sx; gameLayer.y = sy; fxLayer.x = sx; fxLayer.y = sy;

        // BG draw
        drawSkyGfx(skyGfx, s.tod); drawStarGfx(starGfx, s.tod, s.frame); drawSearchlightGfx(slGfx, s.tod, s.frame);
        if (started && !over) s.bgOff += 1.4;
        drawMountainsGfx(mtGfx, s.bgOff, s.tod); drawCityGfx(cityGfx, s.bgOff, s.tod); drawGroundGfx(gndGfx, s.bgOff, s.tod);
        clouds.forEach((c, i) => { if (started && !over) { c.x -= c.spd; if (c.x + c.w < 0) c.x = W + 30; } cloudGfxArr[i].x = c.x; });

        // BG objects
        if (started && !over) {
          if (s.bgObjs.length < 4 && Math.random() < 0.003) {
            const types: BgObj["type"][] = ["balloon", "bird", "bird", "UFO"];
            const type = types[Math.floor(Math.random() * types.length)];
            s.bgObjs.push({ id: nid(), type, x: W + 30, y: type === "balloon" ? rnd(80, 200) : type === "UFO" ? rnd(40, 150) : rnd(50, 170), vx: type === "UFO" ? -0.8 : type === "balloon" ? -0.4 : -1.3, vy: 0, phase: 0, birdPhase: Math.random() * 10 });
          }
          s.bgObjs.forEach(o => { o.x += o.vx; o.phase++; });
          s.bgObjs = s.bgObjs.filter(o => o.x > -250);
        }
        // Draw balloon
        const bln = s.bgObjs.find(o => o.type === "balloon");
        if (bln) drawBalloonGfx(balloonGfx, bln.x, bln.y, s.frame); else balloonGfx.clear();
        // Draw birds & UFO
        s.bgObjs.filter(o => o.type !== "balloon").forEach(obj => {
          if (!bgObjGfxMap.has(obj.id)) { const g = new PIXI.Graphics(); bgObjLayer.addChild(g); bgObjGfxMap.set(obj.id, { g, type: obj.type }); }
          const entry = bgObjGfxMap.get(obj.id)!;
          if (obj.type === "bird") drawBirdsGfx(entry.g, obj, s.frame);
          else if (obj.type === "UFO") drawUFOGfx(entry.g, obj, s.frame);
        });
        bgObjGfxMap.forEach((entry, id) => { if (!s.bgObjs.find(o => o.id === id)) { bgObjLayer.removeChild(entry.g); entry.g.destroy(); bgObjGfxMap.delete(id); } });

        // Player rotors — speed proportional to forward motion
        const pmr = player.getChildByName("mr") as any; if (pmr) pmr.rotation += 0.42;
        const ptr = player.getChildByName("tr") as any; if (ptr) ptr.rotation += 0.62;
        player.x = s.heli.x + 95; player.y = s.heli.y;
        player.alpha = s.invincible > 0 && Math.floor(s.invincible / 7) % 2 === 0 ? 0.22 : 1;
        // Banking: tilt up when climbing, down when diving
        const targetBank = s.playerMvy * 0.045;
        player.rotation = lerp(player.rotation, targetBank, 0.12);
        // Player engine glow
        const peg = player.getChildByName("engGlow") as any;
        if (peg) {
          peg.clear();
          drawEngineGlow(peg, -2, 23, s.frame, 0x44aaff, true);
        }
        muzzleGfx.alpha = Math.max(0, muzzleGfx.alpha - 0.14);

        if (!started || over) return;

        // ── Input
        const keys = keysRef.current;
        const SPD = CFG.player.speed; let mvx = 0, mvy = 0;
        if (keys.has("ArrowLeft") || keys.has("KeyA")) mvx = -SPD;
        if (keys.has("ArrowRight") || keys.has("KeyD")) mvx = SPD;
        if (keys.has("ArrowUp") || keys.has("KeyW")) mvy = -SPD;
        if (keys.has("ArrowDown") || keys.has("KeyS")) mvy = SPD;

        // Mouse / touch-follow — heli tracks pointer smoothly
        const ms = mouseRef.current;
        const tm = touchMoveRef.current;
        // Use touch position if active, else mouse
        const ptrX = tm.active ? tm.x : ms.x;
        const ptrY = tm.active ? tm.y : ms.y;
        const prevY = s.heli.y;
        if (ptrX >= 0 && mvx === 0 && mvy === 0) {
          const tx = ptrX - 46, ty = ptrY - 22;
          s.heli.x = clamp(lerp(s.heli.x, tx, 0.16), 0, W - 95);
          s.heli.y = clamp(lerp(s.heli.y, ty, 0.16), 0, GY - 54);
        } else {
          s.heli.x = clamp(s.heli.x + mvx, 0, W - 95);
          s.heli.y = clamp(s.heli.y + mvy, 0, GY - 54);
        }
        // Track vertical velocity for banking
        s.playerMvy = lerp(s.playerMvy, s.heli.y - prevY, 0.25);

        // Fire from mouse hold or touch fire button
        // Inject virtual Space for mouse-click and touch FIRE button (never clear keyboard Space)
        if (ms.down || fireRef.current) keys.add("Space");
        if (keys.has("Digit1")) s.weapon = "cannon";
        if (keys.has("Digit2")) s.weapon = "missile";
        if (keys.has("Digit3")) s.weapon = "spread";
        if (keys.has("Digit4")) s.weapon = "plasma" as any;

        // ── Shoot
        if (s.shootCooldown > 0) s.shootCooldown--;
        if (keys.has("Space") && s.shootCooldown === 0) {
          const ox = s.heli.x + 92, oy = s.heli.y + 23;
          if (s.weapon === "cannon") {
            s.bullets.push({ id: nid(), kind: "cannon", x: ox, y: oy - 3, vx: CFG.weapons.cannon.speed, vy: 0, trail: [], life: 1, damage: CFG.weapons.cannon.damage });
            s.bullets.push({ id: nid(), kind: "cannon", x: ox, y: oy + 4, vx: CFG.weapons.cannon.speed, vy: 0, trail: [], life: 1, damage: CFG.weapons.cannon.damage });
            s.shootCooldown = CFG.weapons.cannon.cooldown;
            snd.cannon();
          } else if (s.weapon === "missile" && s.ammo.missile > 0) {
            s.ammo.missile--;
            const tgt = s.enemies.reduce((best: EnemyData | null, e) => !best || Math.hypot(e.x - ox, e.y - oy) < Math.hypot(best.x - ox, best.y - oy) ? e : best, null);
            s.bullets.push({ id: nid(), kind: "missile", x: ox, y: oy, vx: CFG.weapons.missile.speed, vy: 0, trail: [], targetId: tgt?.id, life: 1, damage: CFG.weapons.missile.damage });
            s.shootCooldown = CFG.weapons.missile.cooldown;
            snd.missile();
          } else if (s.weapon === "spread" && s.ammo.spread > 0) {
            s.ammo.spread--;
            for (let i = -2; i <= 2; i++) { const a = i * CFG.weapons.spread.spreadAngle; s.bullets.push({ id: nid(), kind: "spread", x: ox, y: oy, vx: Math.cos(a) * CFG.weapons.spread.speed, vy: Math.sin(a) * CFG.weapons.spread.speed, trail: [], life: 1, damage: CFG.weapons.spread.damage }); }
            s.shootCooldown = CFG.weapons.spread.cooldown;
            snd.spread();
          } else if ((s.weapon as string) === "plasma" && s.ammo.plasma > 0) {
            s.ammo.plasma--;
            s.bullets.push({ id: nid(), kind: "plasma", x: ox, y: oy, vx: CFG.weapons.plasma.speed, vy: 0, trail: [], life: 1, damage: CFG.weapons.plasma.damage });
            s.shootCooldown = CFG.weapons.plasma.cooldown;
            snd.plasma();
          }
          muzzleGfx.clear(); muzzleGfx.beginFill(0xffee88, 0.7).drawCircle(ox, oy, 13).endFill(); muzzleGfx.alpha = 1;
        }

        // ── Move bullets
        s.bullets.forEach(b => {
          b.trail.push({ x: b.x, y: b.y }); if (b.trail.length > 10) b.trail.shift();
          // Missile homing
          if (b.kind === "missile" && b.targetId != null) {
            const tgt = s.enemies.find(e => e.id === b.targetId);
            if (tgt) { const dx = (tgt.x + 38) - b.x, dy = (tgt.y + 22) - b.y, d = Math.hypot(dx, dy) || 1; b.vx = lerp(b.vx, (dx / d) * CFG.weapons.missile.speed, CFG.weapons.missile.homingStrength); b.vy = lerp(b.vy, (dy / d) * CFG.weapons.missile.speed, CFG.weapons.missile.homingStrength); }
          }
          b.x += b.vx; b.y += b.vy;
          if (b.kind === "bomb") { b.vy += 0.18; }
        });
        s.bullets = s.bullets.filter(b => b.x < W + 40 && b.x > -40 && b.y > -40 && b.y < H + 40);

        // ── Spawn enemies
        s.spawnTimer++;
        if (s.spawnTimer >= s.spawnRate) {
          s.spawnTimer = 0; s.spawnRate = Math.max(CFG.spawn.minRate, CFG.spawn.initialRate - Math.floor(s.score / CFG.spawn.scorePerStep) * CFG.spawn.framesPerStep);
          const sc = s.score;
          let type: EnemyType;
          if (s.totalKills > 0 && s.totalKills - s.lastBossAt >= CFG.bossEveryKills) { type = "boss"; s.lastBossAt = s.totalKills; }
          else if (sc < 5) { type = "scout"; }
          else if (sc < 12) { type = (["scout", "gunship", "jet"] as EnemyType[])[Math.floor(Math.random() * 3)]; }
          else if (sc < 22) { type = (["scout", "gunship", "bomber", "ace", "jet"] as EnemyType[])[Math.floor(Math.random() * 5)]; }
          else { type = (["scout", "gunship", "bomber", "ace", "jet"] as EnemyType[])[Math.floor(Math.random() * 5)]; }
          const cfg = ENEMY_CFG[type];
          const spd = rnd(cfg.speedRange[0], cfg.speedRange[1]);
          const eid = nid();
          const ey = rnd(30, GY - (type === "boss" ? 150 : 112));
          s.enemies.push({ id: eid, type, x: W + 16, y: ey, baseY: ey, hp: cfg.hp, maxHp: cfg.hp, speed: spd, shootTimer: Math.floor(Math.random() * 60), shootInterval: cfg.shootInterval, wobble: Math.random() * 100, phase: 0, phaseDir: 1, reward: cfg.reward, bombTimer: 0, hitFlash: 0 });
          const ec = BUILDERS[type](PIXI);
          // Tail rotor behind body — move to bottom of display list
          const trR = ec.getChildByName("tr") as any;
          if (trR) { ec.removeChild(trR); ec.addChildAt(trR, 0); }
          ec.scale.x = -1; // enemies fly left — flip to face left ✓
          ec.x = W + 16 + 135; ec.y = ey; gameLayer.addChild(ec); enemyMap.set(eid, ec);
        }

        // ── Update enemies
        s.enemies.forEach(e => {
          const cfg = ENEMY_CFG[e.type];
          e.x -= e.speed; e.wobble++; e.shootTimer++; e.phase += 0.05;
          if (cfg.pattern === "zigzag") { e.y += e.phaseDir * 1.6; if (Math.abs(e.y - e.baseY) > 65) e.phaseDir *= -1; }
          else if (cfg.pattern === "wave") { e.y = e.baseY + Math.sin(e.phase) * 55; }
          else if (cfg.pattern === "swoop") { e.y = e.baseY + Math.sin(e.phase * 1.9) * 85; }
          e.y = clamp(e.y, 20, GY - (e.type === "boss" ? 150 : 102));

          if (e.shootTimer >= e.shootInterval) {
            e.shootTimer = 0;
            const dx = (s.heli.x + 46) - e.x, dy = (s.heli.y + 23) - (e.y + 23);
            const d = Math.hypot(dx, dy) || 1;
            const spd2 = e.type === "ace" ? cfg.bulletSpeed : e.type === "boss" ? cfg.bulletSpeed : cfg.bulletSpeed;
            if (e.type === "ace") { for (let ai = -1; ai <= 1; ai++) { const a = Math.atan2(dy, dx) + ai * 0.24; s.bullets.push({ id: nid(), kind: "ebullet", x: e.x - 16, y: e.y + 23, vx: Math.cos(a) * spd2, vy: Math.sin(a) * spd2, trail: [], life: 1, damage: 1 }); } }
            else if (e.type === "boss") { for (let bi = -1; bi <= 1; bi++) { const a = Math.atan2(dy, dx) + bi * 0.14; s.bullets.push({ id: nid(), kind: "ebullet", x: e.x, y: e.y + 36, vx: Math.cos(a) * spd2, vy: Math.sin(a) * spd2, trail: [], life: 1, damage: 1 }); } }
            else { s.bullets.push({ id: nid(), kind: "ebullet", x: e.x - 14, y: e.y + 23, vx: dx / d * spd2, vy: dy / d * spd2, trail: [], life: 1, damage: 1 }); }
            if (e.type === "bomber") { e.bombTimer++; if (e.bombTimer % 4 === 0) { s.bullets.push({ id: nid(), kind: "bomb", x: e.x + 30, y: e.y + 45, vx: -e.speed * 0.5, vy: 0.6, trail: [], life: 1, damage: 1 }); } }
          }
          const ec = enemyMap.get(e.id);
          if (ec) {
            // Idle bob + position
            ec.x = e.x + ENEMY_W[e.type]; ec.y = e.y + Math.sin(e.wobble * 0.04) * 3.5;
            // Rotor spin — speed up briefly after being hit
            const rotSpeed = e.hitFlash > 0 ? 0.72 : 0.40;
            ["mr", "mr1", "mr2", "mr3"].forEach(n => { const r = ec.getChildByName(n) as any; if (r) r.rotation -= rotSpeed; });
            const etr = ec.getChildByName("tr") as any; if (etr) etr.rotation -= rotSpeed * 1.45;
            // Damage tint: white flash on hit, then body color shifts orange→red
            if (e.hitFlash > 0) {
              e.hitFlash--;
              ec.tint = 0xffffff; // white flash
            } else {
              const pct = e.hp / e.maxHp;
              if (pct > 0.6) ec.tint = 0xffffff;
              else if (pct > 0.3) ec.tint = lerpColor(0xffffff, 0xff8833, (0.6 - pct) / 0.3);
              else ec.tint = lerpColor(0xff8833, 0xff2200, (0.3 - pct) / 0.3);
            }
            // Engine glow
            const eg = ec.getChildByName("engGlow") as any;
            if (eg) {
              eg.clear();
              const glowCol = e.type === "ace" ? 0xffcc44 : e.type === "boss" ? 0xaa44ff : e.type === "gunship" ? 0x88cc44 : 0xff8844;
              // place glow behind tail (left side for enemies)
              const gx = e.type === "boss" ? -25 : e.type === "gunship" ? -18 : -14;
              const gy = e.type === "boss" ? 37 : e.type === "jet" ? 18 : 23;
              drawEngineGlow(eg, gx, gy, s.frame, glowCol, false);
            }
            refreshHpBar(ec, e.hp, e.maxHp, e.type);
          }
        });
        s.enemies.filter(e => e.x < -135).forEach(e => { const ec = enemyMap.get(e.id); if (ec) { gameLayer.removeChild(ec); ec.destroy({ children: true }); enemyMap.delete(e.id); } });
        s.enemies = s.enemies.filter(e => e.x >= -135);

        // ── Death spin animation
        s.dying.forEach(d => {
          d.x += d.vx; d.y += d.vy; d.vy += 0.28; d.rot += d.rotSpeed; d.timer--;
          const ec = enemyMap.get(d.id);
          if (ec) { ec.x = d.x; ec.y = d.y; ec.rotation = d.rot; ec.alpha = Math.max(0, d.timer / d.maxTimer); ec.tint = lerpColor(0xff4400, 0x221100, 1 - d.timer / d.maxTimer); }
          if (d.timer <= 0) {
            const ec2 = enemyMap.get(d.id); if (ec2) { gameLayer.removeChild(ec2); ec2.destroy({ children: true }); enemyMap.delete(d.id); }
            // Final explosion burst
            spawnExplosion(s, d.x + 34, d.y + 22, true, d.type === "boss" ? 0xaa44ff : 0xff6600);
            s.shake.intensity = Math.max(s.shake.intensity, d.type === "boss" ? 22 : 10);
          }
        });
        s.dying = s.dying.filter(d => d.timer > 0);

        // ── Enemy bullets move
        s.bullets.filter(b => b.kind === "ebullet" || b.kind === "bomb").forEach(b => {
          b.trail.push({ x: b.x, y: b.y }); if (b.trail.length > 7) b.trail.shift();
          b.x += b.vx; b.y += b.vy;
        });
        s.bullets = s.bullets.filter(b => b.x > -40 && b.x < W + 40 && b.y > -40 && b.y < H + 40);

        // ── Pickups
        s.pickups.forEach(p => { p.y += p.vy; p.vy = Math.min(p.vy + 0.05, 1.2); p.frame++; });
        s.pickups = s.pickups.filter(p => p.y < H + 25);
        s.pickups = s.pickups.filter(p => {
          const dx = p.x - (s.heli.x + 44), dy = p.y - (s.heli.y + 22);
          if (Math.hypot(dx, dy) < 30) {
            if (p.kind === "missile") s.ammo.missile = Math.min(s.ammo.missile + CFG.weapons.missile.pickupRefill, CFG.weapons.missile.maxAmmo);
            else if (p.kind === "spread") s.ammo.spread = Math.min(s.ammo.spread + CFG.weapons.spread.pickupRefill, CFG.weapons.spread.maxAmmo);
            else if (p.kind === "plasma") s.ammo.plasma = Math.min(s.ammo.plasma + CFG.weapons.plasma.pickupRefill, CFG.weapons.plasma.maxAmmo);
            else if (p.kind === "health" && s.hp < CFG.player.startHp) {
              s.hp++;
              // Big green heal burst
              for (let i = 0; i < 16; i++) { const a = Math.random() * Math.PI * 2; s.particles.push({ id: nid(), x: s.heli.x + 44, y: s.heli.y + 22, vx: Math.cos(a) * rnd(2, 5), vy: Math.sin(a) * rnd(2, 5), life: 0.9, r: 3, color: 0x44ff88, grav: -0.04 }); }
              s.shockwaves.push({ id: nid(), x: s.heli.x + 44, y: s.heli.y + 22, r: 4, maxR: 38, life: 1, color: 0x44ff88 });
            }
            spawnHitSparks(s, p.x, p.y, p.kind === "health" ? 0x44ff88 : 0x44ffaa);
            if (p.kind === "health") snd.heal(); else snd.pickup();
            return false;
          }
          return true;
        });

        // ── Score milestone: every 20 pts → +1 HP (max 3)
        if (s.score >= s.nextHealthMilestone && s.hp < CFG.player.startHp) {
          s.hp++; s.nextHealthMilestone += CFG.health.milestoneEvery;
          for (let i = 0; i < 20; i++) { const a = Math.random() * Math.PI * 2; s.particles.push({ id: nid(), x: s.heli.x + 44, y: s.heli.y + 22, vx: Math.cos(a) * rnd(2, 6), vy: Math.sin(a) * rnd(2, 6), life: 1, r: 3.5, color: i % 2 === 0 ? 0x44ff88 : 0xffffff, grav: -0.03 }); }
          s.shockwaves.push({ id: nid(), x: s.heli.x + 44, y: s.heli.y + 22, r: 4, maxR: 50, life: 1, color: 0x44ff88 });
        } else if (s.score >= s.nextHealthMilestone) {
          s.nextHealthMilestone += CFG.health.milestoneEvery;
        }

        // ── Physics
        s.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += p.grav; p.life -= 0.023; });
        s.particles = s.particles.filter(p => p.life > 0);
        s.shockwaves.forEach(w => { w.r += (w.maxR - w.r) * 0.26; w.life -= 0.065; });
        s.shockwaves = s.shockwaves.filter(w => w.life > 0);
        // Combo timer
        if (s.comboTimer > 0) { s.comboTimer--; if (s.comboTimer === 0) s.combo = 0; }

        // ── Collisions: player bullets → enemies
        const killB = new Set<number>(), killE = new Set<number>();
        s.bullets.filter(b => b.kind !== "ebullet" && b.kind !== "bomb").forEach(b => {
          s.enemies.forEach(e => {
            const hw = e.type === "boss" ? 112 : e.type === "gunship" ? 72 : e.type === "jet" ? 82 : 64;
            const hh = e.type === "boss" ? 70 : 42;
            if (b.x > e.x && b.x < e.x + hw && b.y > e.y + 5 && b.y < e.y + hh) {
              if (b.kind === "plasma") {/*pierce — don't kill bullet*/ } else killB.add(b.id);
              e.hp -= b.damage;
              e.hitFlash = 6; // trigger white flash
              spawnHitSparks(s, b.x, b.y); s.shake.intensity = Math.max(s.shake.intensity, 2);
              snd.hit();
              if (e.hp <= 0 && !killE.has(e.id)) {
                killE.add(e.id); s.totalKills++; s.combo++; s.comboTimer = 180;
                // Launch death spin instead of instant destroy
                const spinDir = (Math.random() > 0.5 ? 1 : -1);
                s.dying.push({ id: e.id, x: e.x, y: e.y, vx: -e.speed * 0.5, vy: rnd(-1.5, -0.2), rot: 0, rotSpeed: spinDir * rnd(0.12, 0.22), timer: 38, maxTimer: 38, type: e.type });
                // Initial explosion on hit
                spawnExplosion(s, e.x + (e.type === "boss" ? 60 : 34), e.y + 22, false, e.type === "boss" ? 0xaa44ff : 0xff6600);
                s.shake.intensity = Math.max(s.shake.intensity, e.type === "boss" ? 14 : 6);
                const bonus = e.reward * (s.combo >= 3 ? 2 : 1);
                s.score += bonus; setScore(s.score);
                spawnPickup(s, e.x + 30, e.y + 22, ENEMY_CFG[e.type].dropChance, s.score, e.type === "boss");
                if (e.type === "boss") snd.bigExplosion(); else snd.explosion();
                if (s.combo >= 3) snd.combo();
              }
            }
          });
        });
        s.bullets = s.bullets.filter(b => !killB.has(b.id));
        s.enemies = s.enemies.filter(e => !killE.has(e.id));

        // ── Collisions: enemy bullets / enemies → player
        if (s.invincible > 0) { s.invincible--; }
        else {
          let hit = false;
          const killEB = new Set<number>();
          s.bullets.filter(b => b.kind === "ebullet" || b.kind === "bomb").forEach(b => {
            if (b.x > s.heli.x + 5 && b.x < s.heli.x + 82 && b.y > s.heli.y + 8 && b.y < s.heli.y + 44) { killEB.add(b.id); hit = true; }
          });
          s.bullets = s.bullets.filter(b => !killEB.has(b.id));
          if (!hit) s.enemies.forEach(e => { if (e.x < s.heli.x + 82 && e.x + 82 > s.heli.x && e.y < s.heli.y + 44 && e.y + 44 > s.heli.y + 8) hit = true; });
          if (hit) { s.hp--; s.invincible = CFG.player.invincibleFrames; spawnExplosion(s, s.heli.x + 42, s.heli.y + 22, s.hp === 0); s.shake.intensity = s.hp === 0 ? 20 : 11; snd.playerHit(); if (s.hp <= 0) setTimeout(triggerGameOver, 360); }
        }

        // ══ RENDER FX ═════════════════════════════════════════════════
        glowGfx.clear();
        s.bullets.forEach(b => {
          if (b.kind === "ebullet") { glowGfx.beginFill(0xff5533, 0.55).drawCircle(b.x, b.y, 12).endFill(); }
          else if (b.kind === "bomb") { glowGfx.beginFill(0x885500, 0.5).drawCircle(b.x, b.y, 10).endFill(); }
          else if (b.kind === "missile") { glowGfx.beginFill(0xff8800, 0.65).drawCircle(b.x, b.y, 15).endFill(); }
          else if (b.kind === "plasma") { glowGfx.beginFill(0x44ffee, 0.7).drawCircle(b.x, b.y, 18).endFill(); }
          else { glowGfx.beginFill(0xffee44, 0.5).drawCircle(b.x, b.y, 11).endFill(); }
        });
        bulletGfx.clear();
        s.bullets.forEach(b => {
          const tc = b.kind === "ebullet" ? 0xff5533 : b.kind === "bomb" ? 0xaa6600 : b.kind === "missile" ? 0xff8800 : b.kind === "plasma" ? 0x44ffee : 0xffee44;
          b.trail.forEach((pt, i) => { const t = i / b.trail.length; bulletGfx.beginFill(tc, t * 0.42).drawCircle(pt.x, pt.y, 2.2 + t * 2.8).endFill(); });
          if (b.kind === "missile") { bulletGfx.beginFill(0xff8800, 0.9).drawEllipse(b.x, b.y, 10, 3.5).endFill(); bulletGfx.beginFill(0xffcc44).drawEllipse(b.x + 2, b.y, 7, 2.2).endFill(); bulletGfx.beginFill(0xff4400, 0.7).drawEllipse(b.x - 8, b.y, 4, 2).endFill(); }
          else if (b.kind === "plasma") { bulletGfx.beginFill(0x44ffee).drawCircle(b.x, b.y, 6).endFill(); bulletGfx.beginFill(0xffffff, 0.6).drawCircle(b.x, b.y, 3).endFill(); }
          else if (b.kind === "bomb") { bulletGfx.beginFill(0xaa7722).drawCircle(b.x, b.y, 5.5).endFill(); bulletGfx.lineStyle(1, 0xffaa44, 0.5).moveTo(b.x, b.y).lineTo(b.x + 7, b.y - 3).lineStyle(0); }
          else { bulletGfx.beginFill(0xffffff).drawEllipse(b.x, b.y, b.kind === "spread" ? 4 : 6.5, 2.2).endFill(); }
        });
        partGfx.clear();
        s.particles.forEach(p => { partGfx.beginFill(p.color, Math.min(1, p.life)).drawCircle(p.x, p.y, p.r * Math.min(1, p.life)).endFill(); });
        s.shockwaves.forEach(w => { partGfx.lineStyle(3.5 * w.life, w.color, w.life * 0.55).drawCircle(w.x, w.y, w.r).lineStyle(0); });
        pickupGfx.clear();
        s.pickups.forEach(p => {
          const col = p.kind === "missile" ? 0xff8800 : p.kind === "plasma" ? 0x44ffee : p.kind === "health" ? 0xff3355 : 0x44eeaa;
          const pulse = 0.7 + 0.3 * Math.sin(s.frame * 0.15 + p.id);
          pickupGfx.beginFill(col, 0.28 * pulse).drawCircle(p.x, p.y, 18).endFill();
          pickupGfx.beginFill(col, 0.92).drawRoundedRect(p.x - 9, p.y - 9, 18, 18, 4).endFill();
          if (p.kind === "health") {
            // Red cross
            pickupGfx.beginFill(0xffffff, 0.9).drawRect(p.x - 6, p.y - 2, 12, 4).drawRect(p.x - 2, p.y - 6, 4, 12).endFill();
          } else {
            pickupGfx.beginFill(0xffffff, 0.65).drawRoundedRect(p.x - 6, p.y - 6, 12, 12, 2).endFill();
            pickupGfx.beginFill(col).drawCircle(p.x, p.y, 4).endFill();
          }
          pickupGfx.lineStyle(1.8, 0xffffff, 0.55).drawCircle(p.x, p.y, 15).lineStyle(0);
        });

        // ── HUD update ─────────────────────────────────────────────────
        const sc2 = String(s.score).padStart(4, "0");
        if (scoreTxt.text !== sc2) { scoreTxt.text = sc2; scoreTxt.x = W / 2 - scoreTxt.width / 2; }
        const barW = 18, barGap = 22;
        hpBars.forEach((bar, i) => { bar.clear(); const active = i < s.hp; bar.beginFill(active ? 0xff2233 : 0x2a2a2a).drawRoundedRect(16 + i * barGap, 22, barW, 14, 3).endFill(); if (active) bar.beginFill(0xffaaaa, 0.45).drawRoundedRect(17 + i * barGap, 24, barW - 2, 5, 2).endFill(); });
        const wIcons = { cannon: "⚫", missile: "🔴", spread: "🟡", plasma: "🔵" };
        const wAmmo: Record<string, string> = { cannon: "∞", missile: String(s.ammo.missile), spread: String(s.ammo.spread), plasma: String(s.ammo.plasma) };
        wpTxt.text = `WPN: ${(wIcons as any)[s.weapon] || "?"} ${s.weapon.toUpperCase().padEnd(7)} [${wAmmo[s.weapon]}]`;
        ammoBar.text = `MSL:${"█".repeat(s.ammo.missile)}${"░".repeat(Math.max(0, 12 - s.ammo.missile))} SPR:${"█".repeat(s.ammo.spread)}${"░".repeat(Math.max(0, 18 - s.ammo.spread))} PLZ:${"█".repeat(s.ammo.plasma)}${"░".repeat(Math.max(0, 8 - s.ammo.plasma))}`;
        killTxt.text = `KILLS: ${s.totalKills}`;
        const todLabel = s.tod < 0.2 ? "☀ DAY" : s.tod < 0.35 ? "🌇 DUSK" : s.tod < 0.65 ? "🌙 NIGHT" : "🌅 DAWN";
        todTxt.text = todLabel;
        comboTxt.text = s.combo >= 3 ? `COMBO ×${s.combo}!` : ""; comboTxt.alpha = Math.min(1, s.comboTimer / 30);

        // Sync React UI
        setUiState({ weapon: s.weapon as WeaponType, ammo: { ...s.ammo }, hp: s.hp, tod: s.tod, combo: s.combo });
      });

      const isTyping = () => { const el = document.activeElement; if (!el) return false; const tag = el.tagName.toLowerCase(); return tag === "input" || tag === "textarea" || (el as HTMLElement).isContentEditable; };
      const onDown = (e: KeyboardEvent) => {
        if (isTyping()) return;
        if (e.code === "Space") e.preventDefault();
        if (e.code === "Space" && overRef.current) { resetGame(); return; }
        keysRef.current.add(e.code);
        // Only Space starts the game — other keys (WASD etc) never trigger start
        if (e.code === "Space" && !startedRef.current && !overRef.current) { startedRef.current = true; setGameStarted(true); }
      };
      const onUp = (e: KeyboardEvent) => { if (isTyping()) return; keysRef.current.delete(e.code); };
      window.addEventListener("keydown", onDown); window.addEventListener("keyup", onUp);

      // ── Mouse controls ────────────────────────────────────────────
      const canvas = app.view as HTMLCanvasElement;
      canvasRef.current = canvas;
      const getCanvasPos = (e: MouseEvent) => {
        const r = canvas.getBoundingClientRect();
        const scaleX = W / r.width, scaleY = H / r.height;
        return { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY };
      };
      const onMouseMove = (e: MouseEvent) => {
        const p = getCanvasPos(e); mouseRef.current.x = p.x; mouseRef.current.y = p.y;
        if (!startedRef.current && !overRef.current) { startedRef.current = true; setGameStarted(true); }
      };
      const onMouseDown = (e: MouseEvent) => { mouseRef.current.down = true; if (!startedRef.current && !overRef.current) { startedRef.current = true; setGameStarted(true); } };
      const onMouseUp = () => { mouseRef.current.down = false; };
      const onMouseLeave = () => { mouseRef.current.x = -1; mouseRef.current.y = -1; mouseRef.current.down = false; };
      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mousedown", onMouseDown);
      canvas.addEventListener("mouseup", onMouseUp);
      canvas.addEventListener("mouseleave", onMouseLeave);
      canvas.style.touchAction = "none"; // prevent scroll on touch

      (app as any)._cleanup = () => {
        window.removeEventListener("keydown", onDown);
        window.removeEventListener("keyup", onUp);
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mouseup", onMouseUp);
        canvas.removeEventListener("mouseleave", onMouseLeave);
      };
    };
    init();
    return () => { destroyed = true; if (app) { (app as any)._cleanup?.(); app.ticker.stop(); app.destroy(true, { children: true, texture: true }); } enemyMap.clear(); bgObjGfxMap.clear(); };
  }, [gameKey]); // re-run when gameKey changes → fresh canvas on reset ✓


  // ── Touch-to-fly: finger position → heli follows smoothly ───────────────
  const onCanvasTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    const canvas = (e.currentTarget as HTMLDivElement).querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    touchMoveRef.current = {
      active: true,
      x: (t.clientX - r.left) * (W / r.width),
      y: (t.clientY - r.top) * (H / r.height),
      touchId: t.identifier,
    };
    setTouchPos({ x: touchMoveRef.current.x, y: touchMoveRef.current.y });
    if (!startedRef.current && !overRef.current) { startedRef.current = true; setGameStarted(true); }
  }, []);

  const onCanvasTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const tm = touchMoveRef.current;
    const t = Array.from(e.changedTouches).find(x => x.identifier === tm.touchId);
    if (!t) return;
    const canvas = (e.currentTarget as HTMLDivElement).querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    tm.x = (t.clientX - r.left) * (W / r.width);
    tm.y = (t.clientY - r.top) * (H / r.height);
    setTouchPos({ x: tm.x, y: tm.y });
  }, []);

  const onCanvasTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (Array.from(e.changedTouches).find(x => x.identifier === touchMoveRef.current.touchId)) {
      touchMoveRef.current = { active: false, x: -1, y: -1, touchId: -1 };
      setTouchPos(null);
    }
  }, []);

  const onFireStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); fireRef.current = true;
    if (!startedRef.current && !overRef.current) { startedRef.current = true; setGameStarted(true); }
  }, []);
  const onFireEnd = useCallback((e: React.TouchEvent) => { e.preventDefault(); fireRef.current = false; }, []);

  const wpColors: Record<string, string> = { cannon: "#aaccff", missile: "#ff8800", spread: "#ffee44", plasma: "#44ffee" };
  const wpIcons: Record<string, string> = { cannon: "⚫", missile: "🔴", spread: "🟡", plasma: "🔵" };

  return (
    <div className="flex flex-col items-center justify-center bg-[#010408] font-mono select-none w-full h-full">
      <div className="relative w-full h-full overflow-hidden">
        {/* PixiJS canvas — touch anywhere to fly */}
        <div ref={mountRef}
          onTouchStart={onCanvasTouchStart}
          onTouchMove={onCanvasTouchMove}
          onTouchEnd={onCanvasTouchEnd}
          onTouchCancel={onCanvasTouchEnd}
          style={{ touchAction: "none", width: "100%", height: "100%" }}
        />

        {/* ── Mobile weapon selector ── */}
        {gameStarted && !gameOver && (
          <div className="absolute top-2 right-2 flex flex-col gap-1 md:hidden">
            {(["cannon", "missile", "spread", "plasma"] as const).map(w => (
              <button key={w}
                onTouchStart={e => { e.preventDefault(); gs.current.weapon = w as any; setUiState(u => ({ ...u, weapon: w as any })); }}
                className="w-10 h-10 rounded-lg text-lg flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: uiState.weapon === w ? `${wpColors[w]}33` : "rgba(0,0,0,0.5)", border: `1.5px solid ${uiState.weapon === w ? wpColors[w] : "#334"}` }}>
                {wpIcons[w]}
              </button>
            ))}
          </div>
        )}


        {/* ── Touch position ripple indicator ── */}
        {touchPos && gameStarted && !gameOver && (
          <div className="absolute pointer-events-none md:hidden" style={{
            left: `${(touchPos.x / W) * 100}%`,
            top: `${(touchPos.y / H) * 100}%`,
            transform: "translate(-50%,-50%)",
            width: 56, height: 56,
            borderRadius: "50%",
            border: "2px solid rgba(100,180,255,0.45)",
            boxShadow: "0 0 12px rgba(80,160,255,0.3)",
            background: "rgba(80,160,255,0.07)",
          }} />
        )}

        {/* ── Mobile fire button (bottom-right) ── */}
        {gameStarted && !gameOver && (
          <div className="absolute md:hidden"
            style={{ right: 14, bottom: 18, width: 80, height: 80, touchAction: "none" }}
            onTouchStart={onFireStart} onTouchEnd={onFireEnd} onTouchCancel={onFireEnd}>
            <div className="w-full h-full rounded-full flex items-center justify-center"
              style={{
                background: fireRef.current ? "rgba(255,60,60,0.55)" : "rgba(200,20,20,0.35)",
                border: "2.5px solid rgba(255,80,80,0.55)",
                boxShadow: "0 0 18px rgba(255,40,40,0.3)",
              }}>
              <span className="text-white font-black text-lg tracking-widest" style={{ textShadow: "0 0 8px #ff4444" }}>FIRE</span>
            </div>
          </div>
        )}

        {/* ── Tap to start (mobile) ── */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(0,18,55,0.96) 0%, rgba(0,3,9,0.99) 100%)" }}
            onTouchStart={e => { e.preventDefault(); if (!startedRef.current && !overRef.current) { startedRef.current = true; setGameStarted(true); } }}>
            <p className="text-[10px] tracking-[0.45em] text-blue-400/40 uppercase">Classified Mission</p>
            <h1 className="text-4xl font-black tracking-[0.15em] text-white">
              HELI <span style={{ color: "#44aaff", textShadow: "0 0 22px #44aaff88" }}>ASSAULT</span>
            </h1>
            <div className="h-px w-64 bg-gradient-to-r from-transparent via-blue-500/35 to-transparent" />
            <div className="grid grid-cols-3 gap-x-5 gap-y-2 text-[10px] mt-1">
              {[["🔴 Scout", "1 HP", "+1"], ["🟢 Gunship", "5 HP", "+4"], ["🩶 Bomber", "3 HP", "+3"], ["🟡 Ace", "2 HP", "+5"], ["⬛ Jet", "1 HP", "+3"], ["💜 Boss", "25 HP", "+25"]].map(([n, h, r]) => (
                <div key={n} className="flex flex-col items-center gap-0.5 opacity-65">
                  <span className="text-white/80">{n}</span><span className="text-slate-400">{h}</span><span className="text-yellow-400 font-bold">{r}</span>
                </div>
              ))}
            </div>
            <div className="mt-1 space-y-1 text-[10px] text-center">
              <p><span className="text-blue-300/50">KEYBOARD</span> <span className="text-white/75">WASD/ARROWS + SPACE + 1234</span></p>
              <p><span className="text-blue-300/50">MOUSE</span> <span className="text-white/75">move cursor to fly · click/hold to fire</span></p>
              <p><span className="text-blue-300/50">MOBILE</span> <span className="text-white/75">touch to fly · hold FIRE · tap weapon icons</span></p>
            </div>
            <p className="text-blue-400/28 text-[10px] animate-pulse tracking-[0.5em] mt-2">TAP OR PRESS ANY KEY</p>
          </div>
        )}

        {/* ── Game Over ── */}
        {/* ── Second Chance ── */}
        {showSecondChance && (
          <div className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(10,30,80,0.98) 0%, rgba(2,5,20,0.99) 100%)" }}>
            {/* Pulsing border ring */}
            <div className="absolute inset-4 rounded-2xl pointer-events-none"
              style={{ border: "2px solid rgba(80,180,255,0.25)", boxShadow: "0 0 60px rgba(60,140,255,0.15), inset 0 0 60px rgba(60,140,255,0.05)" }} />

            <div className="flex flex-col items-center gap-3 px-6 w-full max-w-xs">
              {/* Header */}
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 28 }}>💙</span>
                <div className="text-center">
                  <p className="text-[9px] tracking-[0.5em] text-blue-400/60 uppercase">One-Time Offer</p>
                  <h2 className="text-2xl font-black tracking-widest text-white" style={{ textShadow: "0 0 20px rgba(80,160,255,0.7)" }}>SECOND CHANCE</h2>
                </div>
                <span style={{ fontSize: 28 }}>💙</span>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

              {/* Score preserved callout */}
              <div className="w-full rounded-xl px-4 py-2 text-center"
                style={{ background: "rgba(40,100,255,0.12)", border: "1px solid rgba(80,160,255,0.25)" }}>
                <p className="text-blue-300/70 text-[10px] uppercase tracking-widest">Your score is safe</p>
                <p className="text-3xl font-black mt-0.5" style={{ color: "#ffdd44", textShadow: "0 0 14px #ffdd4466" }}>{score}</p>
              </div>

              {/* Challenge instruction */}
              <p className="text-blue-200/70 text-xs text-center leading-relaxed">
                Count the <span className="text-pink-400 font-bold">❤ hearts</span> in the image below.<br />
                Answer correctly to <span className="text-green-400 font-bold">continue your run</span>.
              </p>

              {/* Heart image */}
              <div className="relative w-full rounded-xl overflow-hidden"
                style={{ border: "1.5px solid rgba(80,160,255,0.3)", minHeight: 110, background: "rgba(0,0,0,0.4)" }}>
                {!scImgLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-500/40 border-t-blue-400 animate-spin" />
                  </div>
                )}
                {scQuestion && (
                  <img src={scQuestion.img} alt="Heart challenge"
                    className="w-full transition-opacity duration-300"
                    style={{ opacity: scImgLoaded ? 1 : 0 }}
                    onLoad={() => setScImgLoaded(true)} />
                )}
              </div>

              {/* Input */}
              <div className="w-full flex gap-2">
                <input
                  type="number" min="0" max="20"
                  value={scInput}
                  disabled={!scImgLoaded}
                  onChange={e => { setScInput(e.target.value); setScError(false); }}
                  onKeyDown={e => { if (e.key === "Enter") acceptSecondChance(); }}
                  placeholder="How many hearts?"
                  className="flex-1 rounded-lg px-3 py-2.5 text-center text-white font-bold text-sm outline-none transition-all"
                  style={{
                    background: scError ? "rgba(255,50,50,0.15)" : "rgba(20,40,100,0.6)",
                    border: scError ? "1.5px solid rgba(255,80,80,0.6)" : "1.5px solid rgba(80,160,255,0.35)",
                    boxShadow: scError ? "0 0 12px rgba(255,50,50,0.2)" : "none",
                  }} />
                <button disabled={!scImgLoaded || !scInput}
                  onClick={acceptSecondChance}
                  className="px-4 py-2.5 rounded-lg font-black text-sm tracking-wider transition-all active:scale-95 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #1a6fff, #0a3fcc)", border: "1.5px solid rgba(100,180,255,0.4)", color: "white", boxShadow: "0 0 18px rgba(40,120,255,0.35)" }}>
                  ✓ GO
                </button>
              </div>

              {scError && (
                <p className="text-red-400 text-xs font-bold tracking-wider animate-pulse">✗ Wrong count — try again</p>
              )}

              {/* Decline */}
              <button onClick={declineSecondChance}
                className="text-[10px] text-white/25 hover:text-white/45 tracking-widest uppercase transition-colors mt-1">
                Give up — end mission
              </button>

              <p className="text-blue-400/25 text-[9px] tracking-widest uppercase">⚡ One attempt per session</p>
            </div>
          </div>
        )}

        {/* ── Game Over ── */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(55,0,0,0.97) 0%, rgba(3,0,0,0.99) 100%)" }}>
            <p className="text-[10px] tracking-[0.4em] text-red-400/48 uppercase">Mission Failed</p>
            <h2 className="text-5xl font-black tracking-[0.12em] text-white" style={{ textShadow: "0 0 30px rgba(255,40,40,0.5)" }}>SHOT DOWN</h2>
            <div className="h-px w-44 bg-gradient-to-r from-transparent via-red-600/45 to-transparent" />
            <p className="text-red-200/55 text-sm tracking-widest">
              FINAL SCORE: <span className="font-bold text-2xl" style={{ color: "#ffdd44", textShadow: "0 0 14px #ffdd4455" }}>{score}</span>
            </p>
            <button
              className="mt-1 px-12 py-3 border border-red-600/28 text-white font-bold tracking-widest text-sm active:scale-95 hover:bg-red-900/35 transition-all"
              style={{ borderRadius: "4px", background: "rgba(90,0,0,0.28)" }}
              onClick={resetGame}
              onTouchStart={e => { e.preventDefault(); resetGame(); }}>
              🔄 FLY AGAIN
            </button>
            <p className="text-white/20 text-[10px] tracking-widest mt-1">SPACE to restart</p>
          </div>
        )}
      </div>
    </div>
  );
}