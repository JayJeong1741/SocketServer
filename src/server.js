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
  socket.on("connection", (sessionInfo) => {
    const room = sessionInfo.sessionId + sessionInfo.idCid
    socket.join(room);
    console.log("sessionId:" +  sessionInfo.sessionId);
    console.log("idCid:" + sessionInfo.idCid);
    console.log("Room info:" + room);
    io.emit("connection", sessionInfo.sessionId)
  });
  // 영상 전송
  socket.on("videoCall", (room) => {
    socket.to(room).emit("videoCall", room);
  });

  socket.on("frame", (data) => {
    socket.to(data.room_id).emit("frame", data.data);
  });
  socket.on("stopVideo", (room) => {
    console.log("STOP!");
    socket.to(room).emit("stopVideo", room);
  })
  socket.on("object_detected", jsonStr => {
    const data = JSON.parse(jsonStr);  // 문자열을 객체로 변환
    console.log("room : " + data.room);
    console.log("class : " + data.cls);
    console.log("id:" + data.id);
    io.to(data.room).emit("detection",data.cls);
  });  
  socket.on("connectionSuccess", data => {
    socket.join(data)
    console.log("connection Success! sessionInfo From pyhton:" + data)
    socket.to(data).emit("successMessage","연결성공");
  })
});

// 서버 시작
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});