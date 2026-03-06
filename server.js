const { Server } = require("socket.io");
const io = new Server(3012);

const lastMessageCache = new Map();
const SPAM_WINDOW_MS = 3325; 

io.on("connection", (socket) => {
    
    socket.on("disconnect", () => {
        lastMessageCache.delete(socket.id);
    });

    socket.on("sync-rooms", (rooms) => {
        socket.rooms.forEach(room => {
            if (room !== socket.id) socket.leave(room);
        });

        if (Array.isArray(rooms)) {
            rooms.forEach(room => {
                if (room) socket.join(room.toString());
            });
        }
    });

    socket.on("send-message", ({ requestId, content }) => {
        const now = Date.now();
        const lastMsg = lastMessageCache.get(socket.id);

        if (lastMsg && lastMsg.content === content && (now - lastMsg.timestamp) < SPAM_WINDOW_MS) {
            return; 
        }
        lastMessageCache.set(socket.id, { content, timestamp: now });

        io.to(requestId).emit("morse-delivery", { 
            roomId: requestId, 
            content: content 
        });
    });
});