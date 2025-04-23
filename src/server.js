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
    origin: "http://localhost:8080", // 개발용, 필요 시 '*'로 변경 가능
    methods: ["GET", "POST"]
  }
});

// 뷰 엔진 및 정적 파일 설정
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use("/public", express.static(path.join(__dirname, "public")));

// 라우팅

// 소켓 통신
io.on("connection", (socket) => {
  console.log("✅ 클라이언트 연결됨");

  // 프레임 수신 시 전체 클라이언트에 브로드캐스트
  socket.on("frame", (data) => {
    io.emit("frame", data);
  });
});

io.on("disconnect", (socket) => {
  console.log("✅ 클라이언트 연결해제");
});

// 서버 시작
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});