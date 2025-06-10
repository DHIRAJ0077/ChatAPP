// Configuration for server connection based on environment
const getServerUrl = () => {
  // Check for environment variable first (set in vercel.json)
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }
  
  // Fall back to environment-specific configuration
  const config = {
    // Server URL for development (local)
    development: {
      serverUrl: 'http://localhost:5000'
    },
    // Server URL for production (deployed)
    production: {
      // Your deployed Render server URL
      serverUrl: 'https://chat-app-server.onrender.com' 
    }
  };
  
  // Determine which environment we're in
  const environment = import.meta.env.MODE || 'development';
  return config[environment].serverUrl;
};

// Export the configuration
export default {
  serverUrl: getServerUrl()
};
