export class CollisionAnimation {
  constructor(game, x, y) {
    this.game = game;
    this.image = document.getElementById('collisionAnimation');
    this.spritWidth = 100;
    this.spritHeight = 90;
    this.sizeModifier = Math.random() + 0.5;
    this.width = this.sizeModifier * this.spritWidth;
    this.height = this.sizeModifier * this.spritHeight;
    // 使动画起点位置居中，所以传入的也是中间位置
    this.x = x - this.width * 0.5;
    this.y = y - this.height * 0.5;
    this.frameX = 0;
    this.maxFrame = 4;
    this.markedForDeletion = false;
    this.fps = Math.random() * 10 + 5;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
  }
  draw(context) {
    context.drawImage(
      this.image,
      // 起点
      this.frameX * this.spritWidth,
      0,
      // 图片源截取大小
      this.spritWidth,
      this.spritHeight,
      // 绘制位置和实际大小
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
  update(deltaTime) {
    this.x -= this.game.speed; //确保碰撞动画随地图移动
    if (this.frameTimer > this.frameInterval) {
      this.frameX++;
      this.frameTimer = 0;
    } else {
      this.frameTimer += deltaTime;
    }

    if (this.frameX > this.maxFrame) {
      this.markedForDeletion = true;
    }
  }
}
