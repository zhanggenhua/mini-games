import { Sitting, Running, Jumping, Falling, Rolling, Diving, Hit } from './playerStates.js';
import { CollisionAnimation } from './collisionAnimation.js';
import { FloatingMessage } from './floatingMessages.js';
import { checkCollision } from '../utils/tool.js';

export class Player {
  constructor(game) {
    this.game = game;
    // 精灵图每帧的宽高
    this.width = 100;
    this.height = 91.3;
    // 位置
    this.x = 0;
    // 记录地板高度 后面要用 groundMargin: 地板高度
    this.ground = this.game.height - this.height - this.game.groundMargin;
    this.y = this.ground;

    this.vy = 0; // 垂直速度
    this.jumpDuration = 2; //跳跃总时间，以此计算重力加速度 --好处：更直观的控制手感
    this.maxJumpHeight = this.ground / 1; //跳跃的最大高度
    this.minJumpHeight = this.ground / 8; //跳跃的最小高度
    this.jumpNumber = 0; //记录跳跃次数，实现二段跳
    this.jumpSwitch = false; //跳跃开关 只有按下又松开上键才 为true
    this.airResistance = 0; // 空气阻力  --可能做飞行功能用得到

    // 计算属性 -- h= 1/2 gt^2  --由函数图像得来，vt*t /2: 总路程 | v=gt
    this.g = 1; //重力加速度 -- g=2h/t^2  --像素好像没法算
    this.maxJumpSpeed = -Math.floor(Math.sqrt(2 * this.g * this.maxJumpHeight)); //最大跳跃速度 --公式：v0^2=2*g*h
    // this.minJumpSpeed = -Math.floor(Math.sqrt(2 * this.g * this.minJumpHeight)); //最小跳跃速度
    console.log('计算属性', this.g, this.maxJumpSpeed, this.minJumpSpeed);

    this.image = document.getElementById('player'); //不用new一个Image了
    this.frameX = 0;
    this.maxFrame = 5;
    this.fps = 20;
    this.frameInterval = 1000 / this.fps; //每一帧的时间间隔  --随fps变小而增大，总之动画变慢
    this.frameTimer = 0; //跟踪每帧时间间隔，和上方变量配置， 让动画是根据时间来播放  而不是根据电脑性能
    this.frameY = 0;

    // 引入加速度和摩擦力 模拟更真实的物理 --匀加速直线运动
    this.acceleration = 0.3; // 设置加速度值
    this.friction = 0.5; // 设置摩擦力值
    this.speed = 0; //初速度
    this.maxSpeed = 8; //最大移动速度
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
    this.checkCollision(); //碰撞检测
    // 状态机处理当前输入
    this.currentState.handleInput(input);

    this.move(input);
    this.jump();

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
  setState(state, speed) {
    // 根据state状态获取对应状态机
    this.currentState = this.states[state];
    // 游戏速度
    this.game.speed = this.game.maxSpeed * speed;
    // 执行状态机行为
    this.currentState.enter();
  }
  // 移动
  move(input) {
    // 水平移动
    this.x += this.speed;
    // 右移，并且不在发动技能
    if (input.includes('ArrowRight') && this.currentState !== this.states[6]) {
      // 应该有个刹车的动作
      if (this.speed < 0) this.speed = 0.5;
      this.speed += this.acceleration; // 向右加速
    } else if (input.includes('ArrowLeft') && this.currentState !== this.states[6]) {
      if (this.speed > 0) this.speed = -0.5;
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
  }
  // 跳跃
  jump() {
    // 垂直距离  --y轴向下
    this.y += this.vy;

    if (!this.onGround()) {
      this.vy += this.g;
      // 应用空气阻力
      this.vy -= this.airResistance * this.vy;
    } else {
      this.vy = 0;
      this.jumpNumber = 0; //跳跃次数置空
      // 限制玩家不超过垂直画布  以防万一，将y初始化
      this.y = this.ground;
    }
  }
  // 是否在地面
  onGround() {
    return this.y >= this.ground;
  }
  // 是否满足二段跳条件
  canJump() {
    return this.jumpNumber < 2 && this.jumpSwitch;
  }
  // 碰撞检测
  checkCollision() {
    this.game.enemies.forEach((enemy) => {
      if (checkCollision(enemy, this)) {
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
          // 初始化状态
          this.setState(6, 0);
          this.game.score -= 5;
          this.game.lives--;
          if (this.game.lives <= 0) this.game.gameOver = true;
        }
      }
    });
  }
}
