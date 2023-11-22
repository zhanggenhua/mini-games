// 爬行敌人(蜘蛛)
import { ClimbingEnemy } from './base.js';

export class BigSpider extends ClimbingEnemy {
  constructor(game) {
    super(game);
    this.width = 120;
    this.height = 144;
    
    this.image = document.getElementById('enemy_spider_big');
    this.maxFrame = 5;
    this.computed();
  }
  update(deltaTime) {
    super.update(deltaTime);
  }
}