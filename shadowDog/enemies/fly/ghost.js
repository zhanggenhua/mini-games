import { FlyingEnemy } from '../base.js';

export default class Ghost extends FlyingEnemy {
  constructor(game) {
    super(game);
    this.spriteWidth = 261;
    this.spriteHeight = 209;
    this._width = this.spriteWidth / 2;
    this._height = this.spriteHeight / 2;
    this.image = document.getElementById('ghost');
    this.maxFrame = 5;

    // 受击现身
    this.hurt = false;
  }
  draw(context) {
    //实现幽灵半透明
    context.save(); //保存所有画布的快照
    if (!this.hurt) context.globalAlpha = 0.5;
    super.draw(context);
    context.restore();
  }

  handleCollision() {
    // 幽灵变成实体
    this.hurt = true;
    super.handleCollision();
  }
  die() {
    setTimeout(() => {
      super.die();
    }, 200);
  }
}
