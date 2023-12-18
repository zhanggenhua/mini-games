import { FlyingEnemy } from '../base.js';

// 浮游
export default class Swim extends FlyingEnemy {
  static score = 2;
  static egg = 2;
  constructor(game) {
    super(game);
    this.spriteWidth = 218;
    this.spriteHeight = 177;
    this._width = this.spriteWidth / 2;
    this._height = this.spriteHeight / 2;
    this.image = document.getElementById('swim');
    this.maxFrame = 5;
    this.speedX = 0;

    this.modifyX = this.x; //用于前进的修正
    this.va = Math.random() * 1 + 1; // 1 - 2
  }
  move() {
    this.angle += this.va;
    // 圆周运动 cos+sin可以画圆
    this.modifyX -= this.game.speed;
    this.x =
      Math.cos((this.angle * Math.PI) / 180) * this.game.height * 0.125 +
      this.game.height * 0.25 +
      this.modifyX;
  }
}
