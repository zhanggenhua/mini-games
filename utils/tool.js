export const checkCollision = (enemy, player) => {
  // 矩形碰撞检测 --判断四条线，怪的x左轴小于玩家的x右轴，怪的x右轴大于玩家的x左轴，怪的y上轴小于玩家的y下轴，怪的y下轴大于玩家的y上轴。即可视为怪矩形的点在玩家矩形内部
  if (
    enemy.x < player.x + player.width &&
    enemy.x + enemy.width > player.x &&
    enemy.y < player.y + player.height &&
    enemy.y + enemy.height > player.y
  ) {
    return true;
  } else {
    return false;
  }
};

// 监听属性 --从而无需在其他地方调用computed，单一职责
export const observe = (obj, keys, callback) => {
  keys.forEach((key) => {
    // 必须要有value和get
    let value;
    Object.defineProperty(obj, key, {
      get() {
        return value;
      },
      set(newValue) {
        console.log(`修改属性：${key}`, newValue, value);
        value = newValue;
        callback();
      },
    });
  });
}