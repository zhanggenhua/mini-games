import { observe } from '../utils/tool.js';

export const environment = {
  FOREST: 0,
  CITY: 1,
};
export class BackGround {
  constructor(game) {
    this.game = game;
    this.width = 1667;
    this.height = 500;
    // this.bkgMove = ''; //地图移动方向
    this.distance = 0; //记录总移动距离，用于分级
    this.environment = environment.CITY;
    // this.transition = false; //用于地图切换

    this.layerImage1 = document.getElementById('layer1'); //最后面的图层，固定
    this.layerImage2 = document.getElementById('layer2');
    this.layerImage3 = document.getElementById('layer3');
    this.layerImage4 = document.getElementById('layer4');
    this.layerImage5 = document.getElementById('layer5');
    this.layerImage6 = document.getElementById('layer6');
    this.layer1 = new Layer(this.game, this.width, this.height, 0, this.layerImage1);
    this.layer2 = new Layer(this.game, this.width, this.height, 0.2, this.layerImage2);
    this.layer3 = new Layer(this.game, this.width, this.height, 0.4, this.layerImage3);
    this.layer4 = new Layer(this.game, this.width, this.height, 0.6, this.layerImage4);
    this.layer5 = new Layer(this.game, this.width, this.height, 1, this.layerImage5); //最前面的地板
    this.layer6 = new Layer(this.game, this.width, this.height, 1, this.layerImage6); //森林
    this.init();

    observe(this, ['groundMargin'], () => {
      console.log('计算触发', Object.assign({}, this));
      this.game.player.computed();
      // this.game.enemies.forEach((enemy) => {
      //   enemy.computed();
      // });
    });
  }
  init() {
    // 替换地图资源
    switch (this.environment) {
      case environment.CITY:
        // 城市地图 --初始
        this.BackGroundLayers = [this.layer1, this.layer2, this.layer3, this.layer4, this.layer5];
        this.groundMargin = 80;//地面高度
        this.game.ui.fontFamily = 'Bangers';
        break;
      case environment.FOREST:
        // 森林地图
        this.BackGroundLayers = [this.layer1, this.layer3, this.layer6];
        this.groundMargin = 40;
        this.game.ui.fontFamily = 'Creepster';
        break;
      default:
    }
  }
  get realHeight() {
    // 用canvas的高还是地图的高, 这是一个问题
    return this.game.height - this.groundMargin;
  }
  update() {
    this.distance += this.game.speed; //统计距离
    // 切换地图
    if (this.distance >= 2 * this.width * this.game.level) {
      if (this.game.level % 2 === 0) {//简单的根据奇偶切换
        this.environment = environment.FOREST;
      } else {
        this.environment = environment.CITY;
      }
      this.game.level++;
      this.init();
      console.log('distance', this.game.background.distance, this.x, this.width);
    }
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
    // 图层移动
    if (this.x < -this.width) this.x = 0;
    else this.x -= this.game.speed * this.speedModifier;
    // 切换地图时图层移动  --背景的基础逻辑做不到
    // if (this.game.background.transition) {
    // if (this.x < -this.width * 2) {
    //   this.x = 0;
    //   this.game.background.transition = false; //移动完归零
    // } else this.x -= this.game.speed * this.speedModifier;
    // }
  }
  draw(context) {
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
    // 在图片右侧追加一张一模一样的图片实现无缝滚动
    context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
    // console.log('left', this.x, this.game.background.bkgMove);
  }
}
