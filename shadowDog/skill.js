import { SpiritBomb, Shadow, FirePillar, Rainbow } from './particle.js';
import { FloatingMessage } from './floatingMessages.js';
import { checkCollision } from '../utils/tool.js';
import { CollisionAnimation } from './collisionAnimation.js';
import { playerParams} from './player.js';

import { states } from './state/base.js';

export const skills = {
  SPIRITBOMBSKILL: 0,
  FEATHERFALL: 1,
  ROLLSKILL: 2,
  SPRINTSKILL: 3,
  FIREPILLARSKILL: 4,
  RAINBOWSKILL: 5,
  GIANT: 6,
  // BULLETTIMESKILL: 6,
};

class Skill {
  constructor(game) {
    this.game = game;
    this.cdOk = true;
    this.element = null;
    this.elementMark = null;
    this.actived = false; //激活状态，用于取消激活直接进入冷却
    this.activeTime = null;
    // this.skillCurrentDuration = 0; //当前持续时间
    this.isBuff = false;

    this.cd = 0;
    this.skillDuration = 0; //持续时间
    this.title = '技能';
    this.description = '暂无描述';
  }

  computedCd() {
    // 自上而下的动画
    this.elementMark.style.height = '0';
    setTimeout(() => {
      this.elementMark.style.transition = `height ${this.cd / 1000}s linear`;
      this.elementMark.style.height = '100%';
    }, 10);
    // 技能冷却进度
    setTimeout(() => {
      this.cdOk = true;

      // 初始化
      this.animalEnd();
    }, this.cd);
  }
  use() {
    this.cdOk = false;
    if (this.skillDuration === 0) {
      // 顺发技能直接走冷却
      this.computedCd();
    } else {
      this.active();
    }
  }
  // 技能效果结束
  end() {}
  // 冷却动画结束
  animalEnd() {
    // 初始化
    this.elementMark.style.transition = '';
    this.elementMark.style.height = '0';
    // 从激活数组移除
    // this.game.player.activeSkill.splice(this.game.player.activeSkill.indexOf(this), 1);
    // 初始化
    // this.skillCurrentDuration = 0;
  }
  active() {
    console.log('激活技能');
    // 维护一个激活的状态，在相应地方进行判断
    this.actived = true;

    // 自下而上，和冷却动画反过来做区分
    this.elementMark.style.height = '100%';

    if (this.isBuff) return; //buff除非自己按下，否则不会结束

    // 很神奇的bug，一直按按键，就会导致上面代码应用前就执行了下面的修改，所以给浏览器渲染引擎一些时间来应用更改
    setTimeout(() => {
      this.elementMark.style.transition = `height ${this.skillDuration / 1000}s linear`;
      this.elementMark.style.height = '0';
    }, 10);
    // 先计算持续时间
    this.activeTime = setTimeout(() => {
      console.log('技能结束');
      this.activeEnd();
    }, this.skillDuration);
    // 实时更新动画
    // this.elementMark.style.height = `${
    //   100 - (this.skillCurrentDuration / this.skillDuration) * 100
    // }%`;
  }
  activeEnd() {
    this.actived = false;
    this.end();
    clearTimeout(this.activeTime);
    this.animalEnd();

    this.computedCd();
  }

  // 摇头
  headShake() {
    this.element.classList.remove('shake-horizontal');
    // 必须要异步
    setTimeout(() => {
      this.element.classList.add('shake-horizontal');
    });
  }
}

// 羽落术
export class FeatherFall extends Skill {
  constructor(game) {
    super(game);
    this.cd = 3000;
    this.skillDuration = 5000; //持续时间
    this.title = '羽落术';
    this.description = '源于DND中的法术';

    this.icon = '../assets/shadow/svg/feather.svg';
  }
  use() {
    super.use();
    // 羽落术在下落时才生效
    this.game.player.states[states.FALLING].preEnter = () => {
      this.game.player.airResistance = 0.2;
    };
  }
  end() {
    super.end();
    this.game.player.states[states.FALLING].preEnter = () => {};
  }
}

// 元气弹
export class SpiritBombSkill extends Skill {
  constructor(game) {
    super(game);
    this.cd = 1000;
    this.title = '元气弹';
    this.description = '对乌鸦专用追踪弹';
    this.icon = '../assets/shadow/svg/circle.svg';
  }
  use([enemy]) {
    if (!enemy) {
      this.headShake();
      return;
    }
    super.use();
    // 在口部生成元气弹
    let bomb = new SpiritBomb(
      this.game,
      this.game.player.x + game.player.width,
      this.game.player.y + 50,
      enemy,
    );
    this.game.particles.unshift(bomb);

    // 碰撞后击杀乌鸦
    let time = setInterval(() => {
      let delay = 0; // 防止定时器没有销毁
      if (checkCollision(enemy, bomb)) {
        clearInterval(time);
        time = null;
        bomb.markedForDeletion = true;
        enemy.markedForDeletion = true;
        game.score += enemy.score;
        game.collisions.push(
          new CollisionAnimation(
            game,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5,
            enemy.width,
            enemy.height,
          ),
        );
        game.floatingMessages.push(
          new FloatingMessage(game, enemy.score, enemy.x, enemy.y, 150, 50),
        );
      } else {
        delay += 100;
      }
      if (delay > 10000) {
        clearInterval(time);
        time = null;
        bomb.markedForDeletion = true;
      }
    }, 100);
  }
}

