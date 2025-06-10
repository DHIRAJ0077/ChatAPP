// Configuration for server connection based on environment
const getServerUrl = () => {
  // Log all available environment variables for debugging (without sensitive data)
  console.log('Available environment variables:', {
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    BASE_URL: import.meta.env.BASE_URL,
    // Don't log potential sensitive data like API keys
  });

  // Check for environment variable first (set in vercel.json)
  if (import.meta.env.VITE_SERVER_URL) {
    console.log('Using environment variable for server URL:', import.meta.env.VITE_SERVER_URL);
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
      // Your deployed Render server URL - updated to match actual deployment
      serverUrl: 'https://chat-app-server-nacx.onrender.com'
    }
  };
  
  // Determine which environment we're in
  const environment = import.meta.env.MODE || 'development';
  console.log('Current environment:', environment);
  console.log('Using server URL:', config[environment].serverUrl);
  
  // Test the server URL with a fetch to the health endpoint
  const serverUrl = config[environment].serverUrl;
  try {
    fetch(`${serverUrl}/api/health`)
      .then(response => response.json())
      .then(data => console.log('Server health check:', data))
      .catch(err => console.error('Server health check failed:', err));
  } catch (error) {
    console.error('Error testing server URL:', error);
  }
  
  return serverUrl;
};

// Export the configuration
const serverConfig = {
  serverUrl: getServerUrl(),
  version: '1.0.1', // Add version for debugging
  timestamp: new Date().toISOString()
};

console.log('Server configuration:', serverConfig);

export default serverConfig;
