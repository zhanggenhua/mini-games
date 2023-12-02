// 爬行敌人(蜘蛛)
import { ClimbingEnemy } from './base.js';

export default class BigSpider extends ClimbingEnemy {
  static score = 2;
  constructor(game) {
    super(game);
    this.spriteWidth = 120;
    this.spriteHeight = 144;
    
    this.image = document.getElementById('enemy_spider_big');
    this.maxFrame = 5;
  }
  update(deltaTime) {
    super.update(deltaTime);
  }
}