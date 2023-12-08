import { Player } from './player.js';
import { InputHandler } from './input.js';
import { BackGround } from './backGround.js';
import EnemyFactory from './enemies/index.js';
import { UI } from './UI.js';

import { CollisionAnimation } from './collisionAnimation.js';
import { FloatingMessage } from './floatingMessages.js';
import { SpiritBomb } from './particle.js';
import { checkCollision } from '../utils/tool.js';

import Crow from './enemies/fly/Crow.js';
import { skills } from './skill.js';

import { fadeIn, fadeOut } from '../utils/tool.js';

window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 900;
  canvas.height = 500;
  // 创建颜色碰撞检测画布
  const collisionCanvas = document.getElementById('collisionCanvas');
  const collisionCtx = collisionCanvas.getContext('2d');
  collisionCanvas.width = canvas.width;
  collisionCanvas.height = canvas.height;
  // 拖尾效果画布
  const particlesCanvas = document.getElementById('particlesCanvas');
  const particlesCtx = collisionCanvas.getContext('2d');
  particlesCanvas.width = canvas.width;
  particlesCanvas.height = canvas.height;

  class Game {
    constructor(width, height) {
      this.pause = false; //控制游戏暂停
      this.debug = false;

      this.width = width;
      this.height = height;

      this.level = 1; //记录游戏级别  --必须在背景初始化前

      this.speed = 0; //游戏速度,决定了地图移动速度
      this.maxSpeed = 1;

      // 目前对象初始化有着严格的依赖顺序
      this.ui = new UI(this);
      this.background = new BackGround(this);
      this.player = new Player(this);
      this.input = new InputHandler(this); //记录用户输入，没什么好说的

      this.enemies = [];
      this.enemyInterval = 1000; //新敌人加入画面的速度，可以调节敌人出现的速度  Interval--间隔
      this.enemyTimer = 0; //敌人计时器，用于生成敌人

      this.particles = [];
      this.collisions = [];
      this.floatingMessages = [];

      this.maxParticles = 50000;
      this.score = 0;
      this.winningScore = 1;
      this.fontColor = 'black';
      this.time = 0;
      // 一局时间限制
      // this.maxTime = 60000;
      this.gameOver = false;
      this.lives = 5; //生命

      // 状态初始化
      this.player.currentState = this.player.states[0];
      this.player.currentState.enter();

      this.enemyFactory = new EnemyFactory(this);

      this.flag = true;
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
      this.particles.forEach((particle) => {
        particle.draw(context);
        // if (particle.constructor.name == 'SpiritBomb') {
        //   particle.draw(particlesCtx);
        // }
      });
      this.player.draw(context);
      this.collisions.forEach((collision) => {
        collision.draw(context);
      });
      this.floatingMessages.forEach((message) => {
        message.draw(context);
      });
      this.ui.draw(context);
      this.enemies.forEach((enemy) => {
        if (enemy.constructor.name == 'Crow') {
          enemy.draw(context, collisionCtx);
          return;
        }
        enemy.draw(context);
      });
    }
    addEnemy() {
      if (this.speed > 0) {
        // test
        // if (!this.flag) return;
        // this.flag = false;
        try {
          let factory = ['Fly', 'Ground', 'Climbing'];
          // let factory = ['Fly'];
          let index = Math.floor(Math.random() * factory.length); // 0-2
          let enemy = this.enemyFactory[`create${factory[index]}Enemy`]();
          console.log('敌人生成', enemy);
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

  let game = new Game(canvas.width, canvas.height);
  let lastTime = 0;
  this.window.game = game; //test

  function restartGame() {
    game = new Game(canvas.width, canvas.height);
    lastTime = 0;
  }
  this.document.getElementById('restart').addEventListener('pointerdown', restartGame);

  // timeStamp 哪怕不执行animate也一直增长，所以用假暂停
  function animate(timeStamp) {
    // 两帧之间的时间差 记录时间增量是为了在不同设备上也有一样的游戏速度？也叫锁帧，此处实际只是用在动画上  --为什么不直接用当前时间戳减去一个预定义的数值而是记录增量？如你所见game需要用到这个变量
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    if (!game.pause && !game.gameOver) {
      // 清除后再绘制
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
      // 用带透明度的矩形代替清空 --实现拖尾效果，失败的尝试
      // particlesCtx.globalCompositeOperation = 'destination-in';
      // particlesCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      // particlesCtx.fillRect(0, 0, canvas.width, canvas.height);

      game.update(deltaTime); //更新数据是为了draw 绘制做准备
      game.draw(ctx);
    }
    requestAnimationFrame(animate);
  }
  animate(0);

  // 点击击杀乌鸦  --指针事件，包含了点击，触摸
  window.addEventListener('pointerdown', function (e) {
    let point = getMousePos(collisionCanvas, e); //获取相对位置
    const detectPixelColor = collisionCtx.getImageData(point.x, point.y, 1, 1); //获取鼠标点击的那块区域的相关属性
    const pc = detectPixelColor.data; //鼠标点击的那块区域的rgb值如rgb(0,0,0,0.1)
    game.enemies.forEach((enemy) => {
      //对每个乌鸦进行碰撞检测
      if (enemy.constructor.name == 'Crow') {
        if (
          enemy.randomColor[0] === pc[0] &&
          enemy.randomColor[1] === pc[1] &&
          enemy.randomColor[2] === pc[2]
        ) {
          // 触发元气弹
          game.player.useSkill(skills.SPIRITBOMBSKILL, enemy);
        }
      }
    });
  });
  function getMousePos(canvas, event) {
    // 获取实际宽高
    var style = window.getComputedStyle(canvas, null);
    var cssWidth = parseFloat(style['width']);
    var cssHeight = parseFloat(style['height']);
    var scaleX = canvas.width / cssWidth; // 水平方向的缩放因子
    var scaleY = canvas.height / cssHeight; // 垂直方向的缩放因子
    // 获取边界距离窗口距离，以及自身宽高
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    x *= scaleX; // 修正水平方向的坐标
    y *= scaleY; // 修正垂直方向的坐标
    console.log('x:', x, 'y:', y);
    return {
      x: x,
      y: y,
    };
  }

  // 移动端适配
  //禁止页面滑动
  var html = document.getElementsByTagName('html')[0];
  var body = document.getElementsByTagName('body')[0];
  function stopScroll() {
    var o = {};
    (o.can = function () {
      html.style.overflow = 'visible';
      html.style.height = 'auto';
      body.style.overflow = 'visible';
      body.style.height = 'auto';
    }),
      (o.stop = function () {
        html.style.overflow = 'hidden';
        html.style.height = '100%';
        body.style.overflow = 'hidden';
        body.style.height = '100%';
      });
    return o;
  }
  const scroll = stopScroll();
  scroll.stop(); //禁止页面滚动
  // 禁用右键菜单
  body.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      canvas.requestFullscreen().catch((err) => {
        alert(`错误，不能切换为全屏模式：${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
  this.document.getElementById('fullScreenButton').addEventListener('click', toggleFullScreen);

  let mark = document.getElementsByClassName('pause__mark')[0];
  let pauseText = document.getElementsByClassName('pause__text')[0];
  // 失去焦点暂停游戏  --需要修复时间累积
  window.onblur = function () {
    game.pause = true;
    mark.style.visibility = 'visible';
    pauseText.style.visibility = 'visible';
    pauseText.style.zIndex = '4000';
    pauseText.classList.remove('blur-out-expand');
    // 暂停时要清空输入，因为没有触发松开按键的事件
    game.input.keys = [];
  };
  window.onfocus = function () {
    game.pause = false;
    mark.style.visibility = 'hidden';
    setTimeout(() => {
      // 等动画效果结束
      pauseText.style.zIndex = '0';
    }, 500);
    pauseText.classList.add('blur-out-expand');
    // animate(lastTime);
  };

  // 技能UI
  let skillUI = document.getElementsByClassName('ui__skill')[0];
  let reverseSkills = [...game.player.skills].reverse();
  reverseSkills.forEach((skill) => {
    let skillIcon = document.createElement('span');
    skillIcon.classList.add('icon');
    skillIcon.classList.add(skill.constructor.name);
    skill.element = skillIcon;
    skillIcon.addEventListener('pointerdown', () => {
      game.player.useSkill(skills[skill.constructor.name.toUpperCase()]);
    });

    // 冷却遮罩
    let iconMark = document.createElement('span');
    iconMark.classList.add('icon__mark');
    skillIcon.appendChild(iconMark);
    skill.elementMark = iconMark;

    // 保存技能id，方便后续使用
    skillIcon.setAttribute('id', skill.constructor.name.toUpperCase());

    // 技能描述
    skillUI.appendChild(skillIcon);
    console.log('技能位置', skillUI.offsetTop, skillIcon.offsetLeft, skillIcon.offsetTop);
  });

  function drawUI() {
    let rect = canvas.getBoundingClientRect();
    // 技能UI 位置
    skillUI.style.right = rect.right - rect.width + 20 + 'px';
    skillUI.style.top = rect.top + 10 + 'px';

    // 根元素字体大小
    let htmlFontSize = getComputedStyle(window.document.documentElement)['font-size'];

    let skillMegbox = document.getElementsByClassName('skill__megbox')[0];
    let titleElement = skillMegbox.getElementsByClassName('megbox__title')[0];
    let txtElement = skillMegbox.getElementsByClassName('megbox__txt')[0];

    let leaveTimer = null;
    // 消失的延迟
    skillMegbox.addEventListener('mouseover', () => {
      clearTimeout(leaveTimer);
      fadeIn(skillMegbox);

      setTimeout(() => {
        // 溢出元素给出友好的提示框
        // 单行比较显示宽度和实际宽度，多行比较高度
        if (
          titleElement.getElementsByClassName('ellipsis')[0].scrollWidth >
          titleElement.getElementsByClassName('ellipsis')[0].clientWidth
        ) {
          titleElement.classList.add('text-container');
        }

        if (
          txtElement.getElementsByClassName('ellipsis-2')[0].scrollHeight >
          txtElement.getElementsByClassName('ellipsis-2')[0].clientHeight
        ) {
          txtElement.classList.add('text-container');
        }
      });
    });
    skillMegbox.addEventListener('mouseleave', () => {
      leaveTimer = setTimeout(() => {
        fadeOut(skillMegbox);
      }, 100);

      titleElement.classList.remove('text-container');
      txtElement.classList.remove('text-container');
    });

    // 跳过第一个提示框
    for (let i = 1; i < skillUI.children.length; i++) {
      const element = skillUI.children[i];
      element.addEventListener('mouseover', () => {
        clearTimeout(leaveTimer);
        // 在这里编写事件处理逻辑
        fadeIn(skillMegbox);

        skillMegbox.style.right =
          // 逆序
          element.offsetWidth * (skillUI.children.length - i - 1) +
          element.offsetWidth * 0.5 +
          // 加上间隔 --1rem
          parseInt(htmlFontSize) +
          'px';

        // 获取元素对应技能的属性
        let skill = game.player.skills[skills[element.id]];
        // 给元素填充技能描述
        titleElement.getElementsByClassName('ellipsis')[0].innerHTML = skill.title;
        titleElement.setAttribute('data-text', skill.title);

        txtElement.getElementsByClassName('ellipsis-2')[0].innerHTML = skill.description;
        txtElement.setAttribute('data-text', skill.description);

        skillMegbox.getElementsByClassName('icon__text--1')[0].innerHTML = skill.cd / 1000 + ':00';
        skillMegbox.getElementsByClassName('icon__text--2')[0].innerHTML =
          skill.skillDuration / 1000 + ':00';

          
      });

      element.addEventListener('mouseout', () => {
        leaveTimer = setTimeout(() => {
          fadeOut(skillMegbox);
        }, 100);
      });
    }
  }
  drawUI();
  this.window.addEventListener('resize', drawUI);
});
