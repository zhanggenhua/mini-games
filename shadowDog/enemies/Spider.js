// 小蜘蛛
import { ClimbingEnemy } from './base.js';

export default class Spider extends ClimbingEnemy {
  constructor(game) {
    super(game);
    this.spriteWidth = 310;
    this.spriteHeight = 175;
    this._width = this.spriteWidth / 2;
    this._height = this.spriteHeight / 2;
    
    this.image = document.getElementById('enemy_spider');
    this.maxFrame = 5;
  }
  update(deltaTime) {
    super.update(deltaTime);
  }
}