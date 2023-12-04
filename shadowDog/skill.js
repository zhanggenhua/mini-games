import { SpiritBomb } from './particle.js';

export const skills = { FEATHERFALL: 0 };

class Skill {
  constructor(game) {
    this.game = game;
    this.cdOk = true;
    this.killCurrentDuration = 0; //当前持续时间

    this.cd = 0;
    this.skillDuration = 0; //持续时间
    this.descriptionTitle = '技能';
    this.description = '暂无描述';
  }

  use() {
    this.cdOk = false;
    setTimeout(() => {
      this.cdOk = true;
    }, this.skillDuration);
  }
  end() {
    this.killCurrentDuration = 0;
  }
  update(deltaTime) {
    if (this.killCurrentDuration >= this.skillDuration) {
      this.end();
    } else {
      this.killCurrentDuration += deltaTime;
    }
  }
}

// 羽落术
export class FeatherFall extends Skill {
  constructor(game) {
    super(game);
    this.cd = 5000;
    this.skillDuration = 3000; //持续时间
    this.descriptionTitle = '技能';
    this.description = '暂无描述';
  }
  use() {
    super.use();
    this.game.player.buff.push(skills.FEATHERFALL)
  }
  end() {
    super.end();
    this.game.player.buff.splice(this.game.player.buff.indexOf(skills.FEATHERFALL), 1)
  }
}
