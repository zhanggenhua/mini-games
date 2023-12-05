import { SpiritBomb } from './particle.js';
import { FloatingMessage } from './floatingMessages.js';
import { checkCollision } from '../utils/tool.js';
import { CollisionAnimation } from './collisionAnimation.js';

export const skills = { FEATHERFALL: 0, SPIRITBOMBSKILL: 1 };

class Skill {
  constructor(game) {
    this.game = game;
    this.cdOk = true;
    this.skillCurrentDuration = 0; //当前持续时间
    this.element = null;
    this.elementMark = null;

    this.cd = 0;
    this.skillDuration = 0; //持续时间
    this.title = '技能';
    this.description = '暂无描述';
  }

  computedCd() {
    this.elementMark.style.height = '0';
    this.elementMark.style.transition = `height ${this.cd / 1000}s linear`;
    setTimeout(() => {
      this.elementMark.style.height = '100%';
    });
    // 技能冷却进度
    setTimeout(() => {
      this.cdOk = true;
      this.end();

      // 初始化
      this.elementMark.style.height = '0';
      this.elementMark.style.transition = '';
    }, this.cd);
  }
  use() {
    this.cdOk = false;
    if (this.skillDuration === 0) {
      this.computedCd();
    }
  }
  // 效果结束
  end() {
    // 从冷却数组移除
    this.game.player.cdSkill.splice(this.game.player.cdSkill.indexOf(this), 1);
    // 初始化
    this.skillCurrentDuration = 0;
  }
  update(deltaTime) {
    // 先计算持续时间
    if (this.skillDuration !== 0) {
      this.elementMark.style.height = `${
        100 - (this.skillCurrentDuration / this.skillDuration) * 100
      }%`;
      if (this.skillCurrentDuration >= this.skillDuration) {
        this.end();
        this.computedCd();
      } else {
        this.skillCurrentDuration += deltaTime;
      }
    } else {
    }
  }
  draw() {}

  // 振动
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
    this.cd = 5000;
    this.skillDuration = 3000; //持续时间
    this.title = '羽落术';
    this.description = '源于DND中的法术';
  }
  use() {
    super.use();
    this.game.player.buff.push(skills.FEATHERFALL);
  }
  end() {
    super.end();
    this.game.player.buff.splice(this.game.player.buff.indexOf(skills.FEATHERFALL), 1);
  }
}

// 元气弹
export class SpiritBombSkill extends Skill {
  constructor(game) {
    super(game);
    this.cd = 1000;
    this.title = '元气弹';
    this.description = '对乌鸦专用追踪弹';
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
