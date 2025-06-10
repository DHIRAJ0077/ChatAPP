import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaCheck, FaCheckDouble, FaDownload, FaFileAlt, FaSmile, FaThumbsUp, FaHeart, FaLaugh } from 'react-icons/fa';
import moment from 'moment-timezone';

const MessageList = ({ messages, currentUserId, onlineUsers, onAddReaction }) => {
  // State for message reactions
  const [showReactionMenu, setShowReactionMenu] = useState(null);
  
  // Handle adding reaction to a message
  const handleAddReaction = (messageId, reactionType) => {
    // Call the parent component's addReaction function
    onAddReaction(messageId, reactionType);
    setShowReactionMenu(null);
  };


  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = moment(message.time || message.timestamp).format('YYYY-MM-DD');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col space-y-4">
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date} className="flex flex-col space-y-2">
          {/* Date header */}
          <div className="flex justify-center">
            <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300">
              {moment(date).calendar(null, {
                sameDay: '[Today]',
                lastDay: '[Yesterday]',
                lastWeek: 'dddd',
                sameElse: 'MMMM D, YYYY'
              })}
            </div>
          </div>
          
          {/* Messages for this date */}
          {msgs.map((msg) => {
            const isCurrentUser = msg.id === currentUserId || msg.userId === currentUserId;
            const user = onlineUsers.find(u => u.id === msg.id || u.id === msg.userId);
            const avatarColor = user?.avatarColor || msg.avatarColor || '#6366F1';
            const username = user?.username || msg.username || 'Unknown';
            
            return (
              <div 
                key={msg.id + (msg.time || msg.timestamp)} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar for other users */}
                {!isCurrentUser && (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="max-w-[70%]">
                  {/* Username for other users */}
                  {!isCurrentUser && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {username}
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  <div 
                    className={`
                      px-3 py-2 rounded-lg shadow-sm
                      ${isCurrentUser 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
                      }
                    `}
                  >
                    {/* Message text */}
                    <div className="relative">
                      {msg.text && <div className="whitespace-pre-wrap break-words">{msg.text}</div>}
                      
                      {/* Message reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex -space-x-1 mt-1">
                          {msg.reactions.map((reaction, index) => (
                            <div 
                              key={`${msg.id}-reaction-${index}`}
                              className="bg-gray-100 dark:bg-gray-600 rounded-full p-1 text-xs"
                              title={`${reaction.username}: ${reaction.type}`}
                            >
                              {reaction.type === 'like' && <FaThumbsUp className="text-blue-500" />}
                              {reaction.type === 'love' && <FaHeart className="text-red-500" />}
                              {reaction.type === 'laugh' && <FaLaugh className="text-yellow-500" />}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Reaction button */}
                      <button 
                        onClick={() => setShowReactionMenu(showReactionMenu === msg.id ? null : msg.id)}
                        className="absolute -right-6 top-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaSmile size={14} />
                      </button>
                      
                      {/* Reaction menu */}
                      {showReactionMenu === msg.id && (
                        <div className="absolute -right-20 -top-10 bg-white dark:bg-gray-700 rounded-full shadow-lg p-1 flex space-x-2 z-10">
                          <button 
                            onClick={() => handleAddReaction(msg.id, 'like')}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                            title="Like"
                          >
                            <FaThumbsUp className="text-blue-500" />
                          </button>
                          <button 
                            onClick={() => handleAddReaction(msg.id, 'love')}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                            title="Love"
                          >
                            <FaHeart className="text-red-500" />
                          </button>
                          <button 
                            onClick={() => handleAddReaction(msg.id, 'laugh')}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                            title="Laugh"
                          >
                            <FaLaugh className="text-yellow-500" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* File attachment */}
                    {msg.hasFile && (
                      <div className="mt-2 border rounded-lg p-2 bg-gray-50 dark:bg-gray-700 flex flex-col">
                        {msg.fileType?.startsWith('image/') ? (
                          <div className="relative">
                            <img 
                              src={msg.fileData} 
                              alt={msg.fileName} 
                              className="max-w-full max-h-60 rounded object-contain my-2"
                            />
                            <div className="absolute bottom-0 right-0 p-1 bg-gray-800 bg-opacity-70 rounded-tl text-white text-xs">
                              {(msg.fileSize / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FaFileAlt className="text-blue-500 mr-2" />
                              <div>
                                <div className="font-medium">{msg.fileName}</div>
                                <div className="text-xs text-gray-500">{(msg.fileSize / 1024).toFixed(1)} KB</div>
                              </div>
                            </div>
                            <a 
                              href={msg.fileData} 
                              download={msg.fileName}
                              className="p-2 text-blue-500 hover:text-blue-700"
                              title="Download file"
                            >
                              <FaDownload />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{moment(msg.time || msg.timestamp).format('h:mm A')}</span>
                    
                    {/* Read receipts for current user's messages */}
                    {isCurrentUser && (
                      <div className="ml-1">
                        {msg.read ? (
                          <FaCheckDouble className="text-blue-500" />
                        ) : (
                          <FaCheck />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.array.isRequired,
  currentUserId: PropTypes.string.isRequired,
  onlineUsers: PropTypes.array.isRequired,
  onAddReaction: PropTypes.func.isRequired
};

export default MessageList;
