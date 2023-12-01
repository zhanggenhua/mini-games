import { GroundEnemy } from './base.js';

export default class Plant extends GroundEnemy {
  constructor(game) {
    super(game);
    this.spriteWidth = 229;
    this.spriteHeight = 171;
    this._width = this.spriteWidth / 2;
    this._height = this.spriteHeight / 2;

    this.image = document.getElementById('worm');
    this.maxFrame = 5;

    this.speedX = Math.random() + 1;
  }
}
