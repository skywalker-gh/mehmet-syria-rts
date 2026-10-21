export class Map {
  constructor(game) {
    this.game = game;
    // Stylized Hammam at Turkuman area
    // Based on real: fields, small village structures, Balikh river influence
    this.tiles = [];
    this.buildings = [];
    this.trees = [];
    this.generate();
  }

  generate() {
    // Simple procedural night field + ruins
    // Buildings (village / ruins)
    this.buildings = [
      { x: 180, y: 120, w: 60, h: 45, type: 'house' },
      { x: 280, y: 90, w: 40, h: 35, type: 'ruin' },
      { x: 900, y: 150, w: 70, h: 50, type: 'house' },
      { x: 1050, y: 200, w: 45, h: 40, type: 'ruin' },
      { x: 150, y: 480, w: 55, h: 40, type: 'house' },
      { x: 980, y: 520, w: 65, h: 48, type: 'house' },
      { x: 600, y: 80, w: 90, h: 30, type: 'wall' },
      { x: 400, y: 600, w: 80, h: 25, type: 'wall' }
    ];

    // Trees / vegetation
    for (let i = 0; i < 40; i++) {
      this.trees.push({
        x: 50 + Math.random() * 1180,
        y: 50 + Math.random() * 620,
        r: 8 + Math.random() * 12
      });
    }

    // Dirt paths / roads (simple)
    this.roads = [
      { x1: 0, y1: 360, x2: 1280, y2: 360 },
      { x1: 640, y1: 0, x2: 640, y2: 720 }
    ];
  }

  render(ctx) {
    // Ground – dark night fields
    ctx.fillStyle = '#0d1a0d';
    ctx.fillRect(-200, -200, 1800, 1200);

    // Slight variation patches
    ctx.fillStyle = '#0f1f0f';
    for (let i = 0; i < 30; i++) {
      const x = (i * 137) % 1400 - 100;
      const y = (i * 89) % 900 - 100;
      ctx.beginPath();
      ctx.ellipse(x, y, 80 + (i % 5) * 20, 40 + (i % 3) * 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Roads
    ctx.strokeStyle = '#1a2a1a';
    ctx.lineWidth = 28;
    this.roads.forEach(r => {
      ctx.beginPath();
      ctx.moveTo(r.x1, r.y1);
      ctx.lineTo(r.x2, r.y2);
      ctx.stroke();
    });

    // Buildings
    this.buildings.forEach(b => {
      if (b.type === 'house') {
        ctx.fillStyle = '#1a2520';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = '#0f1812';
        ctx.fillRect(b.x + 4, b.y + 4, b.w - 8, b.h - 8);
        // windows
        ctx.fillStyle = '#2a3a20';
        ctx.fillRect(b.x + 10, b.y + 12, 10, 10);
        ctx.fillRect(b.x + b.w - 20, b.y + 12, 10, 10);
      } else if (b.type === 'ruin') {
        ctx.fillStyle = '#151c16';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = '#0c120c';
        ctx.fillRect(b.x + 8, b.y + 8, b.w * 0.5, b.h * 0.6);
      } else if (b.type === 'wall') {
        ctx.fillStyle = '#1a221a';
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }
    });

    // Trees
    this.trees.forEach(t => {
      ctx.fillStyle = '#0a150a';
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#122012';
      ctx.beginPath();
      ctx.arc(t.x - 2, t.y - 2, t.r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Drop zone marker (center-ish)
    ctx.strokeStyle = 'rgba(100, 200, 100, 0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(640, 360, 80, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
