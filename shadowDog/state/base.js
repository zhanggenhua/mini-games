import { GroundSplash } from '../particle.js';

// 状态机
export const states = {
  SITTING: 0,
  RUNNING: 1,
  JUMPING: 2,
  FALLING: 3,
  ROLLING: 4,
  DIVING: 5,
  HIT: 6,

  STANDING: 7,
};

export class State {
  constructor(state, game) {
    this.state = state;
    this.game = game;
  }
  enter() {} //进入状态时执行
  handleInput() {} //处理输入
  leave() {} //离开状态时执行
  // 封装原本的setState以便在前后搞事情  --装饰模式？vue的beforedestroy给我的启发
  setState(state, speed) {
    this.game.player.setState(state, speed);
    this.leave();
  }
}

// 静态状态父类
export class StaticState extends State {
  handleInput(input) {
    if (input.includes('ArrowRight')) {
      this.game.player.setState(states.RUNNING, 1);
    } else if (input.includes('ArrowLeft') ) {
      this.game.player.setState(states.RUNNING, 0);
    } else if (input.includes('ArrowUp')) {
      this.game.player.setState(states.JUMPING, 1);
    } else if (input.includes('Shift')) {
      //按键检测的耦合很严重，考虑抽取
      this.game.player.setState(states.ROLLING, 2);
    }

    // 塔塔开
    if (this.game.player.x >= this.game.width / 4 && !input.includes('ArrowDown')) {
      this.game.player.setState(states.RUNNING, 1);
    }
  }
}

// 加一级父类，抽取重复代码  --构造函数直接隐式继承
export class Jump extends State {
  // 设置时执行一次，相当于初始化
  enter() {
    // 空中控制力较弱
    this.game.player.maxSpeed = this.game.player.maxSpeed * this.game.player.airControl;
  }
  handleInput(input) {
    // 属性的修改应该独立出来
    if (!input.includes('ArrowUp') && this.game.player.jumpNumber < this.game.player.maxJumpNumber) {
      // 松开箭头 可以再次跳跃
      this.game.player.jumpSwitch = true;
    }

    if (this.game.player.onGround()) {
      console.timeEnd('弹射起步');
      for (let i = 0; i < Math.floor(Math.random() * 4 + 6); i++) {
        this.game.particles.unshift(
          new GroundSplash(
            this.game,
            this.game.player.x + this.game.player.width * 0.5,
            this.game.player.y + this.game.player.height,
          ),
        );
      }
      this.setState(states.RUNNING, 1);
    } else if (input.includes('Shift')) {
      this.setState(states.ROLLING, 2);
    } else if (input.includes('ArrowDown')) {
      this.setState(states.DIVING, 0);
    }
  }

  leave() {
    // 改回空中临时改变的速度
    this.game.player.maxSpeed = 8;
  }
}
