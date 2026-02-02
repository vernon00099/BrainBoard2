// API Configuration and Security Module
// This module handles all API interactions with security features

class APIConfig {
  constructor() {
    // API Base URL - Change this to your actual API endpoint
    this.baseURL = 'https://api.brainboard.example.com/v1';
    
    // Security tokens
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    // Rate limiting
    this.requestCount = 0;
    this.requestWindow = 60000; // 1 minute
    this.maxRequestsPerWindow = 100;
    this.lastResetTime = Date.now();
    
    // CSRF Protection
    this.csrfToken = null;
    
    // Initialize security features
    this.initializeSecurity();
  }

  // Initialize security features
  initializeSecurity() {
    // Generate CSRF token
    this.csrfToken = this.generateCSRFToken();
    
    // Load tokens from secure storage
    this.loadTokens();
    
    // Set up token refresh timer
    this.setupTokenRefresh();
    
    // Initialize encryption keys
    this.initializeEncryption();
  }

  // Generate CSRF Token
  generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Initialize encryption for sensitive data
  initializeEncryption() {
    // Store encryption key in session (in production, use more secure methods)
    if (!sessionStorage.getItem('encryptionKey')) {
      const key = this.generateCSRFToken();
      sessionStorage.setItem('encryptionKey', key);
    }
  }

  // Simple XOR encryption for demonstration (use proper encryption in production)
  encrypt(data) {
    const key = sessionStorage.getItem('encryptionKey') || '';
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(encrypted);
  }

  // Simple XOR decryption
  decrypt(encryptedData) {
    const key = sessionStorage.getItem('encryptionKey') || '';
    const decoded = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return decrypted;
  }

  // Load tokens from secure storage
  loadTokens() {
    try {
      const encryptedAccess = localStorage.getItem('access_token');
      const encryptedRefresh = localStorage.getItem('refresh_token');
      const expiry = localStorage.getItem('token_expiry');

      if (encryptedAccess) {
        this.accessToken = this.decrypt(encryptedAccess);
      }
      if (encryptedRefresh) {
        this.refreshToken = this.decrypt(encryptedRefresh);
      }
      if (expiry) {
        this.tokenExpiry = parseInt(expiry);
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
      this.clearTokens();
    }
  }

  // Save tokens to secure storage
  saveTokens(accessToken, refreshToken, expiresIn) {
    try {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.tokenExpiry = Date.now() + (expiresIn * 1000);

      localStorage.setItem('access_token', this.encrypt(accessToken));
      localStorage.setItem('refresh_token', this.encrypt(refreshToken));
      localStorage.setItem('token_expiry', this.tokenExpiry.toString());
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  // Clear tokens
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
  }

  // Check if token is expired
  isTokenExpired() {
    if (!this.tokenExpiry) return true;
    return Date.now() >= this.tokenExpiry - 60000; // Refresh 1 minute before expiry
  }

  // Refresh access token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.saveTokens(data.access_token, data.refresh_token, data.expires_in);
      
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      return false;
    }
  }

  // Setup automatic token refresh
  setupTokenRefresh() {
    setInterval(() => {
      if (this.accessToken && this.isTokenExpired()) {
        this.refreshAccessToken();
      }
    }, 30000); // Check every 30 seconds
  }

