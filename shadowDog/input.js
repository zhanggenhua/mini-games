export class InputHandler {
  constructor(game) {
    this.game = game;
    this.keys = [];
    window.addEventListener('keydown', (e) => {
      let key = this.keyMap(e.key);
      if (
        (key === 'ArrowDown' ||
          key === 'ArrowUp' ||
          key === 'ArrowLeft' ||
          key === 'ArrowRight' ||
          key === 'Enter') &&
        this.keys.indexOf(key) === -1
      ) {
        console.log('按下', key);
        this.keys.push(key);
      } else if (key === 'q') {
        this.game.debug = !this.game.debug;
      }
    });
    window.addEventListener('keyup', (e) => {
      let key = this.keyMap(e.key);
      if (
        key === 'ArrowDown' ||
        key === 'ArrowUp' ||
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        key === 'Enter'
      ) {
        this.keys.splice(this.keys.indexOf(key), 1);
      }
    });
  }
  // 按键映射，wasd也有和上下左右一样的效果 --如果要提供可配置，可以抽取作为常量
  keyMap(key) {
    switch (key) {
      case 'a':
        return 'ArrowLeft';
      case 'd':
        return 'ArrowRight';
      case 'w':
        return 'ArrowUp';
      case 's':
        return 'ArrowDown';
      case ' ':
        return 'ArrowUp';
      default:
        return key;
    }
  }
}
