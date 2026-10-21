export class ParticleSystem {
  constructor(game) {
    this.game = game;
    this.particles = [];
  }

  spawnBlood(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 1.5,
        life: 0.6 + Math.random() * 0.8,
        maxLife: 1.2,
        size: 2 + Math.random() * 4,
        color: Math.random() > 0.3 ? '#8b0000' : '#5a0000',
        type: 'blood',
        gravity: 0.08
      });
    }
  }

  spawnBodyParts(x, y, count = 4) {
    const parts = ['arm', 'leg', 'chunk', 'head'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1.5 + Math.random() * 1.5,
        maxLife: 3,
        size: 5 + Math.random() * 7,
        color: '#3a1a1a',
        type: 'bodypart',
        part: parts[Math.floor(Math.random() * parts.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        gravity: 0.12
      });
    }
  }

  spawnMuzzle(x, y, angle) {
    for (let i = 0; i < 6; i++) {
      const spread = (Math.random() - 0.5) * 0.6;
      const a = angle + spread;
      const speed = 3 + Math.random() * 4;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 0.08 + Math.random() * 0.1,
        maxLife: 0.18,
        size: 3 + Math.random() * 3,
        color: i < 2 ? '#ffffaa' : '#ff8800',
        type: 'muzzle',
        gravity: 0
      });
    }
  }

  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity || 0;
      p.life -= 1 / 60;
      if (p.type === 'bodypart') {
        p.rotation += p.rotSpeed;
      }
      // friction for blood
      if (p.type === 'blood') {
        p.vx *= 0.96;
        p.vy *= 0.96;
      }
    });
    this.particles = this.particles.filter(p => p.life > 0);
  }

  render(ctx) {
    this.particles.forEach(p => {
      const alpha = Math.min(1, p.life / (p.maxLife * 0.4));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);

      if (p.type === 'bodypart') {
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.part === 'arm' || p.part === 'leg') {
          ctx.fillRect(-p.size * 0.3, -p.size * 0.15, p.size, p.size * 0.3);
        } else if (p.part === 'head') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size * 0.4, -p.size * 0.3, p.size * 0.8, p.size * 0.6);
        }
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }
}
