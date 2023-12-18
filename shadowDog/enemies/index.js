// 统一的导出  --相当于原封不动搬过来
import Fly from './fly/Fly.js';
import Bat from './fly/Bat.js';
import { BigBat } from './fly/Bat.js';
import Swim from './fly/Swim.js';
import Crow from './fly/Crow.js';
import Ghost from './fly/Ghost.js';
import Saw from './Saw.js';
import { SawGround } from './Saw.js';
import Plant from './Plant.js';
import Worm from './worm.js';
import Spider from './Spider.js';
import BigSpider from './BigSpider.js';

import { environment } from '../backGround.js';
import MyError from '../error.js';
class EnemyFactory {
  constructor(game) {
    this.game = game;
    // 预定义的敌人组 --怪物等级从低到高
    this.enemyConfig = {
      [environment.CITY]: {
        flyEnemy: [Bat, Fly, Saw, Crow],
        groundEnemy: [Plant, SawGround],
        climbingEnemy: [Spider],
      },
      [environment.FOREST]: {
        flyEnemy: [BigBat, Swim, Ghost, Crow],
        groundEnemy: [Worm, Plant],
        climbingEnemy: [BigSpider],
      },
    };
    this.computed();
  }
  computed() {
    // 根据当前环境设置敌人
    const currentEnemyConfig = this.enemyConfig[this.game.background.environment];

    this.flyEnemy = currentEnemyConfig.flyEnemy;
    this.groundEnemy = currentEnemyConfig.groundEnemy;
    this.climbingEnemy = currentEnemyConfig.climbingEnemy;

    // 根据不同等级的调整
    // if (this.game.level < 5) {
    //   this.flyEnemy = this.flyEnemy.slice(0, 1);
    // }
  }
  createFlyEnemy() {
    // 随机生成一批敌人
    let enemy = this.getRandomEnemy(this.flyEnemy);
    let enemyArr = [];
    // 根据产卵率生成一批敌人
    let eggs = Math.floor(Math.random() * enemy.egg + 1); //1-->egg
    console.log('产卵', enemy, enemy.egg, eggs);
    for (let i = 0; i < eggs; i++) {
      enemyArr.push(new enemy(this.game));
    }
    return enemyArr;
  }
  createGroundEnemy() {
    let enemy = this.getRandomEnemy(this.groundEnemy);
    return new enemy(this.game);
  }
  createClimbingEnemy() {
    let enemy = this.getRandomEnemy(this.climbingEnemy);
    return new enemy(this.game);
  }

  // 根据分数获取随机敌人，越到后期高分敌人越多才对
  getRandomEnemy(enemies) {
    let totalScore = 0; // 计算总分数
    enemies.forEach((enemy) => {
      totalScore += enemy.score;
    });

    const randomScore = Math.random() * totalScore; // 0-totalScore
    // Math.floor(Math.random() * (totalScore + 1))  ;// 0-totalScore

    let cumulativeScore = 0; // 用一个累积的数模拟区间
    for (let i = 0; i < enemies.length; i++) {
      cumulativeScore += enemies[i].score;
      if (randomScore < cumulativeScore) {
        return enemies[i]; //此处才实例化
      }
    }

    throw new MyError('获取随机敌人失败', enemies);
  }
}

// 疑惑：有继承就用不了default
export default EnemyFactory;
