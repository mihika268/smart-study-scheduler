// Authentication Handler
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const token = utils.storage.get('authToken');
        if (token) {
            api.setToken(token);
            this.loadUserProfile();
        } else {
            this.showAuthContainer();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerFormElement');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Form switching
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');
        
        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterForm();
            });
        }

        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }

        // Logout buttons
        const logoutBtn = document.getElementById('logoutBtn');
        const dropdownLogout = document.getElementById('dropdownLogout');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        if (dropdownLogout) {
            dropdownLogout.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Forgot password
        const forgotPassword = document.getElementById('forgotPassword');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForgotPasswordModal();
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        // Validation
        if (!email || !password) {
            utils.showToast('Please fill in all fields', 'error');
            return;
        }

        if (!utils.isValidEmail(email)) {
            utils.showToast('Please enter a valid email address', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        utils.setLoading(submitBtn, true);

        try {
            const response = await api.login(email, password);
            
            if (response.success) {
                api.setToken(response.token);
                this.currentUser = response.user;
                utils.storage.set('currentUser', response.user);
                
                utils.showToast('Login successful!', 'success');
                this.showAppContainer();
                
                // Load dashboard
                if (window.dashboard) {
                    window.dashboard.init();
                }
            }
        } catch (error) {
            utils.handleError(error, 'Login');
        } finally {
            utils.setLoading(submitBtn, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');

        // Validation
        if (!name || !email || !password) {
            utils.showToast('Please fill in all fields', 'error');
            return;
        }

        if (!utils.isValidEmail(email)) {
            utils.showToast('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            utils.showToast('Password must be at least 6 characters long', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        utils.setLoading(submitBtn, true);

        try {
            const response = await api.register(name, email, password);
            
            if (response.success) {
                api.setToken(response.token);
                this.currentUser = response.user;
                utils.storage.set('currentUser', response.user);
                
                utils.showToast('Account created successfully!', 'success');
                this.showAppContainer();
                
                // Load dashboard
                if (window.dashboard) {
                    window.dashboard.init();
                }
            }
        } catch (error) {
            utils.handleError(error, 'Registration');
        } finally {
            utils.setLoading(submitBtn, false);
        }
    }

    async loadUserProfile() {
        try {
            const response = await api.getProfile();
            
            if (response.success) {
                this.currentUser = response.user;
                utils.storage.set('currentUser', response.user);
                this.updateUserDisplay();
                this.showAppContainer();
                
                // Apply user theme
                utils.applyTheme(response.user.theme, response.user.color_scheme);
                
                // Load dashboard
                if (window.dashboard) {
                    window.dashboard.init();
                }
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
            this.logout();
        }
    }

    updateUserDisplay() {
        if (!this.currentUser) return;

        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const welcomeMessage = document.getElementById('welcomeMessage');

        if (userName) {
            userName.textContent = this.currentUser.name;
        }

        if (userEmail) {
            userEmail.textContent = this.currentUser.email;
        }

        if (welcomeMessage) {
            const hour = new Date().getHours();
            let greeting = 'Good evening';
            if (hour < 12) greeting = 'Good morning';
            else if (hour < 18) greeting = 'Good afternoon';
            
            welcomeMessage.textContent = `${greeting}, ${this.currentUser.name.split(' ')[0]}!`;
        }
    }

    showLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm && registerForm) {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        }
    }

    showRegisterForm() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm && registerForm) {
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        }
    }

    showAuthContainer() {
        const authContainer = document.getElementById('authContainer');
        const appContainer = document.getElementById('appContainer');
        const loadingScreen = document.getElementById('loadingScreen');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        if (authContainer) {
            authContainer.style.display = 'flex';
        }
        
        if (appContainer) {
            appContainer.classList.remove('active');
        }
    }

    showAppContainer() {
        const authContainer = document.getElementById('authContainer');
        const appContainer = document.getElementById('appContainer');
        const loadingScreen = document.getElementById('loadingScreen');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        if (authContainer) {
            authContainer.style.display = 'none';
        }
        
        if (appContainer) {
            appContainer.classList.add('active');
        }

        this.updateUserDisplay();
    }

    showForgotPasswordModal() {
        const modalContent = `
            <form id="forgotPasswordForm">
                <div class="form-group">
                    <label for="forgotEmail">Email Address</label>
                    <input type="email" id="forgotEmail" name="email" required>
                    <small>We'll send you instructions to reset your password.</small>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Send Reset Link</button>
                </div>
            </form>
        `;

        utils.showModal(modalContent, 'Reset Password');

        // Handle form submission
        const forgotForm = document.getElementById('forgotPasswordForm');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = new FormData(e.target).get('email');
                
                if (!utils.isValidEmail(email)) {
                    utils.showToast('Please enter a valid email address', 'error');
                    return;
                }

                // Simulate sending reset email
                utils.showToast('Password reset instructions sent to your email!', 'success');
                utils.hideModal();
            });
        }
    }

    logout() {
        // Clear stored data
        api.setToken(null);
        utils.storage.remove('currentUser');
        this.currentUser = null;

        // Reset theme to default
        utils.applyTheme('light', 'blue');

        // Show auth container
        this.showAuthContainer();
        
        // Clear forms
        const loginForm = document.getElementById('loginFormElement');
        const registerForm = document.getElementById('registerFormElement');
        
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();

        utils.showToast('Logged out successfully', 'info');
    }

    getCurrentUser() {
        return this.currentUser || utils.storage.get('currentUser');
    }

    isAuthenticated() {
        return !!api.token && !!this.getCurrentUser();
    }
}

// Initialize auth manager
window.auth = new AuthManager();
