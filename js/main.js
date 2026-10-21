import { Game } from './game.js';

const canvas = document.getElementById('gameCanvas');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');

let game = null;

startBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';
  game = new Game(canvas);
  game.start();
});

// Prevent context menu
canvas.addEventListener('contextmenu', e => e.preventDefault());