  // Rate limiting check
  checkRateLimit() {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - this.lastResetTime > this.requestWindow) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    // Check if limit exceeded
    if (this.requestCount >= this.maxRequestsPerWindow) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    this.requestCount++;
  }

  // Sanitize input to prevent XSS
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Validate email format
  validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Validate password strength
  validatePassword(password) {
    return {
      isValid: password.length >= 8 &&
               /[A-Z]/.test(password) &&
               /[a-z]/.test(password) &&
               /[0-9]/.test(password) &&
               /[!@#$%^&*]/.test(password),
      message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    };
  }

  // Make secure API request
  async request(endpoint, options = {}) {
    try {
      // Check rate limit
      this.checkRateLimit();

      // Check token expiry and refresh if needed
      if (this.accessToken && this.isTokenExpired()) {
        await this.refreshAccessToken();
      }

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.csrfToken,
        ...options.headers
      };

      // Add authorization token if available
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      // Make request
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for session management
      });

      // Handle response
      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - clear tokens and redirect to login
          this.clearTokens();
          window.location.href = '/login.html';
          throw new Error('Unauthorized');
        }
        
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email, password) {
    // Validate inputs
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // Make login request
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: this.sanitizeInput(email),
        password: password, // Don't sanitize password
        csrf_token: this.csrfToken
      })
    });

    // Save tokens
    this.saveTokens(
      response.access_token,
      response.refresh_token,
      response.expires_in
    );

    return response;
  }

  async signup(userData) {
    // Validate inputs
    if (!this.validateEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    const passwordValidation = this.validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // Sanitize user data
    const sanitizedData = {
      firstName: this.sanitizeInput(userData.firstName),
      lastName: this.sanitizeInput(userData.lastName),
      email: this.sanitizeInput(userData.email),
      password: userData.password, // Don't sanitize password
      phone: userData.phone ? this.sanitizeInput(userData.phone) : '',
      newsletter: Boolean(userData.newsletter),
      csrf_token: this.csrfToken
    };

    // Make signup request
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(sanitizedData)
    });

    // Save tokens
    this.saveTokens(
      response.access_token,
      response.refresh_token,
      response.expires_in
    );

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
      sessionStorage.clear();
    }
  }

  // User endpoints
  async getProfile() {
    return await this.request('/user/profile', {
      method: 'GET'
    });
  }

  async updateProfile(userData) {
    const sanitizedData = {
      firstName: this.sanitizeInput(userData.firstName),
      lastName: this.sanitizeInput(userData.lastName),
      phone: userData.phone ? this.sanitizeInput(userData.phone) : ''
    };

    return await this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(sanitizedData)
    });
  }

  // Post endpoints
  async getPosts(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return await this.request(`/posts?${queryParams}`, {
      method: 'GET'
    });
  }

  async createPost(postData) {
    const sanitizedData = {
      content: this.sanitizeInput(postData.content),
      type: this.sanitizeInput(postData.type),
      media: postData.media || []
    };

    return await this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(sanitizedData)
    });
  }

  async likePost(postId) {
    return await this.request(`/posts/${postId}/like`, {
      method: 'POST'
    });
  }

  async commentOnPost(postId, comment) {
    return await this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content: this.sanitizeInput(comment)
      })
    });
  }

  // File upload with security
  async uploadFile(file, type) {
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Validate file type
    const allowedTypes = {
      'photo': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      'video': ['video/mp4', 'video/webm'],
      'document': ['application/pdf', 'application/msword', 'text/plain']
    };

    if (!allowedTypes[type]?.includes(file.type)) {
      throw new Error('Invalid file type');
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('csrf_token', this.csrfToken);

    // Check rate limit
    this.checkRateLimit();

    // Upload file
    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-CSRF-Token': this.csrfToken
      },
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    return await response.json();
  }

  // Search with SQL injection prevention
  async search(query) {
    return await this.request('/search', {
      method: 'POST',
      body: JSON.stringify({
        query: this.sanitizeInput(query),
        csrf_token: this.csrfToken
      })
    });
  }
}

// Security utilities
class SecurityUtils {
  // Check for SQL injection patterns
  static detectSQLInjection(input) {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(--|\/\*|\*\/|;)/g,
      /(\bOR\b|\bAND\b).*=/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Check for XSS patterns
  static detectXSS(input) {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Generate secure random string
  static generateSecureRandom(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Hash password (for client-side validation only)
  static async hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validate session integrity
  static validateSession() {
    const sessionStart = sessionStorage.getItem('sessionStart');
    if (!sessionStart) {
      sessionStorage.setItem('sessionStart', Date.now().toString());
      return true;
    }

    const sessionDuration = Date.now() - parseInt(sessionStart);
    const maxDuration = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionDuration > maxDuration) {
      sessionStorage.clear();
      return false;
    }

    return true;
  }

  // Content Security Policy checker
  static checkCSP() {
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspMeta) {
      console.warn('Content Security Policy not set');
    }
  }
}

// Export for use in other files
window.APIConfig = APIConfig;
window.SecurityUtils = SecurityUtils;
