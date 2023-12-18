import {
  Sitting,
  Running,
  Jumping,
  Falling,
  Rolling,
  Diving,
  Hit,
  Standing,
} from './state/playerStates.js';
import {
  skills,
  FeatherFall,
  SpiritBombSkill,
  RollSkill,
  SprintSkill,
  FirePillarSkill,
  RainbowSkill,
  BulletTimeSkill,
  Giant,
} from './skill.js';
import { CollisionAnimation } from './collisionAnimation.js';
import { FloatingMessage } from './floatingMessages.js';
import { checkCollision, throttle, imageDataHRevert, observe } from '../utils/tool.js';

export class Player {
  constructor(game) {
    this.game = game;
    // 精灵图每帧的宽高
    this.spriteWidth = 100;
    this.spriteHeight = 91.3;
    this.width = this.spriteWidth;
    this.height = this.spriteHeight;
    // 位置
    this.x = 0;

    this.vy = 0; // 垂直速度

    this.jumpNumber = 0; //记录跳跃次数，实现二段跳
    this.maxJumpNumber = 2; //最大跳跃次数
    this.jumpSwitch = false; //跳跃开关 只有按下又松开上键才 为true
    this.airResistance = 0; // 空气阻力  --可能做飞行功能用得到
    this.airControl = 0.8; //空中控制力

    this.y = this.game.background.realHeight - this.height;
    // 计算属性 -- h= 1/2 gt^2  --由函数图像得来，vt*t /2: 总路程 | v=gt
    this.g = 1; //重力加速度 -- g=2h/t^2  --像素好像没法算

    // this.runInterval = 1000 / 60; // 运动的帧率
    // this.runTimer = 0;

    this.image = document.getElementById('player'); //不用new一个Image了
    this.frameX = 0;
    this.maxFrame = 5;
    this.fps = 20; //游戏以每秒60帧运行，动画以20帧每秒--这是素材预定义好的
    // 一秒除以fps，意思是一秒之内动画变动了fps次
    this.frameInterval = 1000 / this.fps; //每一帧的时间间隔  --随fps变小而增大，总之动画变慢
    this.frameTimer = 0; //跟踪[动画]每帧时间间隔，和上方变量配合， 让动画是根据时间来播放  而不是根据电脑性能
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
      new Standing(this.game),
    ];
    this.currentState = null;

    this.skills = [
      new SpiritBombSkill(this.game),
      new FeatherFall(this.game),
      new RollSkill(this.game),
      new SprintSkill(this.game),
      new FirePillarSkill(this.game),
      new RainbowSkill(this.game),
      // new BulletTimeSkill(this.game),
      new Giant(this.game),
    ];
    this.currentSkill = null; //当前技能
    // this.activeSkill = [];//进入冷却的技能
    // this.buff = []; //有的技能可能给的是buff  --buff的值即技能名

    this.buff = [];

    this.checkCollision = throttle(() => {
      this._checkCollision(); //碰撞检测
    });

    this.computed();

