import PropTypes from 'prop-types';
import { FaMoon, FaSun, FaUsers, FaBell, FaBellSlash, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Header = ({ 
  darkMode, 
  toggleDarkMode, 
  showUsersList, 
  toggleUsersList,
  showNotifications,
  toggleNotifications
}) => {
  return (
    <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">Messages</h1>
      
      <div className="flex space-x-2">
        <button 
          onClick={toggleUsersList}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          title={showUsersList ? "Hide users list" : "Show users list"}
        >
          <FaUsers size={18} />
        </button>
        
        <button 
          onClick={toggleNotifications}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          title={showNotifications ? "Mute notifications" : "Enable notifications"}
        >
          {showNotifications ? <FaBell size={18} /> : <FaBellSlash size={18} />}
        </button>
        
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>
        
        <button 
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          title="Settings"
        >
          <FaCog size={18} />
        </button>
        
        <button 
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          title="Sign out"
        >
          <FaSignOutAlt size={18} />
        </button>
      </div>
    </div>
  );
};

Header.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  toggleDarkMode: PropTypes.func.isRequired,
  showUsersList: PropTypes.bool.isRequired,
  toggleUsersList: PropTypes.func.isRequired,
  showNotifications: PropTypes.bool.isRequired,
  toggleNotifications: PropTypes.func.isRequired
};

export default Header;
