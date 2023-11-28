import { FlyingEnemy } from './base.js';
import { GroundEnemy } from './base.js';

// 锯子
export default class Saw extends FlyingEnemy {
  static score = 2;
  static egg = 1;
  constructor(game) {
    super(game);
    this.spriteWidth = 213;
    this.spriteHeight = 213;
    this._width = this.spriteWidth / 2;
    this._height = this.spriteHeight / 2;
    this.image = document.getElementById('saw');
    this.maxFrame = 8;
    this.speedX = 0;

    // 随机移动的间隔
    this.speedTo = 10;
    this.interval = Math.floor(Math.random() * this.maxFrame * 2 + 10); // frame和speedTo的计算不在一个轨道
    this.newX = this.x;
    this.newY = this.y;
  }
  move() {
    // 得出y到目的地差值，然后y减去差值
    let dx = this.x - this.newX; //因为x轴不断移动，会有一个固定的差值
    let dy = this.y - this.newY;
    this.x -= dx / this.speedTo;
    this.y -= dy / this.speedTo;
    // 保持同步
    this.newX -= this.game.speed;
    this.x -= this.game.speed;

    // 边界
    if (this.y < 0) this.y = 0;
    if (this.y > this.game.background.realHeight - this.height)
      this.y = this.game.background.realHeight - this.height;
  }
  frameUpdate() {
    super.frameUpdate();
    // 随机移动
    if (this.frame % this.interval === 0) {
      this.newX = this.x + (Math.random() * 200 - 100); //-50 -- 50
      this.newY = this.y + (Math.random() * 200 - 100);
    }
  }
}

// 陷阱版
export class SawGround extends GroundEnemy {
  static score = 2;
  constructor(game) {
    super(game);
    this.spriteWidth = 213;
    this.spriteHeight = 213;
    this._width = this.spriteWidth / 2;
    this._height = this.spriteHeight / 2;
    this.image = document.getElementById('saw');
    this.maxFrame = 8;

    this.computed();
    this.va = Math.random() * 0.05 + 0.05; // 0.1--0.2
  }
  move() {
    super.move();
    this.speedX += this.va;
  }
}
