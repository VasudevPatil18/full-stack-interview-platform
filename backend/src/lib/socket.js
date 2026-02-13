import { Server } from "socket.io";
import { ENV } from "./env.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ENV.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a room (session)
    socket.on("join-room", ({ roomId, userId, userName }) => {
      socket.join(roomId);
      socket.userId = userId;
      socket.userName = userName;
      socket.roomId = roomId;

      console.log(`${userName} joined room: ${roomId}`);

      // Notify others in the room
      socket.to(roomId).emit("user-joined", {
        userId,
        userName,
        socketId: socket.id,
      });

      // Send list of existing users in room
      const room = io.sockets.adapter.rooms.get(roomId);
      const usersInRoom = [];
      
      if (room) {
        room.forEach((socketId) => {
          const userSocket = io.sockets.sockets.get(socketId);
          if (userSocket && userSocket.id !== socket.id) {
            usersInRoom.push({
              userId: userSocket.userId,
              userName: userSocket.userName,
              socketId: userSocket.id,
            });
          }
        });
      }

      socket.emit("existing-users", usersInRoom);
    });

    // WebRTC Signaling
    socket.on("offer", ({ offer, to }) => {
      socket.to(to).emit("offer", {
        offer,
        from: socket.id,
        userName: socket.userName,
      });
    });

    socket.on("answer", ({ answer, to }) => {
      socket.to(to).emit("answer", {
        answer,
        from: socket.id,
      });
    });

    socket.on("ice-candidate", ({ candidate, to }) => {
      socket.to(to).emit("ice-candidate", {
        candidate,
        from: socket.id,
      });
    });

    // Chat messages
    socket.on("chat-message", ({ roomId, message, userName }) => {
      io.to(roomId).emit("chat-message", {
        message,
        userName,
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Media controls
    socket.on("toggle-audio", ({ roomId, enabled }) => {
      socket.to(roomId).emit("user-audio-toggle", {
        userId: socket.userId,
        enabled,
      });
    });

    socket.on("toggle-video", ({ roomId, enabled }) => {
      socket.to(roomId).emit("user-video-toggle", {
        userId: socket.userId,
        enabled,
      });
    });

    // Screen sharing
    socket.on("start-screen-share", ({ roomId }) => {
      socket.to(roomId).emit("user-screen-share-started", {
        userId: socket.userId,
        userName: socket.userName,
        socketId: socket.id,
      });
    });

    socket.on("stop-screen-share", ({ roomId }) => {
      socket.to(roomId).emit("user-screen-share-stopped", {
        userId: socket.userId,
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      
      if (socket.roomId) {
        socket.to(socket.roomId).emit("user-left", {
          userId: socket.userId,
          userName: socket.userName,
          socketId: socket.id,
        });
      }
    });

    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit("user-left", {
        userId: socket.userId,
        userName: socket.userName,
        socketId: socket.id,
      });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
