import { GroundEnemy } from './base.js';

export class Plant extends GroundEnemy {
  constructor(game) {
    super(game);
    this.width = 60;
    this.height = 87;

    this.image = document.getElementById('enemy_plant');
    this.maxFrame = 1;

    // 等所有属性都初始化完毕才计算
    this.computed();
  }
}
