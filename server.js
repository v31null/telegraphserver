const { Server } = require("socket.io");
const io = new Server(3012);

const morseMap = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '0': '-----', ' ': '/', '.': '.-.-.-', ',': '--..--'
};

const toMorse = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .split('')
        .map(char => morseMap[char] || '') 
        .filter(code => code !== '') 
        .join(' ');
};

io.on("connection", (socket) => {
    
    // NEW LOGIC: Wipes old rooms and only joins current active ones 
    // This stops you from hearing channels you changed away from!
    socket.on("sync-rooms", (rooms) => {
        // Leave all rooms except the default personal socket room
        socket.rooms.forEach(room => {
            if (room !== socket.id) socket.leave(room);
        });

        // Join the requested rooms
        if (Array.isArray(rooms)) {
            rooms.forEach(room => {
                if (room) socket.join(room.toString());
            });
            console.log(`Socket ${socket.id} synced to strictly listen to: ${rooms.join(", ")}`);
        }
    });

    socket.on("send-message", ({ requestId, content }) => {
        const morseData = toMorse(content);

        // NEW LOGIC: Send an object containing the Room ID AND the Morse data
        io.to(requestId).emit("morse-delivery", { 
            roomId: requestId, 
            morse: morseData 
        });
    });
});