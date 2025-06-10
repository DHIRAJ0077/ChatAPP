const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Determine allowed origins based on environment
const getAllowedOrigins = () => {
  // In production, always use wildcard during troubleshooting
  // This will make sure any frontend can connect
  // You can restrict this later once everything is working
  console.log(`Current NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  return "*";
};

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins during troubleshooting
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling']
});

// Add health check endpoints
app.get("/", (req, res) => {
  res.send("Chat server is running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    version: "1.0.1"
  });
});

// Store user information including online status, typing status, and avatar color
const users = {}; 

// Store messages with read receipts and reactions
const messages = [];
const MAX_MESSAGES = 100; // Limit stored messages
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB file size limit

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Send message history to newly connected user
  socket.emit("messageHistory", messages);

  socket.on("setUsername", (userData) => {
    const { username, avatarColor } = userData;
    users[socket.id] = {
      username,
      id: socket.id,
      isOnline: true,
      isTyping: false,
      lastSeen: new Date(),
      avatarColor: avatarColor || generateRandomColor()
    };
    console.log(`${username} joined the chat.`);
    
    // Broadcast updated users list to all clients
    io.emit("updateUsers", Object.values(users));
  });

  socket.on("message", (message) => {
    console.log("Message received from", users[socket.id]?.username || socket.id);
    
    // Check file size if message has a file
    if (message.hasFile) {
      // Extract file size from base64 string
      const base64Size = message.fileData ? message.fileData.length * 0.75 : 0; // base64 is ~33% larger than binary
      
      if (base64Size > MAX_FILE_SIZE) {
        socket.emit("error", { message: "File size exceeds the 5MB limit" });
        return;
      }
      
      console.log(`File received: ${message.fileName} (${(message.fileSize / 1024).toFixed(1)}KB)`);
    }
    
    // Add message ID, read status, and empty reactions array
    const enhancedMessage = {
      ...message,
      id: Date.now().toString(),
      readBy: [socket.id], // Initially read only by sender
      reactions: message.reactions || [] // Initialize reactions array if not present
    };
    
    // Store message
    messages.push(enhancedMessage);
    if (messages.length > MAX_MESSAGES) {
      messages.shift(); // Remove oldest message if limit reached
    }
    
    // Reset typing indicator when message is sent
    if (users[socket.id]) {
      users[socket.id].isTyping = false;
      io.emit("userTyping", { userId: socket.id, isTyping: false });
    }
    
    // Broadcast message to all clients
    io.emit("receiveMessage", enhancedMessage);
  });
  
  // Handle message reactions
  socket.on("reaction", (reactionData) => {
    const { messageId, type, userId, username } = reactionData;
    const message = messages.find(msg => msg.id === messageId);
    
    if (message) {
      // Initialize reactions array if it doesn't exist
      if (!message.reactions) {
        message.reactions = [];
      }
      
      // Check if user already reacted with this type
      const existingReactionIndex = message.reactions.findIndex(
        r => r.userId === userId && r.type === type
      );
      
      if (existingReactionIndex >= 0) {
        // Remove reaction if it already exists (toggle behavior)
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // Add new reaction
        message.reactions.push({
          userId,
          username,
          type,
          timestamp: new Date().toISOString()
        });
      }
      
      // Broadcast updated reactions to all clients
      io.emit("messageReactionUpdate", { 
        messageId, 
        reactions: message.reactions 
      });
    }
  });

  // Handle typing indicator
  socket.on("typing", (isTyping) => {
    if (users[socket.id]) {
      users[socket.id].isTyping = isTyping;
      socket.broadcast.emit("userTyping", { userId: socket.id, isTyping });
    }
  });
  
  // Handle read receipts
  socket.on("messageRead", (messageId) => {
    const message = messages.find(msg => msg.id === messageId);
    if (message && !message.readBy.includes(socket.id)) {
      message.readBy.push(socket.id);
      io.emit("messageReadUpdate", { messageId, readBy: message.readBy });
    }
  });

  // Handle user status (online/away)
  socket.on("userStatus", (status) => {
    if (users[socket.id]) {
      users[socket.id].isOnline = status === "online";
      users[socket.id].lastSeen = new Date();
      io.emit("updateUsers", Object.values(users));
    }
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      console.log(`${users[socket.id].username} disconnected.`);
      users[socket.id].isOnline = false;
      users[socket.id].lastSeen = new Date();
      io.emit("updateUsers", Object.values(users));
      
      // Remove user after some time (keep for showing last seen)
      setTimeout(() => {
        if (users[socket.id] && !users[socket.id].isOnline) {
          delete users[socket.id];
          io.emit("updateUsers", Object.values(users));
        }
      }, 3600000); // Remove after 1 hour
    }
  });
});

// Generate random color for user avatars
function generateRandomColor() {
  const colors = [
    "#FF5733", "#33FF57", "#3357FF", "#FF33A8", 
    "#33FFF5", "#F5FF33", "#FF8333", "#8333FF"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Use environment port or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS allowed origins: ${JSON.stringify(getAllowedOrigins())}`);
});

// Export server components for testing or other uses
module.exports = { app, server, io };
