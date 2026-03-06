const { Server } = require("socket.io");
const io = new Server(3012);

io.on("connection", (socket) => {
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
        io.to(requestId).emit("morse-delivery", { 
            roomId: requestId, 
            content: content 
        });
    });
});