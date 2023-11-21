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
  computed() {}
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
      context.strokeRect(this.x, this.y, this.width, this.height);
    }
    context.drawImage(
      this.image,
      this.frameX * this.width,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
}
export class FlyingEnemy extends Enemy {
  constructor(game) {
    super();
    this.game = game;
    this.width = 60;
    this.height = 44;
    this.x = this.game.width + Math.random() * this.game.width * 0.5; //给一个随机的进场时机
    // 随机出生在上半屏幕
    this.y = Math.random() * this.game.height * 0.5;
    this.speedX = Math.random() + 1;
    this.speedY = 0;
    this.maxFrame = 5;
    this.image = document.getElementById('enemy_fly');
    this.angle = 0;
    this.va = Math.random() * 0.1 + 0.1;
  }
  update(deltaTime) {
    super.update(deltaTime);
    this.angle += this.va;
    // 基于sin函数图像的移动方式
    this.y += Math.sin(this.angle);
  }
}
export class GroundEnemy extends Enemy {
  constructor(game) {
    super();
    this.game = game;
    this.width = 60;
    this.height = 87;
    this.x = this.game.width;

    this.speedX = 0;
    this.speedY = 0;
    this.maxFrame = 1;
    this.image = document.getElementById('enemy_plant');
    this.computed();
  }
  computed() {
    console.log(this.game);
    this.y = this.game.height - this.height - this.game.groundMargin;
  }
}
export class ClimbingEnemy extends Enemy {
  constructor(game) {
    super();
    this.game = game;
    this.width = 120;
    this.height = 144;
    this.x = this.game.width;
    this.y = Math.random() * this.game.height * 0.5;
    this.image = document.getElementById('enemy_spider_big');
    this.speedX = 0;
    this.speedY = Math.random() > 0.5 ? 1 : -1;
    this.maxFrame = 5;
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
    context.moveTo(this.x + this.width / 2, 0); //线的起点，是画布上的坐标
    context.lineTo(this.x + this.width / 2, this.y);
    context.stroke(); //画线
  }
}
