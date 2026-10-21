export class Squad {
  constructor(game) {
    this.game = game;
    this.members = [];
    this.spawnScattered();
  }

  spawnScattered() {
    // 10 commandos scattered after night drop
    const names = [
      'Cengiz', 'Emre', 'Baran', 'Yusuf', 'Caner',
      'Ömer', 'Serkan', 'Hakan', 'Tolga', 'Burak'
    ];
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const dist = 180 + Math.random() * 220;
      this.members.push({
        name: names[i],
        x: 640 + Math.cos(angle) * dist,
        y: 360 + Math.sin(angle) * dist,
        radius: 11,
        hp: 80,
        maxHp: 80,
        alive: true,
        gathered: false,
        angle: Math.random() * Math.PI * 2,
        speed: 2.2
      });
    }
  }

  update() {
    const player = this.game.player;
    this.members.forEach(m => {
      if (!m.alive || m.gathered) return;

      const dist = Math.hypot(player.x - m.x, player.y - m.y);
      if (dist < 45) {
        m.gathered = true;
        this.game.squadGathered++;
        this.game.addXP(50);
        this.game.addTL(200);
        // later: join formation
      } else if (dist < 350) {
        // move toward player slowly when close enough
        const dx = player.x - m.x;
        const dy = player.y - m.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        m.x += (dx / len) * m.speed * 0.7;
        m.y += (dy / len) * m.speed * 0.7;
        m.angle = Math.atan2(dy, dx);
      }
    });
  }

  render(ctx) {
    this.members.forEach(m => {
      if (!m.alive) return;

      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.angle);

      // Body
      ctx.fillStyle = m.gathered ? '#1a4a2a' : '#1a3a1a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#3a2a1a';
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Name
      ctx.fillStyle = m.gathered ? 'rgba(150, 255, 150, 0.9)' : 'rgba(180, 200, 180, 0.7)';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.name, m.x, m.y - 16);

      // Gathered indicator
      if (m.gathered) {
        ctx.strokeStyle = 'rgba(100, 255, 100, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 16, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }
}
