// Authentication service with Flask backend integration
// Use Vite environment variable if provided, else fallback
const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:5000/api';

// API helper function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// User storage helpers
const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', user.token || '');
  } else {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};

export const authService = {
  // Login function
  async login(email, password) {
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Store user data and token
      const userData = response.user;
      userData.token = response.token;
      setStoredUser(userData);

      return {
        user: userData,
        token: response.token,
        message: response.message
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Register function
  async register(username, email, password) {
    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });

      // Store user data and token
      const userData = response.user;
      userData.token = response.token;
      setStoredUser(userData);

      return {
        user: userData,
        token: response.token,
        message: response.message
      };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // Get current user from cache or API
  async getCurrentUser() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    // First try to return cached user if available
    const cachedUser = getStoredUser();
    if (cachedUser) {
      return cachedUser;
    }

    // If no cached user but token exists, try to get from API
    try {
      const response = await apiCall('/auth/me');
      setStoredUser(response);
      return response;
    } catch (error) {
      // Token is invalid, clear stored data
      setStoredUser(null);
      throw new Error('Not authenticated');
    }
  },

  // Update user profile
  async updateProfile(data) {
    try {
      const response = await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      // Update stored user data
      setStoredUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword }),
      });

      return {
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  }
};

export default { apiCall };
