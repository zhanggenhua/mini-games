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
    // 粒子的移动
    this.x -= this.speedX + this.game.speed;
    this.y -= this.speedY;
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
    this.y += this.gravity;
  }
  draw(context) {
    context.drawImage(this.image, this.x, this.y, this.size, this.size);
  }
}

// 乌鸦的尾气
export class CrowGas extends Particle {
  constructor(game, x, y, size, color) {
    super(game);
    this.size = size;
    this.x = x + this.size / 2;
    this.y = y + this.size / 3;
    this.radius = (Math.random() * this.size) / 10;
    this.maxRadius = Math.random() * 20 + this.radius * 4;
    this.speedX = 1; //-2 ~ -1
    this.color = color;
  }
  update() {
    this.x -= this.speedX + this.game.speed;
    this.radius += 0.25;
    if (this.radius > this.maxRadius) this.markedForDeletion = true;
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
