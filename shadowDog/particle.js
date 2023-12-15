import { skills } from './skill.js';
import { checkCollision } from '../utils/tool.js';
import { FloatingMessageRed } from './floatingMessages.js';

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

// 残影
export class Shadow extends Particle {
  constructor(game, player) {
    super(game);
    this.player = player;
    this.frameX = 0;
    // 子弹追踪
    // this.speedX = player.speed;
    // this.speedY = player.vy;

    // 拖尾数组
    this.wake = [];
  }
  move() {}
  destroyed() {
    if (this.game.player.skills[skills.SPRINTSKILL].actived === false) {
      this.markedForDeletion = true;
    }
  }

  update() {
    super.update();

    // 位置改变才添加尾迹
    if (this.player.frameX > this.frameX) {
      if (this.frameX < this.maxFrame) {
        this.frameX = this.player.frameX;
      } else {
        this.frameX = 0;
      }
      this.wake.unshift({ x: this.x, y: this.player.y });
      if (this.wake.length > 10) {
        this.wake.pop();
      }
    }
  }
  draw(context) {
    context.save();
    this.wake.forEach((wake, index) => {
      // 数组前面是新的轨迹
      context.globalAlpha = 0.2 - (index / 10) * 0.2;
      if (this.player.speed < 0) {
        context.save();
        context.scale(-1, 1);
        context.drawImage(
          this.player.image,
          this.player.frameX * this.player.spriteWidth,
          this.player.frameY * this.player.spriteHeight,
          this.player.spriteWidth,
          this.player.spriteHeight,
          -wake.x - this.player.width,
          wake.y,
          this.player.width,
          this.player.height,
        );
        context.restore();
      } else {
        context.drawImage(
          this.player.image,
          this.player.frameX * this.player.spriteWidth,
          this.player.frameY * this.player.spriteHeight,
          this.player.spriteWidth,
          this.player.spriteHeight,
          wake.x,
          wake.y,
          this.player.width,
          this.player.height,
        );
      }
    });
    context.restore();
  }
}

// 火柱
export class FirePillar extends Particle {
  constructor(game, player) {
    super(game);
    this.player = player;
    this.x = player.x + player.width - 20;
    this.y = player.y + player.height / 2 + 10;
    // 长度
    this.x2 = this.x + 500;
    this.y2 = this.y + 500;

    // 宽度
    this.preLineH = 10; //起始宽度
    this.lineH = 10;

    this.deg = -75;

    // document.getElementById('canvas1').addEventListener('pointerdown', (event) => {
    // })
  }
  move() {}
  destroyed() {
    if (this.game.player.skills[skills.FIREPILLARSKILL].actived === false) {
      this.markedForDeletion = true;
    }
  }

  update() {
    super.update();
    if (this.lineH < 50) {
      this.lineH += 0.2;
    }
    this.deg += 0.3;

    // 矩形碰撞检测
    // 怪物没死才处理碰撞
    this.game.enemies.forEach((enemy) => {
      if (enemy.dead && checkCollision(enemy, this, 'separation')) {
        //发生碰撞 --各处理各的
        enemy.handleCollision(this);
        // 消灭敌人   --处理乌鸦这种不会被直接杀死的
        if (enemy.dead) {
          this.game.score += enemy.score;
          // 浮动消息 --起始位置到偏移量
          this.game.floatingMessages.push(
            new FloatingMessageRed(this.game, enemy.score, enemy.x, enemy.y, 150, 50),
          );
        }
      }
    });
  }
  draw(context) {
    if (!this.game.debug) {
      let pillar = this;
      // 计算旋转后的四个顶点坐标
      function rotatePoint(cx, cy, angle, px, py) {
        let s = Math.sin(angle);
        let c = Math.cos(angle);
        // translate point back to origin:
        px -= cx;
        py -= cy;
        // rotate point
        let xnew = px * c - py * s;
        let ynew = px * s + py * c;
        // translate point back:
        px = xnew + cx;
        py = ynew + cy;
        return { x: px, y: py };
      }
      function calculateRotatedPoints(x, y, x2, y2, lineH, deg) {
        let angle = (deg * Math.PI) / 180;
        let w = Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y));

        // 旋转前的四个顶点
        let p1 = { x, y: y - lineH / 2 };
        let p2 = { x: x + w, y: p1.y };
        let p3 = { x: x + w, y: y + lineH / 2 };
        let p4 = { x, y: p3.y };

        // 旋转所有四个顶点
        let rp1 = rotatePoint(x, y, angle, p1.x, p1.y);
        let rp2 = rotatePoint(x, y, angle, p2.x, p2.y);
        let rp3 = rotatePoint(x, y, angle, p3.x, p3.y);
        let rp4 = rotatePoint(x, y, angle, p4.x, p4.y);

        return [rp1, rp2, rp3, rp4];
      }

      let pillarVertices = calculateRotatedPoints(
        pillar.x,
        pillar.y,
        pillar.x2,
        pillar.y2,
        pillar.lineH,
        pillar.deg,
      );
      //开始一个新的绘制路径
      context.beginPath();
      //设置线条颜色为蓝色
      context.strokeStyle = 'blue';
      //设置路径起点坐标
      pillarVertices.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        }
        context.lineTo(point.x, point.y);
      });
      //先关闭绘制路径。
      context.closePath();
      //最后，按照绘制路径画出直线
      context.stroke();
    }

    context.save();
    //
    const _y = this.y - (this.lineH - this.preLineH) / 2;
    context.translate(this.x, this.y);
    context.rotate((this.deg * Math.PI) / 180);
    context.translate(-this.x, -this.y);
    // 设置渐变色
    const linearGradient = context.createLinearGradient(this.x, _y, this.x, _y + this.lineH);
    linearGradient.addColorStop(0, '#de5332');
    linearGradient.addColorStop(0.4, '#f3c105');
    linearGradient.addColorStop(0.5, '#ffc800');
    linearGradient.addColorStop(0.6, '#f3c105');
    linearGradient.addColorStop(1, '#de5332');
    // 边缘和填充
    context.strokeStyle = linearGradient;
    context.fillStyle = linearGradient;

    context.beginPath();
    // 圆角矩形  --后面的参数圆角,  根号下 x1-x2的平方+y1-y2的平方
    context.roundRect(
      this.x,
      _y,
      Math.sqrt(Math.pow(this.x - this.x2, 2) + Math.pow(this.y - this.y2, 2)), //宽
      this.lineH, //高
      50,
    );
    context.fill();
    context.stroke();

    context.restore();
  }
}
