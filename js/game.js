import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { ParticleSystem } from './particles.js';
import { Map } from './map.js';
import { Squad } from './squad.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Core systems
    this.map = new Map(this);
    this.player = new Player(this, 640, 360);
    this.squad = new Squad(this);
    this.enemies = [];
    this.particles = new ParticleSystem(this);
    this.projectiles = [];
    this.bloodPools = [];

    // Input
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false };

    // Game state
    this.running = false;
    this.time = 0;
    this.nightMode = true;
    this.camera = { x: 0, y: 0 };

    // Mission
    this.missionPhase = 'drop'; // drop → regroup → advance → complete
    this.squadGathered = 0;

    this.setupInput();
    this.spawnInitialEnemies();
  }

  setupInput() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (e.code === 'KeyR') this.player.reload();
    });
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', e => {
      if (e.button === 0) this.mouse.down = true;
    });
    this.canvas.addEventListener('mouseup', e => {
      if (e.button === 0) this.mouse.down = false;
    });
  }

  spawnInitialEnemies() {
    // Spawn ISIS patrols around the drop zone
    const positions = [
      { x: 200, y: 150 }, { x: 900, y: 200 },
      { x: 300, y: 500 }, { x: 1000, y: 450 },
      { x: 150, y: 600 }, { x: 1100, y: 100 },
      { x: 500, y: 80 }, { x: 700, y: 650 },
      { x: 400, y: 300 }, { x: 850, y: 550 }
    ];
    positions.forEach(p => {
      this.enemies.push(new Enemy(this, p.x, p.y));
    });
  }

  start() {
    this.running = true;
    this.loop();
  }

  loop() {
    if (!this.running) return;
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    this.time += 1 / 60;

    // Player
    this.player.update(this.keys, this.mouse);

    // Squad
    this.squad.update();

    // Enemies
    this.enemies.forEach(e => e.update());
    this.enemies = this.enemies.filter(e => e.alive);

    // Projectiles
    this.projectiles.forEach(p => p.update());
    this.projectiles = this.projectiles.filter(p => p.alive);

    // Particles (blood, gore, muzzle)
    this.particles.update();

    // Camera follows player
    this.camera.x = this.player.x - this.width / 2;
    this.camera.y = this.player.y - this.height / 2;

    // Update HUD
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('level').textContent = `LVL ${this.player.level}`;
    document.getElementById('xp').textContent = `XP ${this.player.xp}/${this.player.xpToNext}`;
    document.getElementById('tl').textContent = `₺ ${this.player.tl}`;
    document.getElementById('hp').textContent = `HP ${Math.ceil(this.player.hp)}/${this.player.maxHp}`;
    document.getElementById('current-weapon').textContent = this.player.weapon.name;
    document.getElementById('ammo').textContent = `${this.player.weapon.ammo} / ${this.player.weapon.reserve}`;
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // World transform
    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);

    // Map
    this.map.render(ctx);

    // Blood pools
    this.bloodPools.forEach(pool => {
      ctx.fillStyle = `rgba(80, 0, 0, ${pool.alpha})`;
      ctx.beginPath();
      ctx.ellipse(pool.x, pool.y, pool.r, pool.r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Enemies
    this.enemies.forEach(e => e.render(ctx));

    // Squad
    this.squad.render(ctx);

    // Player
    this.player.render(ctx);

    // Projectiles
    this.projectiles.forEach(p => p.render(ctx));

    // Particles (gore on top)
    this.particles.render(ctx);

    ctx.restore();

    // Night vignette already in CSS
  }

  // Called when enemy dies – hardcore gore
  spawnGore(x, y, amount = 1) {
    // Blood pool
    this.bloodPools.push({
      x, y,
      r: 12 + Math.random() * 18,
      alpha: 0.7 + Math.random() * 0.25
    });

    // Blood particles + body parts
    this.particles.spawnBlood(x, y, 25 + amount * 15);
    this.particles.spawnBodyParts(x, y, 3 + Math.floor(amount * 2));

    // Screen flash
    const flash = document.getElementById('blood-flash');
    flash.style.opacity = '1';
    setTimeout(() => flash.style.opacity = '0', 80);
  }

  addXP(amount) {
    this.player.addXP(amount);
  }

  addTL(amount) {
    this.player.tl += amount;
  }
}
