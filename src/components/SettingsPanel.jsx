import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaTimes, FaCheck, FaSignOutAlt, FaVolumeMute, FaVolumeUp, FaBell, FaBellSlash, FaUserEdit, FaPalette } from 'react-icons/fa';

const SettingsPanel = ({ 
  isOpen, 
  onClose, 
  darkMode, 
  toggleDarkMode, 
  showNotifications, 
  toggleNotifications,
  username,
  avatarColor,
  setUsername,
  setAvatarColor,
  soundEnabled,
  toggleSound,
  onSignOut
}) => {
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const availableColors = [
    "#FF5733", "#33FF57", "#3357FF", "#FF33A8", 
    "#33FFF5", "#F5FF33", "#FF8333", "#8333FF",
    "#FF4D4D", "#4DFF4D", "#4D4DFF", "#FF4DFF",
    "#4DFFFF", "#FFFF4D", "#FF8C4D", "#8C4DFF"
  ];

  const handleUsernameSubmit = () => {
    if (newUsername.trim()) {
      setUsername(newUsername);
      setEditingUsername(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUsernameSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* User Profile */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Profile</h3>
            
            <div className="flex items-center mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4"
                style={{ backgroundColor: avatarColor }}
              >
                {username.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1">
                {editingUsername ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="border rounded px-2 py-1 mr-2 flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      autoFocus
                    />
                    <button 
                      onClick={handleUsernameSubmit}
                      className="text-green-500 hover:text-green-600"
                    >
                      <FaCheck />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="text-gray-800 dark:text-white font-medium mr-2">{username}</span>
                    <button 
                      onClick={() => setEditingUsername(true)}
                      className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                    >
                      <FaUserEdit />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <button 
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <FaPalette className="mr-2" />
                Change avatar color
              </button>
              
              {showColorPicker && (
                <div className="mt-2 grid grid-cols-8 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full ${avatarColor === color ? 'ring-2 ring-blue-500' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setAvatarColor(color);
                        setShowColorPicker(false);
                      }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* App Settings */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">App Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {darkMode ? (
                    <span className="text-yellow-500 mr-3">🌙</span>
                  ) : (
                    <span className="text-yellow-500 mr-3">☀️</span>
                  )}
                  <span className="text-gray-800 dark:text-white">Dark Mode</span>
                </div>
                
                <button 
                  onClick={toggleDarkMode}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                    darkMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span 
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`} 
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {showNotifications ? (
                    <FaBell className="text-blue-500 mr-3" />
                  ) : (
                    <FaBellSlash className="text-gray-500 mr-3" />
                  )}
                  <span className="text-gray-800 dark:text-white">Notifications</span>
                </div>
                
                <button 
                  onClick={toggleNotifications}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                    showNotifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span 
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                      showNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} 
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {soundEnabled ? (
                    <FaVolumeUp className="text-blue-500 mr-3" />
                  ) : (
                    <FaVolumeMute className="text-gray-500 mr-3" />
                  )}
                  <span className="text-gray-800 dark:text-white">Sound Effects</span>
                </div>
                
                <button 
                  onClick={toggleSound}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                    soundEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span 
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} 
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* Sign Out */}
          <div>
            <button 
              onClick={onSignOut}
              className="flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
            >
              <FaSignOutAlt className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

SettingsPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  toggleDarkMode: PropTypes.func.isRequired,
  showNotifications: PropTypes.bool.isRequired,
  toggleNotifications: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  avatarColor: PropTypes.string.isRequired,
  setUsername: PropTypes.func.isRequired,
  setAvatarColor: PropTypes.func.isRequired,
  soundEnabled: PropTypes.bool.isRequired,
  toggleSound: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired
};

export default SettingsPanel;
