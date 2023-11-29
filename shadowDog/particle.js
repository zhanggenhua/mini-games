class Particle {
  constructor(game) {
    this.game = game;
    this.markedForDeletion = false;
    this.size = 0;
    this.x = 0;
    this.y = 0;
    this.speedX = 0;
    this.speedY = 0;
  }
  update() {
    this.move();
    this.destroyed();
  }
  move() {
    // 粒子的移动
    this.x -= this.speedX + this.game.speed;
    this.y -= this.speedY;
  }
  destroyed() {
    // 粒子不断变小
    this.size *= 0.95;
    if (this.size < 0.5) this.markedForDeletion = true; //基于大小的清除
  }
}

// 奔跑的尘土
export class Dust extends Particle {
  constructor(game, x, y) {
    super(game);
    this.size = Math.random() * 10 + 10;
    this.x = x;
    this.y = y;
    this.speedX = Math.random();
    this.speedY = Math.random();
    this.color = 'rgba(0,0,0,0.5)';
  }
  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
  }
}

export class Fire extends Particle {
  constructor(game, x, y) {
    super(game);
    this.image = document.getElementById('fire');
    this.size = Math.random() * 100 + 50;
    this.x = x;
    this.y = y;
    this.speedX = 1;
    this.speedY = 1;
    this.angel = 0;
    this.va = Math.random() * 0.2 - 0.1;
  }
  update() {
    super.update();
    this.angel += this.va;
    this.x += Math.sin(this.angel * 10);
  }
  draw(context) {
    context.save();
    context.translate(this.x, this.y); // 偏移位置,方便图片位置计算
    context.rotate(this.angel); // 旋转
    // 因为translate，计算位置的方式改变 --图片位置为中心
    context.drawImage(this.image, -this.size * 0.5, -this.size * 0.5, this.size, this.size);
    context.restore();
  }
}
// 落地的火焰爆炸效果
export class Splash extends Particle {
  constructor(game, x, y) {
    super(game);
    this.size = Math.random() * 100 + 100;
    this.x = x - this.size * 0.4;
    this.y = y - this.size * 0.5;
    this.speedX = Math.random() * 6 - 4; //0-2
    this.speedY = Math.random() * 2 + 1; //1-3
    this.gravity = 0;
    this.image = document.getElementById('fire');
  }
  update() {
    super.update();
    this.gravity += 0.1; //匀加速曲线
    this.y += this.gravity; // 抛物线
  }
  draw(context) {
    context.drawImage(this.image, this.x, this.y, this.size, this.size);
  }
}
// 落地碎屑效果
export class GroundSplash extends Particle {
  constructor(game, x, y) {
    super(game);
    this.size = Math.random() * 10 + 10;
    this.x = x - this.size * 0.5;
    this.y = y - this.size * 0.5;
    this.speedX = Math.random(); //0-2
    this.speedY = Math.random() * 2 + 1; //1-3  --这是向上的
    this.gravity = 0;
    this.color = 'rgba(0,0,0,1)';
  }
  update() {
    super.update();
    this.gravity += 0.1; //匀加速曲线
    this.y += this.gravity;
  }
  draw(context) {
    context.beginPath();
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.size, this.size);
  }
  destroyed() {
    if (this.y > this.game.background.realHeight) this.markedForDeletion = true;
  }
}

// 乌鸦的尾气
export class CrowGas extends Particle {
  constructor(game, x, y, size, color) {
    super(game);
    this.size = size;
    this.x = x + this.size / 2 + Math.random() * 30 - 15;
    this.y = y + this.size / 3 + Math.random() * 30 - 15;
    this.radius = (Math.random() * this.size) / 10;
    this.maxRadius = Math.random() * 20 + this.radius * 4;
    this.speedX = 1; //-2 ~ -1
    this.color = color;
  }
  update() {
    super.update();
    this.radius += 0.3;
  }
  destroyed() {
    if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
  }
  draw(context) {
    context.save();
    context.globalAlpha = 1 - this.radius / this.maxRadius; //透明度 --逐渐变大
    context.beginPath();
    context.fillStyle = this.color;
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}

// 元气弹
// todo 增加冷却与相关UI
export class SpiritBomb extends Particle {
  constructor(game, x, y, enemy) {
    super(game);
    this.size = 20;
    this.x = x;
    this.y = y;
    this.newX = enemy.x + enemy.width / 2;
    this.newY = enemy.y + enemy.height / 2;
    let dx = this.x - this.newX;
    let dy = this.y - this.newY;
    // 子弹追踪
    this.speedX = enemy.speedX + dx / 100;
    this.speedY = enemy.speedY + dy / 100;
    this.color = `rgba(0, 112, 255)`;

    // 拖尾数组
    this.wake = [];
  }
  get width() {
    return this.size;
  }
  get height() {
    return this.size;
  }

  update() {
    super.update();

    // 位置改变才添加尾迹
    this.wake.unshift({ x: this.x, y: this.y });
    if (this.wake.length > 15) {
      this.wake.pop();
    }
  }
  destroyed() {
    if (this.y > this.game.background.realHeight || this.y < 0) {
      this.markedForDeletion = true;
    }
  }
  draw(context) {
    context.save();
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    context.closePath();
    context.fillStyle = this.color;
    context.fill();

    this.wake.forEach((wake, index) => {
      // 数组前面是新的轨迹
      context.globalAlpha = 0.1 - (index / 15) * 0.1;
      context.beginPath();
      context.arc(wake.x, wake.y, this.size, 0, Math.PI * 2);
      context.closePath();
      context.fill();
    });
    context.restore();
  }
}
