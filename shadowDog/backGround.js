// 图层类
class Layer {
  constructor(game, width, height, speedModifier, image) {
    this.game = game;
    this.width = width;
    this.height = height;
    // 速度修正 让不同背景图层有不同速度
    this.speedModifier = speedModifier;
    this.image = image;
    this.x = 0;
    this.y = 0;
  }
  update() {
    if (!this.game.player.bkgMove) return;

    if (!this.game.background.transition) {
      // 图层移动
      if (this.x < -this.width) this.x = 0;
      else this.x -= this.game.speed * this.speedModifier;
    } else {
      // 切换地图时图层移动  --背景的基础逻辑做不到
      // if (this.x < -this.width * 2) {
      //   this.x = 0;
      //   this.game.background.transition = false; //移动完归零
      // } else this.x -= this.game.speed * this.speedModifier;
    }

    this.game.background.distance += this.game.speed; //统计距离
    // 下一张地图 --应该只进一次，并且拼接下一张地图在后面
    if (this.game.background.distance >= this.width * 2 * this.game.level) {
      console.log('distance', this.game.background.distance, this.x, this.width);

      this.game.level++;
      this.game.background.init();
      // this.game.background.distance = 0;

      // this.game.background.transition = true;
    }
  }
  draw(context) {
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
    // 在图片右侧追加一张一模一样的图片实现无缝滚动
    context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
  }
}
export class BackGround {
  constructor(game) {
    this.game = game;
    this.width = 1667;
    this.height = 500;
    this.distance = 0; //记录总移动距离，用于分级
    this.transition = false; //用于地图切换
    this.init();
  }
  init() {
    console.log('level', this.game.level, this.game);
    if (this.game.level > 1) {
      // 森林地图
      this.layerImage1 = document.getElementById('layer1'); //最后面的图层，固定
      this.layerImage3 = document.getElementById('layer3');
      this.layerImage4 = document.getElementById('layer6');
      this.layerImage5 = document.getElementById('layer5');
      this.layer1 = new Layer(this.game, this.width, this.height, 0, this.layerImage1);
      this.layer3 = new Layer(this.game, this.width, this.height, 0.4, this.layerImage3);
      this.layer4 = new Layer(this.game, this.width, this.height, 0.6, this.layerImage4);
      this.layer5 = new Layer(this.game, this.width, this.height, 3, this.layerImage5);
      this.BackGroundLayers = [this.layer1, this.layer3, this.layer4, this.layer5];
    } else {
      // 城市地图 --初始
      this.layerImage1 = document.getElementById('layer1');
      this.layerImage2 = document.getElementById('layer2');
      this.layerImage3 = document.getElementById('layer3');
      this.layerImage4 = document.getElementById('layer4');
      this.layerImage5 = document.getElementById('layer5');
      this.layer1 = new Layer(this.game, this.width, this.height, 0, this.layerImage1);
      this.layer2 = new Layer(this.game, this.width, this.height, 0.2, this.layerImage2);
      this.layer3 = new Layer(this.game, this.width, this.height, 0.4, this.layerImage3);
      this.layer4 = new Layer(this.game, this.width, this.height, 0.6, this.layerImage4);
      this.layer5 = new Layer(this.game, this.width, this.height, 3, this.layerImage5);
      this.BackGroundLayers = [this.layer1, this.layer2, this.layer3, this.layer4, this.layer5];
    }
  }
  update() {
    this.BackGroundLayers.forEach((layer) => {
      layer.update();
    });
  }
  draw(context) {
    this.BackGroundLayers.forEach((layer) => {
      layer.draw(context);
    });
  }
}
