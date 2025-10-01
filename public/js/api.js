// API Handler
class API {
    constructor() {
        this.baseURL = '/api';
        this.token = utils.storage.get('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            utils.storage.set('authToken', token);
        } else {
            utils.storage.remove('authToken');
        }
    }

    // Get headers with authentication
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Auth endpoints
    async login(email, password) {
        return this.post('/auth/login', { email, password });
    }

    async register(name, email, password) {
        return this.post('/auth/register', { name, email, password });
    }

    async getProfile() {
        return this.get('/auth/profile');
    }

    async updateProfile(data) {
        return this.put('/auth/profile', data);
    }

    async changePassword(currentPassword, newPassword) {
        return this.put('/auth/change-password', { currentPassword, newPassword });
    }

    async changeEmail(newEmail, password) {
        return this.put('/auth/change-email', { newEmail, password });
    }

    // Task endpoints
    async getTasks(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/tasks${queryString ? '?' + queryString : ''}`);
    }

    async getTask(id) {
        return this.get(`/tasks/${id}`);
    }

    async createTask(data) {
        return this.post('/tasks', data);
    }

    async updateTask(id, data) {
        return this.put(`/tasks/${id}`, data);
    }

    async deleteTask(id) {
        return this.delete(`/tasks/${id}`);
    }

    async generateSchedule(date, preferences = {}) {
        return this.post('/tasks/generate-schedule', { date, preferences });
    }

    async getTodaySchedule() {
        return this.get('/tasks/schedule/today');
    }

    // Analytics endpoints
    async getDashboardAnalytics(period = '7') {
        return this.get(`/analytics/dashboard?period=${period}`);
    }

    async getStudyPatterns(period = '30') {
        return this.get(`/analytics/patterns?period=${period}`);
    }

    async startStudySession(data) {
        return this.post('/analytics/session/start', data);
    }

    async endStudySession(sessionId, data) {
        return this.put(`/analytics/session/${sessionId}/end`, data);
    }

    async getStudySessions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/analytics/sessions${queryString ? '?' + queryString : ''}`);
    }

    // User endpoints
    async getPreferences() {
        return this.get('/users/preferences');
    }

    async updatePreferences(data) {
        return this.put('/users/preferences', data);
    }

    async getDailyQuote(category = null) {
        return this.get(`/users/quote${category ? '?category=' + category : ''}`);
    }

    async getQuoteCategories() {
        return this.get('/users/quote-categories');
    }

    async getAchievements() {
        return this.get('/users/achievements');
    }

    async getStreaks() {
        return this.get('/users/streaks');
    }

    async getSubjects() {
        return this.get('/users/subjects');
    }

    async exportData() {
        return this.get('/users/export');
    }

    async deleteAccount(confirmPassword) {
        return this.delete('/users/account', { confirmPassword });
    }
}

// Create global API instance
window.api = new API();
