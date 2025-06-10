import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaPaperPlane, FaSmile, FaImage, FaFileAlt, FaTimes } from 'react-icons/fa';
import { MdAttachFile } from 'react-icons/md';

const MessageInput = ({ 
  message, 
  setMessage, 
  sendMessage, 
  handleTyping,
  darkMode,
  setSelectedFile,
  setFileData,
  setFilePreview
}) => {

  const [localSelectedFile, setLocalSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);

  // Common emojis
  const commonEmojis = [
    { emoji: '👍', label: 'thumbs up' },
    { emoji: '❤️', label: 'heart' },
    { emoji: '😊', label: 'smile' },
    { emoji: '😂', label: 'laugh' },
    { emoji: '😍', label: 'heart eyes' },
    { emoji: '😎', label: 'cool' },
    { emoji: '😡', label: 'angry' },
    { emoji: '👏', label: 'clap' },
    { emoji: '🎉', label: 'party' },
    { emoji: '🔥', label: 'fire' },
    { emoji: '👌', label: 'ok' },
    { emoji: '🤔', label: 'thinking' },
    { emoji: '😢', label: 'sad' },
    { emoji: '🙏', label: 'pray' },
  ];

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to add emoji to message
  const addEmojiToMessage = (emoji) => {
    setMessage(prevMessage => prevMessage + emoji);
    setShowEmojiPicker(false);
    inputRef.current.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLocalSelectedFile(file);
      setSelectedFile(file);
      
      // Create file preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
      
      // Convert file to base64 for sending
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setFileData(e.target.result);
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  const handleFileSend = (e) => {
    e.preventDefault();
    sendMessage();
  };
  
  const cancelFileSelection = () => {
    setLocalSelectedFile(null);
    setSelectedFile(null);
    setFileData(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      
      // Add clipboard paste event listener
      const handlePaste = (e) => {
        if (e.clipboardData && e.clipboardData.items) {
          const items = e.clipboardData.items;
          
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              e.preventDefault();
              const file = items[i].getAsFile();
              
              // Set the file for upload
              setLocalSelectedFile(file);
              setSelectedFile(file);
              
              // Create preview
              const reader = new FileReader();
              reader.onload = (e) => {
                setFilePreview(e.target.result);
              };
              reader.readAsDataURL(file);
              
              // Show a notification
              const fileInfo = document.createElement('div');
              fileInfo.className = 'text-sm text-green-500 mt-1';
              fileInfo.textContent = 'Image from clipboard ready to send';
              
              const container = inputRef.current.parentElement;
              const existingInfo = container.querySelector('.text-green-500');
              if (existingInfo) {
                container.removeChild(existingInfo);
              }
              
              container.appendChild(fileInfo);
              setTimeout(() => {
                if (container.contains(fileInfo)) {
                  container.removeChild(fileInfo);
                }
              }, 3000);
              
              break;
            }
          }
        }
      };
      
      // Add the event listener
      document.addEventListener('paste', handlePaste);
      
      // Clean up
      return () => {
        document.removeEventListener('paste', handlePaste);
      };
    }
  }, [setSelectedFile, setFilePreview]);

  return (
    <div className="mt-4 relative">
      <div className="relative flex items-center w-full">
        {/* File attachment display */}
        {localSelectedFile && (
          <div className="absolute -top-14 left-0 right-0 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-md flex items-center justify-between border dark:border-gray-600">
            <div className="flex items-center">
              {localSelectedFile.type.startsWith('image/') ? (
                <FaImage className="text-blue-500 mr-2" />
              ) : (
                <FaFileAlt className="text-blue-500 mr-2" />
              )}
              <span className="text-sm truncate max-w-xs">{localSelectedFile.name}</span>
              <span className="text-xs text-gray-500 ml-2">({(localSelectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button 
              onClick={cancelFileSelection}
              className="text-gray-500 hover:text-red-500 ml-2"
            >
              <FaTimes />
            </button>
          </div>
        )}
        
        {/* Emoji button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="absolute left-2 text-gray-500 hover:text-blue-500 focus:outline-none dark:text-gray-400 dark:hover:text-blue-400"
        >
          <FaSmile size={20} />
        </button>
        
        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="absolute left-10 text-gray-500 hover:text-blue-500 focus:outline-none dark:text-gray-400 dark:hover:text-blue-400"
        >
          <MdAttachFile size={20} />
        </button>
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
        />
        
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            className="w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            placeholder="Type a message..."
            rows={1}
            style={{ minHeight: '50px', maxHeight: '120px' }}
          />
          
          <button 
            onClick={handleFileSend}
            disabled={!message.trim() && !localSelectedFile}
            className={`absolute right-2 bottom-2 p-2 rounded-full ${
              message.trim() 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-400'
            } transition-colors`}
          >
            <FaPaperPlane size={16} />
          </button>
        </div>
      </div>
      
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef}
          className="absolute bottom-full left-0 mb-2 z-50"
        >
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-3 w-64`}>
            <div className="grid grid-cols-5 gap-2">
              {commonEmojis.map(item => (
                <button
                  key={item.label}
                  onClick={() => addEmojiToMessage(item.emoji)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                  title={item.label}
                >
                  <span className="text-xl">{item.emoji}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

MessageInput.propTypes = {
  message: PropTypes.string.isRequired,
  setMessage: PropTypes.func.isRequired,
  sendMessage: PropTypes.func.isRequired,
  handleTyping: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  setSelectedFile: PropTypes.func.isRequired,
  setFileData: PropTypes.func.isRequired,
  setFilePreview: PropTypes.func
};

export default MessageInput;
