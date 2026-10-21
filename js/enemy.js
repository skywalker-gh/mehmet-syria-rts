export class Enemy {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.radius = 12;
    this.speed = 1.1 + Math.random() * 0.4;
    this.hp = 60 + Math.random() * 30;
    this.maxHp = this.hp;
    this.alive = true;
    this.angle = Math.random() * Math.PI * 2;
    this.state = 'patrol'; // patrol | chase | attack
    this.patrolTimer = 0;
    this.patrolTarget = { x: x + (Math.random() - 0.5) * 120, y: y + (Math.random() - 0.5) * 120 };
    this.attackCooldown = 0;
    this.type = 'isis'; // later different types
  }

  update() {
    if (!this.alive) return;

    const player = this.game.player;
    const dist = Math.hypot(player.x - this.x, player.y - this.y);

    // Detection
    if (dist < 280) {
      this.state = dist < 90 ? 'attack' : 'chase';
    } else if (this.state !== 'patrol') {
      this.state = 'patrol';
    }

    if (this.state === 'patrol') {
      this.patrolTimer += 1 / 60;
      if (this.patrolTimer > 3 || Math.hypot(this.x - this.patrolTarget.x, this.y - this.patrolTarget.y) < 15) {
        this.patrolTarget = {
          x: this.x + (Math.random() - 0.5) * 160,
          y: this.y + (Math.random() - 0.5) * 160
        };
        this.patrolTimer = 0;
      }
      this.moveToward(this.patrolTarget.x, this.patrolTarget.y, this.speed * 0.6);
    } else if (this.state === 'chase') {
      this.moveToward(player.x, player.y, this.speed);
    } else if (this.state === 'attack') {
      this.angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.attackCooldown -= 1 / 60;
      if (this.attackCooldown <= 0 && dist < 100) {
        // simple hit
        player.takeDamage(8 + Math.random() * 6);
        this.attackCooldown = 0.9;
      }
    }

    // Check projectile hits
    this.game.projectiles.forEach(p => {
      if (!p.alive || p.owner !== 'player') return;
      if (Math.hypot(p.x - this.x, p.y - this.y) < this.radius + 4) {
        p.alive = false;
        this.takeDamage(p.damage);
      }
    });
  }

  moveToward(tx, ty, speed) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 2) {
      this.x += (dx / len) * speed;
      this.y += (dy / len) * speed;
      this.angle = Math.atan2(dy, dx);
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    // small blood on hit
    this.game.particles.spawnBlood(this.x, this.y, 6);

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.alive = false;
    // HARDCORE GORE
    this.game.spawnGore(this.x, this.y, 1.5);
    this.game.addXP(35 + Math.floor(Math.random() * 20));
    this.game.addTL(150 + Math.floor(Math.random() * 100));
  }

  render(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Body – dark clothing
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#4a3a2a';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Weapon
    ctx.fillStyle = '#111';
    ctx.fillRect(6, -1.5, 16, 3);

    ctx.restore();

    // HP bar
    if (this.hp < this.maxHp) {
      const barW = 22;
      ctx.fillStyle = '#333';
      ctx.fillRect(this.x - barW / 2, this.y - 20, barW, 3);
      ctx.fillStyle = '#c00';
      ctx.fillRect(this.x - barW / 2, this.y - 20, barW * (this.hp / this.maxHp), 3);
    }
  }
}
