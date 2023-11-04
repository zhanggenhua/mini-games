import { Sitting, Running, Jumping, Falling, Rolling, Diving, Hit } from './playerStates.js';
import { CollisionAnimation } from './collisionAnimation.js';
import { FloatingMessage } from './floatingMessages.js';

export class Player {
  constructor(game) {
    this.game = game;
    // 精灵图每帧的宽高
    this.width = 100;
    this.height = 91.3;
    // 位置
    this.x = 0;
    this.y = this.game.height - this.height - this.game.groundMargin;
    // 速度
    this.vy = 0;
    this.weight = 1;
    this.image = document.getElementById('player'); //不用new一个Image了
    this.frameX = 0;
    this.maxFrame = 5;
    this.fps = 20;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
    this.frameY = 0;
    // 引入加速度和摩擦力 模拟更真实的物理
    this.acceleration = 0.5; // 设置加速度值
    this.friction = 0.1; // 设置摩擦力值
    this.speed = 0; //初始速度
    this.maxSpeed = 10; //移动速度
    this.states = [
      new Sitting(this.game),
      new Running(this.game),
      new Jumping(this.game),
      new Falling(this.game),
      new Rolling(this.game),
      new Diving(this.game),
      new Hit(this.game),
    ];
    this.currentState = null;
  }
  update(input, deltaTime) {
    this.checkCollision();
    this.currentState.handleInput(input);

    // 水平移动
    this.x += this.speed;
    if (input.includes('ArrowRight') && this.currentState !== this.states[6]) {
      this.speed += this.acceleration; // 向右加速
    } else if (input.includes('ArrowLeft') && this.currentState !== this.states[6]) {
      this.speed -= this.acceleration; // 向左加速
    } else {
      // 当没有按下左右键时，根据摩擦力逐渐减小速度
      if (this.speed > 0) {
        this.speed -= this.friction;
        if (this.speed < 0) {
          this.speed = 0;
        }
      } else if (this.speed < 0) {
        this.speed += this.friction;
        if (this.speed > 0) {
          this.speed = 0;
        }
      }
    }
    // 限制速度不超过最大速度
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    } else if (this.speed < -this.maxSpeed) {
      this.speed = -this.maxSpeed;
    }

    // 限制玩家不超过水平画布
    if (this.x < 0) this.x = 0;
    if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;
    // 垂直距离
    this.y += this.vy;
    if (!this.onGround()) this.vy += this.weight;
    else this.vy = 0;
    // 限制玩家不超过垂直画布
    if (this.y > this.game.height - this.height - this.game.groundMargin) {
      this.y = this.game.height - this.height - this.game.groundMargin;
    }
    // 动画部分
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = 0;
    } else {
      this.frameTimer += deltaTime;
    }
  }
  draw(context) {
    if (this.game.debug) {
      context.strokeRect(this.x, this.y, this.width, this.height);
    }
    context.drawImage(
      this.image,
      this.frameX * this.width,
      this.frameY * this.height,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
  onGround() {
    return this.y >= this.game.height - this.height - this.game.groundMargin;
  }
  setState(state, speed) {
    this.currentState = this.states[state];
    this.game.speed = this.game.maxSpeed * speed;
    this.currentState.enter();
  }
  checkCollision() {
    this.game.enemies.forEach((enemy) => {
      if (
        enemy.x < this.x + this.width &&
        enemy.x + enemy.width > this.x &&
        enemy.y < this.y + this.height &&
        enemy.y + enemy.height > this.y
      ) {
        //发生碰撞
        enemy.markedForDeletion = true;
        this.game.collisions.push(
          new CollisionAnimation(
            this.game,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5,
          ),
        );
        if (this.currentState === this.states[4] || this.currentState === this.states[5]) {
          this.game.score++;
          this.game.floatingMessages.push(new FloatingMessage('+1', enemy.x, enemy.y, 150, 50));
        } else {
          this.setState(6, 0);
          this.game.score -= 5;
          this.game.lives--;
          if (this.game.lives <= 0) this.game.gameOver = true;
        }
      }
    });
  }
}
