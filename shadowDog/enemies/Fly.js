import { FlyingEnemy } from './base.js';

export class Fly extends FlyingEnemy {
  constructor(game) {
    super(game);
    this.width = 60;
    this.height = 44;

    this.image = document.getElementById('enemy_fly');
    this.maxFrame = 5;

    // 移动方式：基于sin
    this.angle = 0;
    this.va = Math.random() * 0.1 + 0.1;
  }
  update(deltaTime) {
    super.update(deltaTime);
    this.angle += this.va;
    // 基于sin函数图像的移动方式
    this.y += Math.sin(this.angle);
  }
}
