const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  // 处理跨域
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  // 监听自定义事件
  socket.on("message", (data) => {
    console.log("user disconnected");
    io.emit('pushMsg',data)// 广播，已经帮我们将socket管理了
    socket.emit('pushMsg',data)
  });
});
httpServer.listen(3000);
