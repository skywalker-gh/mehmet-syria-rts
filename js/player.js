export class Player {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.radius = 14;
    this.speed = 2.8;
    this.angle = 0;

    // RPG
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 100;
    this.tl = 0;
    this.hp = 100;
    this.maxHp = 100;

    // Skills (placeholder for later)
    this.skills = {
      stealth: 1,
      marksmanship: 1,
      closeCombat: 1,
      leadership: 1
    };

    // Weapon – original Turkish MPT-76
    this.weapon = {
      name: 'MPT-76',
      damage: 28,
      fireRate: 0.12, // seconds between shots
      lastShot: 0,
      ammo: 30,
      maxAmmo: 30,
      reserve: 120,
      reloadTime: 1.8,
      reloading: false,
      reloadStart: 0
    };

    this.alive = true;
  }

  update(keys, mouse) {
    if (!this.alive) return;

    // Movement
    let dx = 0, dy = 0;
    if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      this.x += (dx / len) * this.speed;
      this.y += (dy / len) * this.speed;
    }

    // Aim toward mouse (world space)
    const worldMouseX = mouse.x + this.game.camera.x;
    const worldMouseY = mouse.y + this.game.camera.y;
    this.angle = Math.atan2(worldMouseY - this.y, worldMouseX - this.x);

    // Shooting
    if (mouse.down && !this.weapon.reloading) {
      this.shoot();
    }

    // Reload check
    if (this.weapon.reloading) {
      if (this.game.time - this.weapon.reloadStart >= this.weapon.reloadTime) {
        const needed = this.weapon.maxAmmo - this.weapon.ammo;
        const take = Math.min(needed, this.weapon.reserve);
        this.weapon.ammo += take;
        this.weapon.reserve -= take;
        this.weapon.reloading = false;
      }
    }
  }

  shoot() {
    const now = this.game.time;
    if (now - this.weapon.lastShot < this.weapon.fireRate) return;
    if (this.weapon.ammo <= 0) {
      this.reload();
      return;
    }

    this.weapon.lastShot = now;
    this.weapon.ammo--;

    // Create projectile
    const speed = 14;
    const proj = {
      x: this.x + Math.cos(this.angle) * 20,
      y: this.y + Math.sin(this.angle) * 20,
      vx: Math.cos(this.angle) * speed,
      vy: Math.sin(this.angle) * speed,
      damage: this.weapon.damage,
      alive: true,
      owner: 'player',
      update() {
        this.x += this.vx;
        this.y += this.vy;
        // simple lifetime / bounds
        if (this.x < -100 || this.x > 2000 || this.y < -100 || this.y > 1500) this.alive = false;
      },
      render(ctx) {
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    this.game.projectiles.push(proj);

    // Muzzle flash particles
    this.game.particles.spawnMuzzle(this.x + Math.cos(this.angle) * 18, this.y + Math.sin(this.angle) * 18, this.angle);
  }

  reload() {
    if (this.weapon.reloading || this.weapon.ammo === this.weapon.maxAmmo || this.weapon.reserve <= 0) return;
    this.weapon.reloading = true;
    this.weapon.reloadStart = this.game.time;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      // later: death screen
    }
  }

  addXP(amount) {
    this.xp += amount;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = Math.floor(this.xpToNext * 1.4);
      this.maxHp += 15;
      this.hp = this.maxHp;
      // skill point later
    }
  }

  render(ctx) {
    // Body (dark green uniform)
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Torso
    ctx.fillStyle = '#1a3a1a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // Weapon
    ctx.fillStyle = '#222';
    ctx.fillRect(8, -2, 22, 4);

    // Direction indicator
    ctx.strokeStyle = '#8fbc8f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(18, 0);
    ctx.stroke();

    ctx.restore();

    // Name / rank above
    ctx.fillStyle = 'rgba(200, 255, 200, 0.85)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Mehmet', this.x, this.y - 22);
  }
}
