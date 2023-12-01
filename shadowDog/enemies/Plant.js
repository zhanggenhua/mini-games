import { GroundEnemy } from './base.js';

export default class Plant extends GroundEnemy {
  constructor(game) {
    super(game);
    this.spriteWidth = 60;
    this.spriteHeight = 87;

    this.image = document.getElementById('enemy_plant');
    this.maxFrame = 1;
  }
}
