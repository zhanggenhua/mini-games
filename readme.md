# 小游戏网站

+ 等做好两个游戏再搭界面
+ 预览地址：https://mini-games-cbx.pages.dev/
+ 个人博客首页：https://blog.csdn.net/zhuanggenhua?spm=1000.2115.3001.5343

#### 介绍
1. **shadow dog** : 以学习为目的，全面改造shadow dog，原教程地址：[shadow dog](https://www.youtube.com/c/Frankslaboratory)

   + [git地址](https://github.com/zhanggenhua/mini-games)

   + 技术栈：`js`、`html`、`css`

   + 介绍：2d平台跳跃游戏，运用技能击杀敌人获取分数，不断向前并面临最终挑战(tip: 上加下发动下坠攻击，移动端长按查看技能提示)

     ![image-20231228155341328](C:\Users\Admin\Desktop\zgh-temp\test\gtest\mini-games\readme.assets\image-20231228155341328.png)

     ![image-20231228155516981](C:\Users\Admin\Desktop\zgh-temp\test\gtest\mini-games\readme.assets\image-20231228155516981.png)

2. 心智蠕虫
   + 技术栈：`ts`、`webpack`
   + 介绍：复刻桌游
3. //

## 进行中小游戏
- [x] shadow dog
  - [x] 优化
    - [x] 架构优化(尽可能遵守设计模式，以及使用vue框架获取的灵感)
    - [x] 按键映射
    - [x] 更真实的物理模拟--针对角色
    - [x] 增加场景切换并根据场景展示不同字体
    - [x] 优化场景移动逻辑，以及可以左右移动
  - [x] 功能
    - [x] 二段跳
    - [x] 对乌鸦专用元气弹（无用的垃圾设计）
    - [x] 多达十余种怪物和简单生态系统(捕食)
    - [x] 部分怪物添加特性(乌鸦投弹，幽灵隐身)
    - [x] 移动端兼容
    - [x] 技能ui
    - [x] 进度条，模仿植物大战僵尸的终局
    - [x] ~~一整套UI~~简单敷衍的UI，包括终局计分，暂停
    - [x] 优化字体文件大小
    - [x] 音效
    - [ ] 后门(联机)
  - [x] 角色
    - [x] 火柱(不规则图形碰撞)
    - [x] 变化学派一环法术：羽落术(空气阻力)
    - [x] 幻影冲刺
    - [x] 屏幕抖动
    - [x] 法相天地
    - [x] 彩虹尾气，虚弱状态
- [ ] 心智蠕虫网页版
  - [ ] 使用ts，借鉴先进架构
- [ ] 战旗
- [ ] 蓄波挡
- [ ] 终极目标：脑叶公司休闲版

## 运行
+ npm install
+ 使用live server打开
+ 字体压缩：font-spider *.html

## 补充说明
+ 使用`--`修饰注释
+ 有超详细的注释！
+ 工作中的教训：一功能一提交，不然开分支需要合并提交就乱套了
