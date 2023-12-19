// 判断是否为移动设备
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

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
    const dx = enemy.x + enemy.width / 2 - (player.x + player.width / 2);
    const dy = enemy.y + enemy.height / 2 - (player.y + player.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy); // 平方根
    //更小一点
    if (distance < enemy.width / 3 + player.width / 3) {
      return true;
    } else {
      return false;
    }
  }
  // 分离轴碰撞检测  --gpt4恐怖如斯
  else if (type == 'separation') {
    // 获取多边形的所有边的法线
    function getNormals(polygon) {
      let normals = [];
      for (let i = 0; i < polygon.length; i++) {
        let p1 = polygon[i];
        let p2 = polygon[i + 1 == polygon.length ? 0 : i + 1];
        let edge = { x: p2.x - p1.x, y: p2.y - p1.y };
        let normal = { x: -edge.y, y: edge.x };
        normals.push(normal);
      }
      return normals;
    }

    // 计算多边形在轴上的投影
    function project(polygon, axis) {
      let min = Infinity;
      let max = -Infinity;
      for (let i = 0; i < polygon.length; i++) {
        let dot = polygon[i].x * axis.x + polygon[i].y * axis.y;
        if (dot < min) min = dot;
        if (dot > max) max = dot;
      }
      return { min, max };
    }

    // 检测两个多边形的投影是否有重叠
    function overlap(proj1, proj2) {
      return !(proj1.max < proj2.min || proj2.max < proj1.min);
    }

    // 碰撞检测
    function checkCollision(polygonA, polygonB) {
      let axes = getNormals(polygonA).concat(getNormals(polygonB));
      for (let i = 0; i < axes.length; i++) {
        let axis = axes[i];
        let proj1 = project(polygonA, axis);
        let proj2 = project(polygonB, axis);
        if (!overlap(proj1, proj2)) {
          return false;
        }
      }
      return true; // 所有轴都有重叠
    }

    let pillar = player;
    // 计算旋转后的四个顶点坐标
    function rotatePoint(cx, cy, angle, px, py) {
      let s = Math.sin(angle);
      let c = Math.cos(angle);
      // translate point back to origin:
      px -= cx;
      py -= cy;
      // rotate point
      let xnew = px * c - py * s;
      let ynew = px * s + py * c;
      // translate point back:
      px = xnew + cx;
      py = ynew + cy;
      return { x: px, y: py };
    }
    function calculateRotatedPoints(x, y, x2, y2, lineH, deg) {
      let angle = (deg * Math.PI) / 180;
      let w = Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y));

      // 旋转前的四个顶点
      let p1 = { x, y: y - lineH / 2 };
      let p2 = { x: x + w, y: p1.y };
      let p3 = { x: x + w, y: y + lineH / 2 };
      let p4 = { x, y: p3.y };

      // 旋转所有四个顶点
      let rp1 = rotatePoint(x, y, angle, p1.x, p1.y);
      let rp2 = rotatePoint(x, y, angle, p2.x, p2.y);
      let rp3 = rotatePoint(x, y, angle, p3.x, p3.y);
      let rp4 = rotatePoint(x, y, angle, p4.x, p4.y);

      return [rp1, rp2, rp3, rp4];
    }

    let pillarVertices = calculateRotatedPoints(
      pillar.x,
      pillar.y,
      pillar.x2,
      pillar.y2,
      pillar.lineH,
      pillar.deg,
    );

    let enemyVertices = [
      { x: enemy.x, y: enemy.y },
      { x: enemy.x, y: enemy.y + enemy.height },
      { x: enemy.x + enemy.width, y: enemy.y + enemy.height },
      { x: enemy.x + enemy.width, y: enemy.y },
    ];
    return checkCollision(pillarVertices, enemyVertices);
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

// 获取敌人祖先类
export const getEnemyClass = (enemy) => {
  if (enemy.__proto__.constructor.name === 'Enemy') {
    console.log(enemy.__proto__.constructor.name, enemy);
    return enemy;
  } else {
    return getEnemyClass(enemy.__proto__);
  }
};
//横向像素反转
export function imageDataHRevert(sourceData, newData) {
  for (var i = 0, h = sourceData.height; i < h; i++) {
    for (var j = 0, w = sourceData.width; j < w; j++) {
      newData.data[i * w * 4 + j * 4 + 0] = sourceData.data[i * w * 4 + (w - j) * 4 + 0];
      newData.data[i * w * 4 + j * 4 + 1] = sourceData.data[i * w * 4 + (w - j) * 4 + 1];
      newData.data[i * w * 4 + j * 4 + 2] = sourceData.data[i * w * 4 + (w - j) * 4 + 2];
      newData.data[i * w * 4 + j * 4 + 3] = sourceData.data[i * w * 4 + (w - j) * 4 + 3];
    }
  }
  return newData;
}
// 像素转换
export function pixelConversion(data) {
  // 遍历像素数据
  for (let i = 0; i < data.length; i += 4) {
    let red = data[i];
    let green = data[i + 1];
    let blue = data[i + 2];
    let alpha = data[i + 3];

    // console.log(red, green, blue, alpha);
    // 判断是否为白色像素点
    // if (red === 255 && green === 255 && blue === 255) {
    //   console.log('???');
    // 将白色像素点的 alpha 值设置为 0，即透明
    // data[i] = 0;
    // data[i + 1] = 0;
    // data[i + 2] = 0;
    // data[i + 3] = 0;
    // }
  }
}

// 淡入
export const fadeIn = (element) => {
  element.classList.add('text-focus-in');
  element.classList.remove('text-blur-out');
  element.style.visibility = 'visible';
};
//淡出
export const fadeOut = (target) => {
  target.classList.add('text-blur-out');
  target.classList.remove('text-focus-in');
  target.style.visibility = 'hidden';
};

// 判断是否移动端
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
