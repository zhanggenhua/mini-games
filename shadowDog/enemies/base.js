class Enemy {
  constructor() {
    this.frameX = 0;
    this.frameY = 0;
    this.fps = 20;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
    this.markedForDeletion = false; //标记删除
    this.score = 1; //敌人基础分数dd
  }
  computed() {
    !this.realWidth ? (this.realWidth = this.width) : '';
    !this.realHeith ? (this.realHeith = this.height) : '';
  }
  update(deltaTime) {
    // 加上游戏速度是为了和地图保持同步
    this.x -= this.speedX + this.game.speed;
    this.y += this.speedY;
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = 0;
    } else {
      this.frameTimer += deltaTime;
    }
    // 对敌人进行检查，超过屏幕就进行删除
    if (this.x + this.width < 0) this.markedForDeletion = true;
  }
  draw(context) {
    if (this.game.debug) {
      context.strokeRect(this.x, this.y, this.realWidth, this.realHeith);
    }
    context.drawImage(
      this.image,
      this.frameX * this.width,
      0,
      // 图片的宽高
      this.width,
      this.height,
      this.x,
      this.y,
      // 实际绘制的宽高
      this.realWidth,
      this.realHeith,
    );
  }
}
export class FlyingEnemy extends Enemy {
  constructor(game) {
    super();
    this.game = game;

    this.x = this.game.width + Math.random() * this.game.width * 0.5; //给一个随机的进场时机
    // 随机出生在上半屏幕
    this.y = Math.random() * this.game.height * 0.5;
    this.speedX = Math.random() + 1;
    this.speedY = 0;
  }
  update(deltaTime) {
    super.update(deltaTime);
  }
}
export class GroundEnemy extends Enemy {
  constructor(game) {
    super();
    this.game = game;
    this.x = this.game.width;
    this.speedX = 0; //完全基于场景移动
    this.speedY = 0;
  }
  computed() {
    console.log('地面怪物计算属性d', this.height, this.game.height, this.game.groundMargin);
    this.y = this.game.height - this.height - this.game.groundMargin;
    console.log('地面怪物计算属性', this.y);
  }
}

// 蜘蛛敌人
export class ClimbingEnemy extends Enemy {
  constructor(game) {
    super();
    this.game = game;

    this.x = this.game.width;
    // this.y = Math.random() * this.game.height * 0.5; //初始位置
    this.y = 0; //初始位置

    this.speedX = 0;
    this.speedY = Math.random() > 0.5 ? 1 : -1;
  }
  update(deltaTime) {
    super.update(deltaTime);
    // 触底反弹
    if (this.y > this.game.height - this.height - this.game.groundMargin) this.speedY *= -1;
    if (this.y < -this.height) this.markedForDeletion = true;
  }
  draw(context) {
    super.draw(context);
    context.beginPath();
    context.moveTo(this.x + this.realWidth / 2, 0); //线的起点，是画布上的坐标
    context.lineTo(this.x + this.realWidth / 2, this.y);
    context.stroke(); //画线
  }
}