    observe(this, ['fps', 'width', 'height'], () => {
      console.log('计算触发', Object.assign({}, this));
      this.game.player.computed();
    });
  }

  // 计算属性，可能会有变动 --因为依赖于其他对象的属性，而又不会自动更新
  computed() {
    // this.jumpDuration = 2 * this.maxJumpHeight / this.g;// 计算跳跃的时间
    // this.jumpDuration = 2; //跳跃总时间，以此计算重力加速度 --好处：更直观的控制手感
    // this.minJumpSpeed = -Math.floor(Math.sqrt(2 * this.g * this.minJumpHeight)); //最小跳跃速度
    // 记录地板高度 后面要用 groundMargin: 地板高度
    this.ground = this.game.background.realHeight - this.height;
    this.maxJumpHeight = this.ground / 2; //跳跃的最大高度
    this.minJumpHeight = this.ground / 8; //跳跃的最小高度

    this.maxJumpSpeed = -Math.floor(Math.sqrt(2 * this.g * this.maxJumpHeight)); //最大跳跃速度 --公式：v0^2=2*g*h
    console.log('计算属性,重力、最大跳跃', this.g, this.maxJumpSpeed);
  }

  setState(state, speed) {
    console.log('状态切换', state, speed);
    // console.trace();// 打印堆栈还是有用的，终于找出bug了
    // 根据state状态获取对应状态机
    this.currentState = this.states[state];
    // 游戏速度
    this.game.speed = this.game.maxSpeed * speed;
    // 执行状态机行为
    this.currentState.enter();
  }
  // 使用技能
  useSkill(skill, ...params) {
    this.currentSkill = this.skills[skill];
    if (this.currentSkill.cdOk) {
      console.log('使用技能', this.currentSkill);
      this.currentSkill.use(params);
      // this.activeSkill.push(this.currentSkill);
    } else {
      // 已经激活，则直接结束激活
      if (this.currentSkill.actived) {
        this.currentSkill.activeEnd();
      } else {
        this.currentSkill.headShake();
      }
    }
  }
  // 设置buff
  setBuff(buff, delay) {
    if (this.buff.includes(buff)) return;
    this.buff.push(buff);

    if (buff === 'slow') {
      // 玩家变慢
      this.game.player.fps = 5;
      this.oldMaxSpeed = this.maxSpeed;
      this.game.player.maxSpeed = 2;
    }
    setTimeout(() => {
      //恢复正常
      if (buff === 'slow') {
        this.fps = 20;
        this.maxSpeed = this.oldMaxSpeed;
      }
      this.buff = this.buff.filter((b) => b !== buff);
    }, delay);
  }

  update(input, deltaTime) {
    // console.log(
    //   '当前状态',
    //   this.currentState.state,
    //   '速度',
    //   this.speed,
    //   this.game.speed,
    //   '按键',
    //   this.game.input.keys,
    //   '在地上？',
    //   this.onGround(),
    //   Object.assign({}, this),
    // );
    this.checkCollision();
    // 状态机处理当前输入
    this.currentState.handleInput(input);
    // 实时更新技能
    // this.activeSkill.forEach((skill) => {
    //   skill.update(deltaTime);
    // })

    // 基于时间的游戏速度优化
    // if (this.runTimer > this.runInterval) {
    //   this.speed *= deltaTime
    //   this.move(input);
    //   this.runTimer -= this.runInterval; //不是归零而是减去，误差更小
    // }else{
    //   this.runTimer += deltaTime;
    // }

    this.move(input);
    this.jump();

    // 动画部分 --动画是根据时间来播放  而不是根据电脑性能
    if (this.frameTimer > this.frameInterval) {
      this.frameX >= this.maxFrame ? (this.frameX = 0) : this.frameX++;
      this.frameTimer = 0; //不是归零而是减去，误差更小  --不能减，会有时间积累
    } else {
      this.frameTimer += deltaTime;
    }
  }

  // 移动
  move(input) {
    // 水平移动
    this.x += this.speed;
    // 右移，并且没有滚动
    if (input.includes('ArrowRight') && this.currentState !== this.states[6]) {
      // --应该有个刹车的动作
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
    if (this.x <= 0) this.x = 0;
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
    return this.jumpNumber < this.maxJumpNumber && this.jumpSwitch;
  }

  // 是否杀戮状态
  kill() {
    console.log('???', this.skills[skills.GIANT].actived);
    return (
      this.currentState === this.states[4] ||
      this.currentState === this.states[5] ||
      this.skills[skills.GIANT].actived === true
    );
  }
  // 是否无敌状态
  wudi() {
    return this.currentState === this.states[6] || this.kill();
  }

  // 碰撞检测
  _checkCollision() {
    if (this.game.debug) return;

    // 碰撞盒
    this.collision = {
      x: this.x + 5,
      y: this.y + 15,
      width: this.width,
      height: this.height,
    };
    this.game.enemies.forEach((enemy) => {
      // 怪物没死才处理碰撞
      if (!enemy.dead && checkCollision(enemy, this.collision)) {
        //发生碰撞 --各处理各的
        enemy.handleCollision(this);
        // 消灭敌人   --处理乌鸦这种不会被直接杀死的
        if (this.kill() && enemy.dead) {
          this.game.score += enemy.score;
          // 浮动消息 --起始位置到偏移量
          this.game.floatingMessages.push(
            new FloatingMessage(this.game, enemy.score, enemy.x, enemy.y, 150, 50),
          );
        }

        // 受击
        if (!this.wudi()) {
          this.setState(6, 0);
          this.game.score -= 5;
          this.game.lives--;
          this.game.floatingMessages.push(
            new FloatingMessage(this.game, 'FUCK!', this.x, this.y, this.x - 20, this.y - 20, 70),
          );
          if (this.game.lives <= 0) this.game.gameOver = true;

          // 添加屏幕振动效果
          this.game.canvas.classList.remove('shake-horizontal');
          setTimeout(() => {
            this.game.canvas.classList.add('shake-horizontal');
          });
        }
      }
    });
  }

  draw(context) {
    if (this.game.debug) {
      // context.strokeRect(this.x, this.y, this.width, this.height);
      context.beginPath();
      context.arc(
        this.x + this.width / 2 + 5,
        this.y + this.height / 2 + 15,
        this.width / 3,
        0,
        Math.PI * 2,
      );
      context.stroke();
    }

    // 向左
    if (this.speed < 0) {
      context.save();
      context.scale(-1, 1);
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        -this.x - this.width,
        this.y,
        this.width,
        this.height,
      );
      // // 保存背景
      // let bkgOldImageData = context.getImageData(0, 0, this.game.width, this.game.height);
      // // 二重翻转准备，获取目标区域背景
      // let bkgImageData = context.getImageData(this.x, this.y, this.width, this.height);
      // let bkgNewImageData = context.getImageData(this.x, this.y, this.width, this.height);

      // context.clearRect(0, 0, this.game.width, this.game.height);

      // // 获取带反转背景的角色图片
      // context.putImageData(imageDataHRevert(bkgNewImageData, bkgImageData), this.x, this.y);
      // context.drawImage(
      //   this.image,
      //   this.frameX * this.width,
      //   this.frameY * this.height,
      //   this.spriteWidth,
      //   this.spriteHeight,
      //   this.x,
      //   this.y,
      //   this.width,
      //   this.height,
      // );
      // let imgData = context.getImageData(this.x, this.y, this.width, this.height);
      // let newImgData = context.getImageData(this.x, this.y, this.width, this.height);

      // // 将保存的背景重新绘制到画布上
      // context.putImageData(bkgOldImageData, 0, 0);
      // //反转角色部分
      // context.putImageData(imageDataHRevert(newImgData, imgData), this.x, this.y); //左右翻转
      context.restore();
    } else {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height,
      );
    }
  }
}
