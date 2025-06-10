import { FaUsers, FaCircle } from 'react-icons/fa';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

const UserSidebar = ({ username, avatarColor, onlineUsers, showUsersList }) => {
  if (!showUsersList) return null;
  
  return (
    <div className="w-64 bg-gradient-to-b from-blue-700 to-blue-500 dark:from-gray-800 dark:to-gray-700 text-white p-5 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Chat App</h2>
      
      {/* Current User */}
      <div className="flex items-center space-x-3 mb-8 p-3 bg-blue-600/30 dark:bg-gray-700/50 rounded-lg">
        <div className="relative">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: avatarColor }}
          >
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <p className="text-lg font-medium">{username}</p>
          <p className="text-xs opacity-70">Online</p>
        </div>
      </div>
      
      {/* Online Users */}
      <div className="mb-4">
        <h3 className="flex items-center text-sm font-semibold mb-2 text-blue-200 dark:text-gray-300">
          <FaUsers className="mr-2" /> ONLINE USERS ({onlineUsers.filter(user => user.isOnline).length})
        </h3>
        <div className="space-y-3">
          {onlineUsers
            .filter(user => user.isOnline)
            .map(user => (
              <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-600/20 dark:hover:bg-gray-700/30">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{user.username}</p>
                  {user.isTyping && (
                    <p className="text-xs text-blue-200 dark:text-gray-400 italic">typing...</p>
                  )}
                </div>
                <FaCircle className="text-green-500" size={8} />
              </div>
            ))}
        </div>
      </div>
      
      {/* Offline Users */}
      <div>
        <h3 className="flex items-center text-sm font-semibold mb-2 text-blue-200 dark:text-gray-300">
          <FaUsers className="mr-2" /> OFFLINE USERS ({onlineUsers.filter(user => !user.isOnline).length})
        </h3>
        <div className="space-y-3">
          {onlineUsers
            .filter(user => !user.isOnline)
            .map(user => (
              <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-600/20 dark:hover:bg-gray-700/30">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold opacity-60"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm opacity-60">{user.username}</p>
                  <p className="text-xs text-blue-200 dark:text-gray-400">
                    Last seen {moment(user.lastSeen).fromNow()}
                  </p>
                </div>
                <FaCircle className="text-gray-400" size={8} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

UserSidebar.propTypes = {
  username: PropTypes.string.isRequired,
  avatarColor: PropTypes.string.isRequired,
  onlineUsers: PropTypes.array.isRequired,
  showUsersList: PropTypes.bool.isRequired
};

export default UserSidebar;
