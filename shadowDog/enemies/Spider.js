// 小蜘蛛
import { ClimbingEnemy } from './base.js';

export class Spider extends ClimbingEnemy {
  constructor(game) {
    super(game);
    this.width = 310;
    this.height = 175;
    this._realWidth = 155;
    this._realHeight = 87.5;
    
    this.image = document.getElementById('enemy_spider');
    this.maxFrame = 5;
  }
  update(deltaTime) {
    super.update(deltaTime);
  }
}