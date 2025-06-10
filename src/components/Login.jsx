import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaComment, FaUser, FaPalette } from 'react-icons/fa';

const Login = ({ 
  username, 
  setUsername, 
  setIsUserSet, 
  avatarColor, 
  setAvatarColor,
  darkMode 
}) => {
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }
    setIsUserSet(true);
  };
  
  const colorOptions = [
    "#FF5733", "#33FF57", "#3357FF", "#FF33A8", 
    "#33FFF5", "#F5FF33", "#FF8333", "#8333FF"
  ];

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className={`w-full max-w-md p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white mb-4">
            <FaComment size={32} />
          </div>
          <h1 className="text-2xl font-bold">Welcome to Chat App</h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Connect with friends in real-time</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Choose Your Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaUser className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className={`pl-10 w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                placeholder="Enter your username"
              />
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 flex items-center">
              <FaPalette className="mr-2" /> Choose Avatar Color
            </label>
            <div className="flex flex-wrap gap-2 justify-center">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  className={`w-8 h-8 rounded-full ${avatarColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Join Chat
          </button>
        </form>
      </div>
    </div>
  );
};

Login.propTypes = {
  username: PropTypes.string.isRequired,
  setUsername: PropTypes.func.isRequired,
  setIsUserSet: PropTypes.func.isRequired,
  avatarColor: PropTypes.string.isRequired,
  setAvatarColor: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired
};

export default Login;
