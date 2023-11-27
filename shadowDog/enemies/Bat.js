import { FlyingEnemy } from './base.js';

export default class Bat extends FlyingEnemy {
  constructor(game) {
    super(game);
    this.spriteWidth = 293;
    this.spriteHeight = 155;
    this._width = this.spriteWidth / 2.5;
    this._height = this.spriteHeight / 2.5;

    this.image = document.getElementById('bat');
    this.maxFrame = 5;

    // 移动方式：基于sin
    this.angle = 0;
    this.va = Math.random() * 0.1 + 0.1;

    //随机的震动翅膀
    if (gameFrame % this.flapSpeed === 0) {
      this.frame > 4 ? (this.frame = 0) : this.frame++;
    }

    this.computed();
  }
  update(deltaTime) {
    super.update(deltaTime);
    this.angle += this.va;
    // 基于sin函数图像的移动方式
    this.y += Math.sin(this.angle);
  }
}
