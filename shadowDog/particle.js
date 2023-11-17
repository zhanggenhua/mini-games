class Particle {
  constructor(game) {
    this.game = game;
    this.markedForDeletion = false;
  }
  update() {
    // 粒子的移动
    this.x -= this.speedX + this.game.speed;
    this.y -= this.speedY;
    // 粒子不断变小
    this.size *= 0.95;
    if (this.size < 0.5) this.markedForDeletion = true;//基于大小的清除
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
    this.speedX = Math.random() * 6 - 4;//0-2
    this.speedY = Math.random() * 2 + 1;//1-3
    this.gravity = 0;
    this.image = document.getElementById('fire');
  }
  update() {
    super.update();
    this.gravity += 0.1;//匀加速曲线
    this.y += this.gravity;
  }
  draw(context) {
    context.drawImage(this.image, this.x, this.y, this.size, this.size);
  }
}
