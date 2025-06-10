// Simple Socket.IO client to test connection
import { io } from "socket.io-client";

// Connect to your local server
const socket = io("http://localhost:5000", {
  reconnectionAttempts: 5,
  timeout: 10000,
  transports: ['websocket', 'polling']
});

// Connection events
socket.on("connect", () => {
  console.log("Connected to server!");
  console.log("Socket ID:", socket.id);
  
  // Send a test message
  socket.emit("setUsername", { username: "TestUser", avatarColor: "#FF5733" });
  
  // Send a test message after a short delay
  setTimeout(() => {
    socket.emit("message", {
      text: "Test message from Node.js client",
      username: "TestUser",
      timestamp: new Date().toISOString(),
      hasFile: false
    });
    
    console.log("Test message sent");
  }, 1000);
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

// Listen for messages
socket.on("receiveMessage", (message) => {
  console.log("Received message:", message);
});

socket.on("updateUsers", (users) => {
  console.log("Users online:", users.length);
  console.log("User details:", users);
});

// Listen for any event
socket.onAny((event, ...args) => {
  console.log(`Event "${event}" received:`, args);
});

console.log("Attempting to connect to server...");

// Keep the script running
setTimeout(() => {
  console.log("Test complete, disconnecting...");
  socket.disconnect();
  // Use a different way to exit in ES modules
  console.log("Exiting...");
}, 10000);
