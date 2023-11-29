
export const checkCollision = (enemy, player, type = 'circle') => {
  if (type == 'rect') {
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
  } else if (type == 'circle') {
    // 圆形碰撞检测
    const dx = enemy.x + enemy.width / 2 - (player.x + player.width / 2 + 5);
    const dy = enemy.y + enemy.height / 2 - (player.y + player.height / 2 + 15); //微调
    const distance = Math.sqrt(dx * dx + dy * dy); // 平方根
    //更小一点
    if (distance < enemy.width / 2 + player.width / 3) {
      return true;
    } else {
      return false;
    }
  }
};

// 监听属性 --从而无需在其他地方调用computed，单一职责
export const observe = (obj, keys, callback) => {
  keys.forEach((key) => {
    // 获取原来的属性描述符
    let descriptor = Object.getOwnPropertyDescriptor(obj, key);
    // 会覆盖原始属性，导致初始化失效 --vue2是采用代理方式避免
    Object.defineProperty(obj, key, {
      // 必须要有get
      get() {
        // 使用闭包
        return descriptor.value;
      },
      set(newValue) {
        console.log(`修改属性：${key}`, newValue);
        descriptor.value = newValue;
        callback();
      },
    });
  });
};

// 节流
/**
 * @param {Function} fn 目标函数
 * @param {Number} time 延迟执行毫秒数
 * @param {Boolean} type 1-立即执行，2-不立即执行
 * @description 节流函数
 */
export const throttle = (fn, delay = 100) => {
  //上一次的执行时间
  let previous = 0;
  return function () {
    let now = new Date().getTime();
    //如果距离上一次执行超过了delay才能再次执行
    if (now - previous > delay) {
      fn.apply(this, [...arguments]);
      previous = now;
    }
  };
};
