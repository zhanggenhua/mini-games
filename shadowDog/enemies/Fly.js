import { FlyingEnemy } from './base.js';

export default class Fly extends FlyingEnemy {
  static egg = 6
  constructor(game) {
    super(game);
    this.spriteWidth = 60;
    this.spriteHeight = 44;
    this.image = document.getElementById('enemy_fly');
    this.maxFrame = 5;
  }
}
