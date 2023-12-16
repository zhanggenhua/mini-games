import { FlyingEnemy } from '../base.js';

export default class Ghost extends FlyingEnemy {
  static score = 3;
  static egg = 2;
  constructor(game) {
    super(game);
    this.spriteWidth = 261;
    this.spriteHeight = 209;
    this._width = this.spriteWidth / 2;
    this._height = this.spriteHeight / 2;
    this.image = document.getElementById('ghost');
    this.maxFrame = 5;

    // 上下浮动的随机值  0.2 -- 0.4  --> 0.1 ~ 0.6
    this.curve = Math.random() * 0.2 + 0.2;

    // 受击现身
    this.hidden = false;

    // 隐身频率
    this.hiddenSpeed = Math.random() * 20 + 20;
  }
  frameUpdate() {
    if (this.frame % this.hiddenSpeed === 0) {
      this.hidden = !this.hidden;
    }
  }

  handleCollision() {
    // todo 碰撞还是发生，处理玩家kill状态
    if (this.hidden) return;
    super.handleCollision();
  }

  draw(context) {
    //实现幽灵半透明
    context.save(); //保存所有画布的快照
    if (!this.hidden) context.globalAlpha = 0.5;
    super.draw(context);
    context.restore();
  }

  handleCollision() {
    // 幽灵变成实体
    this.hidden = false;
    super.handleCollision();
  }
  die() {
    setTimeout(() => {
      super.die();
    }, 200);
  }
}