// 翻滚
export class RollSkill extends Skill {
  constructor(game) {
    super(game);
    this.cd = 5000;
    this.skillDuration = 3000; //持续时间
    this.title = '无敌风火轮';
    this.description = '大开杀戒！';

    this.icon = '../assets/shadow/svg/rolling-energy.svg';
  }
  use() {
    super.use();
    // 模拟按下shift
    this.game.input.keys.push('Shift');
    this.game.player.setState(states.ROLLING, 2);
  }
  end() {
    super.end();

    this.game.input.keys.splice(this.game.input.keys.indexOf('Shift'), 1);

    if (this.game.player.onGround()) {
      this.game.player.setState(states.RUNNING, 1);
    } else if (!this.game.player.onGround()) {
      this.game.player.setState(states.FALLING, 1);
    }
  }
}

// 幻影冲刺
export class SprintSkill extends Skill {
  constructor(game) {
    super(game);
    this.cd = 1000;
    this.skillDuration = '∞'; //持续时间
    this.title = '幻影冲刺';
    this.description = '更快的速度，更猛的怪物';
    this.isBuff = true; //是buff，不计算激活

    this.icon = '../assets/shadow/svg/sprint.svg';
  }
  use() {
    super.use();
    this.game.particles.unshift(new Shadow(this.game, this.game.player));

    // 地图和玩家的速度都翻倍
    this.game.player.setState(states.RUNNING, this.game.speed * 2);
    this.game.player.states[states.RUNNING].preEnter = () => {
      this.game.speed = 2;
    };

    this.game.player.maxSpeed *= 2;
  }
  end() {
    super.end();
    if (this.game.player.currentState === this.game.player.states[states.RUNNING]) {
      this.game.speed = 1;
    }
    this.game.player.states[states.RUNNING].preEnter = () => {};

    this.game.player.maxSpeed = playerParams.MAXSPEED;
  }
}

// 火柱
export class FirePillarSkill extends Skill {
  constructor(game) {
    super(game);
    this.cd = 6000;
    this.skillDuration = 4000; //持续时间
    this.title = '火柱';
    this.description = '注意硬直';

    this.icon = '../assets/shadow/svg/fire-ray.svg';
  }
  use() {
    super.use();
    this.game.particles.unshift(new FirePillar(this.game, this.game.player));

    // 设置角色站立，禁止切换状态
    this.game.player.setState(states.STANDING, 0);
    this.fn = this.game.player.states[states.STANDING].setState; //保存方法以便恢复
    this.game.player.states[states.STANDING].setState = () => {};

    this.game.player.maxSpeed = 0;
    this.game.player.g = 0;
    this.game.player.vy = 0;
  }
  end() {
    super.end();

    this.game.player.states[states.STANDING].setState = this.fn;
    this.game.player.maxSpeed = playerParams.MAXSPEED;
    this.game.player.g = playerParams.G;
  }
}

// 彩虹尾气
export class RainbowSkill extends Skill {
  constructor(game) {
    super(game);
    this.cd = 10000;
    this.skillDuration = 5000; //持续时间
    this.title = '喷射战士';
    this.description = '噗————————';

    this.icon = '../assets/shadow/svg/rainbow-star.svg';
  }
  use() {
    super.use();
    this.game.particles.unshift(new Rainbow(this.game, this.game.player.x, this.game.player.y));

    // 设置角色站立，禁止切换状态
    this.game.player.setState(states.STANDING, 10);
    this.fn = this.game.player.states[states.STANDING].setState; //保存方法以便恢复
    this.game.player.states[states.STANDING].setState = () => {};

    this.game.player.maxSpeed = 0;
    this.game.player.g = 0;
    this.game.player.vy = 0;
  }
  end() {
    super.end();
    this.game.floatingMessages.push(
      new FloatingMessage(
        this.game,
        '虚弱',
        this.game.player.x,
        this.game.player.y,
        this.game.player.x,
        this.game.player.y - 30,
        50,
      ),
    );
    
    this.game.player.states[states.STANDING].setState = this.fn;
    this.game.player.setState(states.RUNNING, 1);
    this.game.player.maxSpeed = playerParams.MAXSPEED;
    this.game.player.g = playerParams.G;

    this.game.player.setBuff('slow', 2000); //模拟虚弱
  }
}

// 子弹时间 --耦合太深，放弃
export class BulletTimeSkill extends Skill {
  constructor(game) {
    super(game);
    this.cd = 1000;
    this.skillDuration = 5000; //持续时间
    this.title = '子弹时间';
    this.description = '一切都慢下来';

    this.icon = '../assets/shadow/svg/astrolabe.svg';
  }
  use() {
    super.use();
    this.game.speed = 0.01;
    this.game.afterSetState = function () {
      this.game.speed = 0.01;
    };
  }
  end() {
    super.end();
    this.game.speed == 0.01 && (this.game.speed = 1);
    this.game.afterSetState = () => {};
  }
}

// 法相天地
export class Giant extends Skill {
  constructor(game) {
    super(game);
    this.cd = 8000;
    this.skillDuration = 6000; //持续时间
    this.title = '法相天地';
    this.description = '源自西游记的法术';

    this.icon = '../assets/shadow/svg/giant.svg';

    this.frame = 0;
  }
  use() {
    super.use();
    this.oldWidth = this.game.player.width;
    this.oldHeight = this.game.player.height;
    this.targetWidth = this.game.player.width * 3;
    this.targetHeight = this.game.player.height * 3;
    this.animateSize();
  }
  end() {
    super.end();

    this.targetWidth = this.oldWidth;
    this.targetHeight = this.oldHeight;
    this.animateSize();
  }
  animateSize() {
    if (
      Math.round(this.game.player.width) == Math.round(this.targetWidth) &&
      Math.round(this.game.player.height) == Math.round(this.targetHeight)
    ) {
      return;
    }

    this.game.player.width += (this.targetWidth - this.game.player.width) * 0.01;
    this.game.player.height += (this.targetHeight - this.game.player.height) * 0.01;
    setTimeout(() => {
      this.animateSize();
    }, 10);
  }
}
