import { Player } from './player.js'; //建议作为源码阅读的入口
import { InputHandler } from './input.js';
import { BackGround } from './backGround.js';
import { FlyingEnemy, ClimbingEnemy, GroundEnemy } from './enemies.js';
import { UI } from './UI.js';
window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 900;
  canvas.height = 500;

  class Game {
    constructor(width, height) {
      this.pause = false; //控制游戏暂停
      this.width = width;
      this.height = height;

      this.level = 1; //记录游戏级别  --必须在背景初始化前

      this.groundMargin = 80; //地面高度
      this.speed = 0; //游戏速度,决定了地图移动速度
      this.maxSpeed = 3;

      // 目前对象初始化有着严格的依赖顺序
      this.ui = new UI(this);
      this.player = new Player(this);
      this.background = new BackGround(this);
      this.input = new InputHandler(this); //记录用户输入，没什么好说的

      this.enemies = [];
      this.enemyInterval = 1000; //新敌人加入画面的速度，可以调节敌人出现的速度  Interval--间隔
      this.enemyTimer = 0; //敌人计时器，用于生成敌人

      this.particles = [];
      this.collisions = [];
      this.floatingMessages = [];
      this.maxParticles = 50;
      this.debug = false;
      this.score = 0;
      this.winningScore = 1;
      this.fontColor = 'black';
      // 一局时间限制
      // this.time = 0;
      // this.maxTime = 60000;
      this.gameOver = false;
      this.lives = 5;

      this.player.currentState = this.player.states[0];
      this.player.currentState.enter();
    }
    update(deltaTime) {
      // this.time += deltaTime;
      // if (this.time > this.maxTime) this.gameOver = true;
      this.background.update();
      this.player.update(this.input.keys, deltaTime);
      // 敌人的更新控制
      if (this.enemyTimer > this.enemyInterval) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
      this.enemies.forEach((enemy, index) => {
        enemy.update(deltaTime);
        if (enemy.markedForDeletion) this.enemies.splice(index, 1);
      });
      // 处理消除敌人消息
      this.floatingMessages.forEach((message) => {
        message.update();
      });
      // 处理粒子效果
      this.particles.forEach((particle, index) => {
        particle.update();
        if (particle.markedForDeletion) this.particles.splice(index, 1);
      });
      // 清除超出上限的粒子
      if (this.particles.length > this.maxParticles) {
        this.particles.length = this.maxParticles;
      }

      // 处理碰撞动画效果
      this.collisions.forEach((collision, index) => {
        collision.update(deltaTime);
        if (collision.markedForDeletion) this.collisions.splice(index, 1);
      });

      // 删除标记了的元素
      // this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
      // this.particles = this.particles.filter((particle) => !particle.markedForDeletion);
      // this.collisions = this.collisions.filter((collision) => !collision.markedForDeletion);
      this.floatingMessages = this.floatingMessages.filter((message) => !message.markedForDeletion);
      // console.log(this.enemies, this.particles, this.collisions, this.floatingMessages);
    }
    draw(context) {
      this.background.draw(context);
      this.player.draw(context);
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      this.particles.forEach((particle) => {
        particle.draw(context);
      });
      this.collisions.forEach((collision) => {
        collision.draw(context);
      });
      this.floatingMessages.forEach((message) => {
        message.draw(context);
      });
      this.ui.draw(context);
    }
    addEnemy() {
      if (this.speed > 0) {
        if (this.level < 5) {
          // 地面敌人生成
          if (Math.random() < 0.5) {
            this.enemies.push(new GroundEnemy(this));
          } else {
            this.enemies.push(new ClimbingEnemy(this));
          }
          this.enemies.push(new FlyingEnemy(this));
        } else {
        }
      }
    }
  }

  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;

  function animate(timeStamp) {
    if (game.pause) return;
    // 两帧之间的时间差 记录时间增量是为了在不同设备上也有一样的游戏速度？也叫锁帧，此处实际只是用在动画上  --为什么不直接用当前时间戳减去一个预定义的数值而是记录增量？如你所见game需要用到这个变量
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime); //更新数据是为了draw 绘制做准备
    game.draw(ctx);
    if (!game.gameOver) requestAnimationFrame(animate);
  }
  animate(0);

  let mark = document.getElementsByClassName('pause__mark')[0];
  let pauseText = document.getElementsByClassName('pause__text')[0];
  // 失去焦点暂停游戏
  window.onblur = function () {
    game.pause = true;
    mark.style.visibility = 'visible';
    pauseText.style.visibility = 'visible';
    pauseText.classList.remove('blur-out-expand');
    // 暂停时要清空输入，因为没有触发松开按键的事件
    game.input.keys = [];
  };
  window.onfocus = function () {
    game.pause = false;
    mark.style.visibility = 'hidden';
    pauseText.classList.add('blur-out-expand');
    animate(0);
  };

  /**
   * @param {number} targetCount 不小于1的整数，表示经过targetCount帧之后返回结果
   * @return {Promise<number>}
   */
  const getScreenFps = (() => {
    // 先做一下兼容性处理
    const nextFrame = [
      window.requestAnimationFrame,
      window.webkitRequestAnimationFrame,
      window.mozRequestAnimationFrame,
    ].find((fn) => fn);
    if (!nextFrame) {
      console.error('requestAnimationFrame is not supported!');
      return;
    }
    return (targetCount = 50) => {
      // 判断参数是否合规
      if (targetCount < 1) throw new Error('targetCount cannot be less than 1.');
      const beginDate = Date.now();
      let count = 0;
      return new Promise((resolve) => {
        (function log() {
          nextFrame(() => {
            if (++count >= targetCount) {
              const diffDate = Date.now() - beginDate;
              const fps = (count / diffDate) * 1000;
              return resolve(fps);
            }
            log();
          });
        })();
      });
    };
  })();

  getScreenFps().then((fps) => {
    console.log('当前屏幕刷新率为', fps);
  });
});
