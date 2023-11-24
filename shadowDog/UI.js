import { observe } from '../utils/tool.js';
export class UI {
  constructor(game) {
    this.game = game;
    this.fontSize = 28;
    this.fontFamily = 'Bangers';
    this.liveImage = document.getElementById('lives');
  }
  draw(context) {
    // 字体加载完成再执行代码
    document.fonts.ready.then(() => {
      context.save();
      // 绘制文本阴影
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = 'white';
      context.shadowBlur = 0;
      context.font = this.fontSize + 'px ' + this.fontFamily;
      context.textAlign = 'left';
      context.fillStyle = this.game.fontColor;
      // 分数绘制
      context.fillText('Score: ' + this.game.score, 20, 50);
      // 生命值绘制
      for (let i = 0; i < this.game.lives; i++) {
        context.drawImage(this.liveImage, 25 * i + 20, 60, 25, 25);
      }
      // 时间绘制
      context.font = this.fontSize * 0.8 + 'px ' + this.fontFamily;
      context.fillText('Time: ' + (this.game.time * 0.001).toFixed(1), 25, 120);
      // 当前游戏等级
      context.font = this.fontSize * 0.8 + 'px ' + this.fontFamily;
      context.fillText('LEVEL: ' + this.game.level, 25, 140);
      context.fillText('DISTANCE: ' + this.game.background.distance, 25, 160);
      // 游戏结束看板
      if (this.game.gameOver) {
        context.textAlign = 'center';
        context.font = this.fontSize * 2 + 'px ' + this.fontFamily;
        let text;
        if (this.game.score >= this.game.winningScore) {
          text = 'you win!';
        } else {
          text = 'GAME OVER!';
        }
        let text2 = 'your score is :' + this.game.score;
        context.fillText(text, this.game.width * 0.5, this.game.height * 0.5 - 20);
        context.font = this.fontSize * 0.7 + 'px ' + this.fontFamily;
        context.fillText(text2, this.game.width * 0.5, this.game.height * 0.5 + 20);
      }
      context.restore();
    });
  }
}
