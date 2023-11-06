import { Dust, Fire, Splash } from './particle.js';

// 状态机
const states = {
  SITTING: 0,
  RUNNING: 1,
  JUMPING: 2,
  FALLING: 3,
  ROLLING: 4,
  DIVING: 5,
  HIT: 6,
};
class State {
  constructor(state, game) {
    this.state = state;
    this.game = game;
  }
  enter() {} //进入状态时执行
  handleInput() {} //处理输入
  leave() {} //离开状态时执行
  // 记录上一次状态  --装饰模式？vue的beforedestroy给我的启发
  setState(state, speed, pre = this) {
    console.log('pre', this);
    this.game.player.setState(state, speed, pre);
    this.leave();
  }
}
export class Sitting extends State {
  constructor(game) {
    super('SITTING', game);
  }
  enter() {
    this.game.player.frameX = 0;
    this.game.player.frameY = 5;
    this.game.player.maxFrame = 4;
  }
  handleInput(input) {
    if (input.includes('ArrowLeft') || input.includes('ArrowRight')) {
      this.game.player.setState(states.RUNNING, 1);
    } else if (input.includes('Enter')) {
      this.game.player.setState(states.ROLLING, 2);
    }
  }
}
export class Running extends State {
  constructor(game) {
    super('RUNNING', game);
  }
  enter() {
    this.game.player.frameX = 0;
    this.game.player.frameY = 3;
    this.game.player.maxFrame = 8;
  }
  handleInput(input) {
    this.game.particles.unshift(
      new Dust(
        this.game,
        this.game.player.x + this.game.player.width * 0.5,
        this.game.player.y + this.game.player.height,
      ),
    );
    if (input.includes('ArrowDown')) {
      this.game.player.setState(states.SITTING, 0);
    } else if (input.includes('ArrowUp')) {
      this.game.player.setState(states.JUMPING, 1);
    } else if (input.includes('Enter')) {
      this.game.player.setState(states.ROLLING, 2);
    }
  }
}

export class Jumping extends State {
  constructor(game) {
    super('JUMPING', game);
  }
  // 设置时执行一次，相当于初始化
  enter() {
    // 空中控制力较弱
    this.game.player.maxSpeed = this.game.player.maxSpeed * this.game.player.airControl;

    this.game.player.jumpNumber++; //记录二段跳
    console.log(
      '是否二段跳? ',
      this.game.player.jumpSwitch,
      '在地上? ',
      this.game.player.onGround(),
      '二段跳次数? ',
      this.game.player.jumpNumber,
    );
    if (this.game.player.onGround() || this.game.player.canJump) {
      console.time('弹射起步');
      // 根据高度设置跳跃起始速度
      this.game.player.vy = this.game.player.maxJumpSpeed;
      this.game.player.jumpSwitch = false;
    }

    this.game.player.frameX = 0;
    this.game.player.frameY = 1;
    this.game.player.maxFrame = 6;
  }
  handleInput(input) {
    if (this.game.player.onGround()) {
      console.timeEnd('弹射起步');
      this.setState(states.RUNNING, 1);
    } else if (this.game.player.vy > 0.1) {
      //直接根据抵达顶点来判断
      this.setState(states.FALLING, 1);
      // 通过比较当前高度和上一帧的高度 来判断是否下落中
      // !this.game.player.onGround() && this.game.player.y > this.lastY
    } else if (!input.includes('ArrowUp')) {
      // 松开箭头 可以再次跳跃
      this.game.player.jumpSwitch = true;
      // 设置最小跳跃高度  --手感怪怪的
      // if (this.game.player.jumpNumber > 1) {
      //   //注意设置时就加一了
      //   // 二段跳直接为 0  --继续优化，只有小于最小高度才使用最小高度
      //   this.game.player.vy = 0;
      // } else {
      //   // 如果大于最小速度，说明已经走完了最小高度
      //   if (this.game.player.vy < this.game.player.minJumpSpeed) {
      //     console.log('当前速度', this.game.player.vy);
      //     this.game.player.vy = this.game.player.minJumpSpeed;
      //     console.log('设置最小速度', this.game.player.vy);
      //   }
      // }
      // 松开加大重力（长按低重力上升），模拟按得越久跳的越高 --似乎没有这么简单
      // this.game.player.g = 1.5;
    } else if (input.includes('Enter')) {
      this.setState(states.ROLLING, 2);
    } else if (input.includes('ArrowDown')) {
      this.setState(states.DIVING, 0);
    }
    // this.lastY = this.game.player.y; //记录上一帧高度
  }

