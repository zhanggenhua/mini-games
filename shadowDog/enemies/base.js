class Enemy {
  static score = 1; //敌人基础分数
  constructor() {
    this.frameX = 0;
    this.frameY = 0;
    this.fps = 20;
    // this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
    this.markedForDeletion = false; //标记删除

    this.frame = 0; //记录帧数 --注意会长时间停留在一个值，和deltaTime有关的都要专门处理

    // 这里调用的是具体实例的computed  --不能用异步，虽然可以等子类初始化后调用，但是执行顺序乱套
    // this.computed();
  }
  computed() {}
  get frameInterval() {
    delete this.frameInterval;
    return 1000 / this.fps;
  }
  get width() {
    // 懒加载getter ，因为后续不会改变
    delete this.width;
    return this._width ? this._width : this.spriteWidth;
  }
  get height() {
    delete this.height;
    return this._height ? this._height : this.spriteHeight;
  }

  update(deltaTime) {
    this.move();
    
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      this.frame++;
      this.frameUpdate();
    } else {
      this.frameTimer += deltaTime;
    }
    // 对敌人进行检查，超过屏幕就进行删除
    if (this.x + this.width < 0) this.markedForDeletion = true;
  }
  move() {
    // 加上游戏速度是为了和地图保持同步
    this.x -= this.speedX + this.game.speed;
    this.y += this.speedY;
  }
  frameUpdate() {
    this.frameX >= this.maxFrame ? (this.frameX = 0) : this.frameX++;
  }

  draw(context) {
    if (this.game.debug) {
      // context.strokeRect(this.x, this.y, this.width, this.height);
      context.beginPath();
      context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
      context.stroke();
    }
    context.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      0,
      // 图片的宽高
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      // 实际绘制的宽高
      this.width,
      this.height,
    );
  }
}

export class FlyingEnemy extends Enemy {
  static egg = 3; //基础产卵率
  constructor(game) {
    super();
    this.game = game;

    this.x = this.game.width + Math.random() * this.game.width * 0.25; //给一个随机的进场时机
    // 随机出生在上半屏幕
    this.y = Math.random() * this.game.height * 0.4 + this.game.height * 0.1;
    this.speedX = Math.random() + 1;
    this.speedY = 0;

    // 移动方式：基于sin
    this.angle = 0;
    this.va = Math.random() * 2 + 2; // 2 ~ 4
  }
  move() {
    this.x -= this.speedX + this.game.speed;
    this.angle += this.va;
    // 基于sin函数图像的移动方式
    this.y =
      Math.sin((this.angle * Math.PI) / 180) * this.game.height * 0.125 + this.game.height * 0.25;
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
    super.computed();
    console.log('地面怪物计算属性', this.game.background.realHeight);
    this.y = this.game.background.realHeight - this.height;
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
    if (this.y > this.game.background.realHeight - this.height) this.speedY *= -1;
    if (this.y < -this.spriteHeight) this.markedForDeletion = true;
  }
  draw(context) {
    super.draw(context);
    context.beginPath();
    context.moveTo(this.x + this.width / 2, 0); //线的起点，是画布上的坐标
    context.lineTo(this.x + this.width / 2, this.y);
    context.stroke(); //画线
  }
}
