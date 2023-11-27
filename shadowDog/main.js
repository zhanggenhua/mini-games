import { Player } from './player.js'; //建议作为源码阅读的入口
import { InputHandler } from './input.js';
import { BackGround } from './backGround.js';
import EnemyFactory from './enemies/index.js';
import { UI } from './UI.js';
import { observe } from '../utils/tool.js';
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
      this.time = 0;
      // 一局时间限制
      // this.maxTime = 60000;
      this.gameOver = false;
      this.lives = 5;

      this.player.currentState = this.player.states[0];
      this.player.currentState.enter();

      this.enemyFactory = new EnemyFactory(this);

      observe(this, ['groundMargin'], () => {
        console.log('计算触发', Object.assign({}, this));
        this.player.computed();
        this.enemies.forEach((enemy) => {
          enemy.computed();
        });
      });
    }

    update(deltaTime) {
      this.time += deltaTime;
      // if (this.time > this.maxTime) this.gameOver = true;
      this.background.update();
      this.player.update(this.input.keys, deltaTime);
      // 敌人生成
      if (this.enemyTimer > this.enemyInterval) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
      this.enemies.forEach((enemy, index) => {
        enemy.update(deltaTime);
        // 这种方式可能会使得后面的怪物更新出现错误
        // if (enemy.markedForDeletion) this.enemies.splice(index, 1);
      });
      // 处理消除敌人消息
      this.floatingMessages.forEach((message) => {
        message.update();
      });
      // 处理粒子效果
      this.particles.forEach((particle, index) => {
        particle.update();
      });
      // 清除超出上限的粒子
      if (this.particles.length > this.maxParticles) {
        this.particles.length = this.maxParticles;
      }
      // 处理碰撞动画效果
      this.collisions.forEach((collision, index) => {
        collision.update(deltaTime);
      });

      // 删除标记了的元素 --这种方式似乎更好
      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
      this.particles = this.particles.filter((particle) => !particle.markedForDeletion);
      this.collisions = this.collisions.filter((collision) => !collision.markedForDeletion);
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
        try {
          let factory = ['Fly', 'Ground', 'Climbing'];
          let index = Math.floor(Math.random() * 3); // 0-2
          let enemy = this.enemyFactory[`create${factory[index]}Enemy`]();
          console.log(enemy);
          if (Array.isArray(enemy)) {
            this.enemies.push(...enemy);
          } else {
            this.enemies.push(enemy);
          }
        } catch (error) {
          console.error(error, error.data);
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
  // 失去焦点暂停游戏  --需要修复时间累积
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
});
