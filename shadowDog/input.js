export class InputHandler {
  constructor(game) {
    this.game = game;
    this.keys = [];

    window.addEventListener('keydown', (e) => {
      this.keyHandler(e, (key) => {
        // 按键只记录一次
        if (this.keys.indexOf(key) === -1) {
          this.keys.push(key);
        }
      });
      console.log('按下', e.key, this.keys);
      if (e.key === 'q') {
        this.game.debug = !this.game.debug;
      }
      // 打开菜单
      // if (e.key === 'Escape') {
      //   this.game.paused = !this.game.paused;
      // }
    });
    window.addEventListener('keyup', (e) => {
      this.keyHandler(e, (key) => {
        this.keys.splice(this.keys.indexOf(key), 1);
      });
    });
  }

  /**
   * 处理键盘事件
   * @param {*} e 键盘监听事件
   * @param {*} fn 对按键处理结果的处理
   */
  keyHandler(e, fn) {
    let key = this.keyMap(e.key);
    if (
      key === 'ArrowDown' ||
      key === 'ArrowUp' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'Shift' || // 翻滚
      key === 'Enter'
    ) {
      fn(key);
    }
  }

  // 按键映射，wasd也有和上下左右一样的效果 --如果要提供可配置，可以抽取作为常量
  keyMap(key) {
    switch (key) {
      case 'a':
      case 'A':
        return 'ArrowLeft';
      case 'd':
      case 'D':
        return 'ArrowRight';
      case 'w':
      case 'W':
        return 'ArrowUp';
      case 's':
      case 'S':
        return 'ArrowDown';
      case ' ':
        return 'ArrowUp';
      default:
        return key;
    }
  }
}
