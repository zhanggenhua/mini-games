
import { throttle } from '../utils/tool.js';
export class InputHandler {
  constructor(game) {
    this.game = game;
    this.keys = [];
    this.touchY = '';
    this.touchX = '';
    this.timer = null;
    this.touchKey = '';
    this.touchThreshold = 30; //滑动阈值,超过30触发滑动

    window.addEventListener('keydown', (e) => {
      this.keyHandler(e.key, (key) => {
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
      this.keyHandler(e.key, (key) => {
        this.keys.splice(this.keys.indexOf(key), 1);
      });
    });

    // 移动端适配
    window.addEventListener('touchstart', (e) => {
      this.touchY = e.changedTouches[0].pageY;
      this.touchX = e.changedTouches[0].pageX;
      this.timer = setTimeout(() => {
        // 长按操作
        if (this.keys.indexOf('Shift') === -1) this.keys.push('Shift');
      }, 1000); // 设置长按时间，单位为毫秒
    });

    window.addEventListener('touchmove', (e) => {
      const swipeDistanceY = e.changedTouches[0].pageY - this.touchY;
      if (swipeDistanceY < -this.touchThreshold && this.keys.indexOf('ArrowUp') === -1)
        this.keys.push('ArrowUp');
      else if (swipeDistanceY > this.touchThreshold && this.keys.indexOf('ArrowDown') === -1) {
        this.keys.push('ArrowDown');
      }

      const swipeDistanceX = e.changedTouches[0].pageX - this.touchX;
      if (swipeDistanceX < -this.touchThreshold && this.keys.indexOf('ArrowLeft') === -1)
        this.keys.push('ArrowLeft');
      else if (swipeDistanceX > this.touchThreshold && this.keys.indexOf('ArrowRight') === -1)
        this.keys.push('ArrowRight');

      if (
        Math.abs(swipeDistanceY) > this.touchThreshold ||
        Math.abs(swipeDistanceX) > this.touchThreshold
      ) {
        clearTimeout(this.timer);
      }
    });
    window.addEventListener('touchend', (e) => {
      this.keys = [];
      clearTimeout(this.timer);
    });
  }

  /**
   * 处理键盘事件
   * @param {*} e 键盘监听事件
   * @param {*} fn 对按键处理结果的处理
   */
  keyHandler(realKey, fn) {
    let key = this.keyMap(realKey);
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
