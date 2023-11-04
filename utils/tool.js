// 碰撞检测
export const checkCollision = (enemy, player) => {
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
