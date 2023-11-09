var websocket = require("websocket").server;
var http = require("http");

// websocket 本质是通过请求头携带upgrade信息，告知服务器升级服务，随后响应也包含upgrade
// 建立在tcp协议之上，握手阶段采用的就是http协议
// 创建http服务器，websocket用的也是同一个端口
var httpServer = http.createServer().listen(9999, function () {
  console.log("http://127.0.0.1:9999");
});

var wsServer = new websocket({
  // httpserver： 告知基于哪个http服务器建立
  httpServer: httpServer,
  autoAcceptConnections: false, //跨域问题
});

var connectArr = []; //连接池
wsServer.on("request", function (request) {
  console.log("后台连接");
  // 创建链接实例  --每个客户端都是独立的
  var connection = request.accept(); //都保存起来建立连接池（redis或数据库），也是一种消息群发的方法
  connectArr.push(connection);
  // 监听客户端发的请求
  connection.on("message", function (message) {
    console.log("收到请求", message);
    for (let i = 0; i < connectArr.length; i++) {
      connectArr[i].send(message.utf8Data);
    }
  });
});
