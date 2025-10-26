/**
 * Get the API base URL with fallback
 */
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_SERVER_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback for development
  console.warn('VITE_SERVER_URL is not set in environment variables. Using default: http://localhost:5000');
  return 'http://localhost:5000';
};

/**
 * Make API request with proper error handling
 */
export const apiRequest = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

