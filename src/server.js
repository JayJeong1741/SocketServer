import express from "express";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// 현재 파일 경로 계산 (ESM에서 __dirname 대체)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
  cors: {
    origin: "http://localhost:8080", // 클라이언트 주소
    credentials: true
  },
});

// 소켓 통신
io.on("connection", (socket) => {
  socket.on("connection", (idCid) => {
    socket.join(idCid);
    socket.to(idCid).emit("connected");
  });

  // 영상 전송
  socket.on("videoCall", (idCid) => {
    socket.to(idCid).emit("videoCall");
  });

  socket.on("frame", (data) => {
    const idCid = data.idCid;   // 객체 안에서 꺼내야 함
    const frame = data.frame;
    socket.to(idCid).emit("frame", frame);  // frame만 전달
});
  socket.on("stopVideo", (idCid => {
    console.log("STOP!")
    socket.to(idCid).emit("stopVideo")
  }))
});

// 서버 시작
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});