  leave() {
    console.log('leave', this.game.player.maxSpeed);
  }
}
// 下落
export class Falling extends State {
  constructor(game) {
    super('FALLING', game);
  }
  enter() {
    this.game.player.frameX = 0;
    this.game.player.frameY = 2;
    this.game.player.maxFrame = 6;
  }
  handleInput(input) {
    if (this.game.player.onGround()) {
      this.game.player.setState(states.RUNNING, 1);
    } else if (input.includes('ArrowUp') && this.game.player.canJump()) {
      // 二段跳
      this.game.player.setState(states.JUMPING, 1);
    } else if (!input.includes('ArrowUp')) {
      // 松开箭头 可以再次跳跃
      this.game.player.jumpSwitch = true;
    } else if (input.includes('ArrowDown')) {
      this.game.player.setState(states.DIVING, 0);
    }
  }
}
export class Rolling extends State {
  constructor(game) {
    super('ROLLING', game);
  }
  enter() {
    this.game.player.frameX = 0;
    this.game.player.frameY = 6;
    this.game.player.maxFrame = 6;
  }
  handleInput(input) {
    this.game.particles.unshift(
      new Fire(
        this.game,
        this.game.player.x + this.game.player.width * 0.5,
        this.game.player.y + this.game.player.height * 0.5,
      ),
    );
    if (!input.includes('Enter') && this.game.player.onGround()) {
      this.game.player.setState(states.RUNNING, 1);
    } else if (!input.includes('Enter') && !this.game.player.onGround()) {
      this.game.player.setState(states.FALLING, 1);
    } else if (
      input.includes('Enter') &&
      input.includes('ArrowUp') &&
      this.game.player.onGround()
    ) {
      this.game.player.vy -= 27;
    } else if (input.includes('ArrowDown') && !this.game.player.onGround()) {
      this.game.player.setState(states.DIVING, 0);
    }
  }
}
export class Diving extends State {
  constructor(game) {
    super('Diving', game);
  }
  enter() {
    this.game.player.frameX = 0;
    this.game.player.frameY = 6;
    this.game.player.maxFrame = 6;
    this.game.player.vy = 15;
  }
  handleInput(input) {
    this.game.particles.unshift(
      new Fire(
        this.game,
        this.game.player.x + this.game.player.width * 0.5,
        this.game.player.y + this.game.player.height * 0.5,
      ),
    );
    if (this.game.player.onGround()) {
      this.game.player.setState(states.RUNNING, 1);
      for (let i = 0; i < 30; i++) {
        this.game.particles.unshift(
          new Splash(
            this.game,
            this.game.player.x + this.game.player.width * 0.5,
            this.game.player.y + this.game.player.height,
          ),
        );
      }
    } else if (input.includes('Enter') && this.game.player.onGround()) {
      this.game.player.setState(states.ROLLING, 2);
    }
  }
}
export class Hit extends State {
  constructor(game) {
    super('Hit', game);
  }
  enter() {
    this.game.player.frameX = 0;
    this.game.player.frameY = 4;
    this.game.player.maxFrame = 10;
  }
  handleInput(input) {
    if (this.game.player.frameX >= 10 && this.game.player.onGround()) {
      this.game.player.setState(states.RUNNING, 1);
    } else if (this.game.player.frameX >= 10 && !this.game.player.onGround()) {
      this.game.player.setState(states.FALLING, 1);
    }
  }
}