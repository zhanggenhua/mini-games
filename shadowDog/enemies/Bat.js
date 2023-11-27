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

    this.fps = this.fps * 2; //默认就快两倍
    this.flapSpeed = Math.floor(Math.random() * 3 + 1); //1 ~ 3
  }
  frameUpdate() {
    //随机的震动翅膀速率
    if (this.frame % this.flapSpeed === 0) {
      this.frameX >= this.maxFrame ? (this.frameX = 0) : this.frameX++;
    }
  }
}
