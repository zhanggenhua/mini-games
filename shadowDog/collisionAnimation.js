export class CollisionAnimation {
  constructor(game, x, y, width, height) {
    this.game = game;
    this.image = document.getElementById('collisionAnimation');
    this.spritWidth = 100;
    this.spritHeight = 90;
    this.sizeModifier = Math.random() + 0.5;
    this.width = this.sizeModifier * width;
    this.height = this.sizeModifier * height;
    // 使动画起点位置居中，所以传入的也是中间位置
    this.x = x - this.width * 0.5;
    this.y = y - this.height * 0.5;
    this.frameX = 0;
    this.maxFrame = 4;
    this.markedForDeletion = false;
    this.fps = Math.random() * 10 + 5;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;

    // this.angel = Math.random() * 6.2;
    this.sound = new Audio();
    this.sound.src = '../assets/shadow/sound/cloud/Ice attack 2.wav';
  }
  draw(context) {
    context.save();
    //爆炸云随机的旋转
    // context.translate(this.x, this.y); //不加会歪的
    // context.rotate(this.angel);
    context.drawImage(
      this.image,
      // 起点
      this.frameX * this.spritWidth,
      0,
      // 图片源截取大小
      this.spritWidth,
      this.spritHeight,
      // 绘制位置和实际大小
      this.x, //调整动画出现位置和鼠标点击位置不一致的现象
      this.y, 
      this.width,
      this.height,
    );
    context.restore();
  }
  update(deltaTime) {
    this.x -= this.game.speed; //确保碰撞动画随地图移动
    if (this.frameTimer > this.frameInterval) {
      if (this.frameX === 0) this.sound.play();
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
