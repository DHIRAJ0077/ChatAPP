import { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";

// Try to connect to the server, starting with port 5000 and incrementing if needed
const connectToServer = () => {
  let port = 5000;
  const maxAttempts = 5;
  
  const tryConnect = (attempt) => {
    if (attempt > maxAttempts) {
      console.error('Failed to connect to server after multiple attempts');
      return null;
    }
    
    const socketInstance = io(`http://localhost:${port}`, {
      reconnectionAttempts: 3,
      timeout: 2000,
    });
    
    socketInstance.on('connect_error', () => {
      console.log(`Failed to connect on port ${port}, trying port ${port + 1}...`);
      socketInstance.close();
      port += 1;
      return tryConnect(attempt + 1);
    });
    
    return socketInstance;
  };
  
  return tryConnect(1);
};

// Socket.io client with dynamic port
const socket = connectToServer();

// Import components
import UserSidebar from "./components/UserSidebar";
import MessageInput from "./components/MessageInput";
import MessageList from "./components/MessageList";
import Header from "./components/Header";
import Login from "./components/Login";

// Import utilities
import { requestNotificationPermission, sendMessageNotification } from "./utils/notifications";
import { playMessageSentSound } from "./utils/soundEffects";

function App() {
  // Basic chat state
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [isUserSet, setIsUserSet] = useState(false);
  
  // File handling state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [filePreview, setFilePreview] = useState(null); // Used in MessageInput for image previews
  
  // UI state
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [showUsersList, setShowUsersList] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  
  // Enhanced features state
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [avatarColor, setAvatarColor] = useState(generateRandomColor());
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  // Refs
  const chatBoxRef = useRef(null);
  const currentUserId = useRef(null);

  // Generate random color for user avatar
  function generateRandomColor() {
    const colors = [
      "#FF5733", "#33FF57", "#3357FF", "#FF33A8", 
      "#33FFF5", "#F5FF33", "#FF8333", "#8333FF"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem("darkMode", JSON.stringify(newMode));
      return newMode;
    });
  };

  // Toggle users list sidebar
  const toggleUsersList = () => {
    setShowUsersList(prev => !prev);
  };

  // Toggle notifications
  const toggleNotifications = async () => {
    if (!showNotifications) {
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        alert("Please enable notifications in your browser settings");
        return;
      }
    }
    setShowNotifications(prev => !prev);
  };

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    socket.emit("typing", true);

    const timeout = setTimeout(() => {
      socket.emit("typing", false);
    }, 1000);

    setTypingTimeout(timeout);
  }, [typingTimeout]);

  // Send message function
  const sendMessage = () => {
    if (message.trim() || (selectedFile && fileData)) {
      const messageData = {
        id: socket.id,
        userId: socket.id,
        username,
        text: message.trim(),
        timestamp: new Date().toISOString(),
        read: false,
        reactions: [], // Initialize empty reactions array
      };

      // Add file data if a file is selected
      if (selectedFile && fileData) {
        messageData.hasFile = true;
        messageData.fileName = selectedFile.name;
        messageData.fileSize = selectedFile.size;
        messageData.fileType = selectedFile.type;
        messageData.fileData = fileData;
      }

      socket.emit('message', messageData);
      if (window.playMessageSentSound) {
        playMessageSentSound();
      }
      setMessage('');
      setSelectedFile(null);
      setFileData(null);
      setFilePreview(null);
    }
  };
  
  // Handle adding a reaction to a message
  const addReaction = (messageId, reactionType) => {
    const reactionData = {
      messageId,
      userId: socket.id,
      username,
      type: reactionType,
      timestamp: new Date().toISOString()
    };
    
    socket.emit('reaction', reactionData);
    
    // Update local state
    setMessages(prevMessages => {
      return prevMessages.map(msg => {
        if (msg.id === messageId) {
          // Check if user already reacted with this type
          const existingReactionIndex = msg.reactions?.findIndex(
            r => r.userId === socket.id && r.type === reactionType
          );
          
          let updatedReactions = [...(msg.reactions || [])];
          
          if (existingReactionIndex >= 0) {
            // Remove reaction if it already exists (toggle behavior)
            updatedReactions.splice(existingReactionIndex, 1);
          } else {
            // Add new reaction
            updatedReactions.push({
              userId: socket.id,
              username,
              type: reactionType,
              timestamp: new Date().toISOString()
            });
          }
          
          return { ...msg, reactions: updatedReactions };
        }
        return msg;
      });
    });
  };

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Socket event listeners
  useEffect(() => {
    // Request notification permission
    requestNotificationPermission();

    // Listen for message history
    socket.on("messageHistory", (messageHistory) => {
      setMessages(messageHistory);
    });
    
    // Listen for message reaction updates
    socket.on("messageReactionUpdate", ({ messageId, reactions }) => {
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, reactions };
          }
          return msg;
        });
      });
    });

    // Listen for new messages
    socket.on("receiveMessage", (message) => {
      setMessages(prev => [...prev, message]);
      
      // Send notification if message is from someone else
      if (message.userId !== socket.id && showNotifications) {
        sendMessageNotification(message, showNotifications);
      }
      
      // Mark message as read
      socket.emit("messageRead", message.id);
    });

    // Listen for user list updates
    socket.on("updateUsers", (users) => {
      setOnlineUsers(users);
    });

    // Listen for typing indicators
    socket.on("userTyping", ({ userId, isTyping }) => {
      setTypingUsers(prev => ({
        ...prev,
        [userId]: isTyping
      }));
    });

    // Listen for read receipts
    socket.on("messageReadUpdate", ({ messageId, readBy }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, readBy } : msg
      ));
    });

    // Store socket ID for reference
    currentUserId.current = socket.id;

    // Cleanup
    return () => {
      socket.off("messageHistory");
      socket.off("receiveMessage");
      socket.off("updateUsers");
      socket.off("userTyping");
      socket.off("messageReadUpdate");
    };
  }, [showNotifications]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Set user when joining
  useEffect(() => {
    if (isUserSet) {
      socket.emit("setUsername", { username, avatarColor });
    }
  }, [isUserSet, username, avatarColor]);

  // Set online status when window focus changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isUserSet) {
        socket.emit("userStatus", document.hidden ? "away" : "online");
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", () => socket.emit("userStatus", "online"));
    window.addEventListener("blur", () => socket.emit("userStatus", "away"));

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", () => socket.emit("userStatus", "online"));
      window.removeEventListener("blur", () => socket.emit("userStatus", "away"));
    };
  }, [isUserSet]);

  // Render login screen if user is not set
  if (!isUserSet) {
    return (
      <Login
        username={username}
        setUsername={setUsername}
        setIsUserSet={setIsUserSet}
        avatarColor={avatarColor}
        setAvatarColor={setAvatarColor}
        darkMode={darkMode}
      />
    );
  }

  // Main chat interface
  return (
    <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Users Sidebar */}
      <UserSidebar
        username={username}
        avatarColor={avatarColor}
        onlineUsers={onlineUsers}
        showUsersList={showUsersList}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          showUsersList={showUsersList}
          toggleUsersList={toggleUsersList}
          showNotifications={showNotifications}
          toggleNotifications={toggleNotifications}
        />

        {/* Messages */}
        <div 
          className="flex-1 p-4 overflow-y-auto dark:bg-gray-800" 
          ref={chatBoxRef}
        >
          {/* File Preview */}
          {filePreview && (
            <div className="mb-4 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Image Preview</h3>
                <button 
                  onClick={() => setFilePreview(null)}
                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-center">
                <img 
                  src={filePreview} 
                  alt="Preview" 
                  className="max-w-full max-h-64 rounded-lg" 
                />
              </div>
            </div>
          )}
          
          <MessageList 
            messages={messages} 
            currentUserId={socket.id} 
            onlineUsers={onlineUsers}
            onAddReaction={addReaction}
          />
          
          {/* Typing indicators */}
          {Object.entries(typingUsers).map(([userId, isTyping]) => {
            if (isTyping && userId !== socket.id) {
              const user = onlineUsers.find(u => u.id === userId);
              if (user) {
                return (
                  <div key={userId} className="flex items-center space-x-2 p-2 text-sm text-gray-500 dark:text-gray-400">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: user.avatarColor }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <p>{user.username} is typing...</p>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                );
              }
            }
            return null;
          })}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t dark:border-gray-700">
          <MessageInput
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
            handleTyping={handleTyping}
            darkMode={darkMode}
            setSelectedFile={setSelectedFile}
            setFileData={setFileData}
            setFilePreview={setFilePreview}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
