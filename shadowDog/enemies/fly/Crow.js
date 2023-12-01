import { FlyingEnemy } from '../base.js';
import { CrowGas } from '../../particle.js';

import { FloatingMessage } from '../../floatingMessages.js';

// 乌鸦
export default class Crow extends FlyingEnemy {
  static score = 2;
  static egg = 1;
  constructor(game) {
    super(game);
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 1 + 2; //随机大小
    this._width = this.spriteWidth / this.sizeModifier;
    this._height = this.spriteHeight / this.sizeModifier;
    this.image = document.getElementById('crow');
    this.maxFrame = 5;

    this.speedX = Math.random() * 2 + 2; //2 ~ 4

    this.randomColor = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    this.color = `rgb(${this.randomColor[0]},${this.randomColor[1]},${this.randomColor[2]})`; //用于碰撞检验

    this.fps = this.fps * 2; //默认就快两倍
    this.flapSpeed = Math.floor(this.speedX); //1 ~ 3
    // this.flapSpeed = Math.floor(Math.random() * 3 + 1); //1 ~ 3
  }
  move() {
    this.x -= this.speedX + this.game.speed;
    this.game.particles.unshift(new CrowGas(this.game, this.x, this.y, this.width, this.color));
  }
  frameUpdate() {
    //随机的震动翅膀速率
    if (this.frame % this.flapSpeed === 0) {
      this.frameX >= this.maxFrame ? (this.frameX = 0) : this.frameX++;
    }
  }

  draw(context, collisionCtx) {
    super.draw(context);
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
  }

  // 碰撞处理
  handleCollision(collider) {
    // 乌鸦只能被魔法打败
    if (this.game.player.kill()) {
      this.game.floatingMessages.push(
        new FloatingMessage(this.game, 'MISS', this.x, this.y, this.x - 20, this.y - 20, 70),
      );
    }
  }
}
