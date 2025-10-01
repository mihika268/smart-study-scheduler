// Main Application Controller
class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.isInitialized = false;
        this.init();
    }

    async init() {
        if (this.isInitialized) return;

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        try {
            this.setupEventListeners();
            this.setupThemeToggle();
            this.setupMobileMenu();
            this.setupUserMenu();
            this.isInitialized = true;
            
            // Hide loading screen after a short delay
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen && !window.auth.isAuthenticated()) {
                    loadingScreen.style.display = 'none';
                }
            }, 1000);

        } catch (error) {
            console.error('App initialization error:', error);
        }
    }

    setupEventListeners() {
        // Navigation menu items
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    this.showPage(page);
                }
            });
        });

        // Modal overlay click to close
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    utils.hideModal();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        themeToggle.addEventListener('click', () => {
            const body = document.body;
            const isDark = body.classList.contains('dark-theme');
            
            if (isDark) {
                body.classList.remove('dark-theme');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                utils.storage.set('theme', 'light');
            } else {
                body.classList.add('dark-theme');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                utils.storage.set('theme', 'dark');
            }

            // Update user profile if authenticated
            if (window.auth.isAuthenticated()) {
                const theme = isDark ? 'light' : 'dark';
                api.updateProfile({ theme }).catch(console.error);
            }
        });

        // Load saved theme
        const savedTheme = utils.storage.get('theme', 'light');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                        sidebar.classList.remove('active');
                    }
                }
            });
        }
    }

    setupUserMenu() {
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userMenuDropdown = document.getElementById('userMenuDropdown');
        
        if (userMenuBtn && userMenuDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenuDropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userMenuDropdown.classList.remove('active');
            });

            // Handle dropdown menu items
            userMenuDropdown.addEventListener('click', (e) => {
                e.preventDefault();
                const href = e.target.closest('a')?.getAttribute('href');
                
                if (href === '#profile') {
                    this.showProfileModal();
                } else if (href === '#settings') {
                    this.showPage('settings');
                } else if (href === '#help') {
                    this.showHelpModal();
                }
                
                userMenuDropdown.classList.remove('active');
            });
        }
    }

    showPage(pageName) {
        // Update current page
        this.currentPage = pageName;

        // Update active menu item
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = this.getPageTitle(pageName);
        }

        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        // Show target page
        const targetPage = document.getElementById(`${pageName}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Initialize page-specific functionality
        this.initializePage(pageName);

        // Close mobile menu
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
        }
    }

    getPageTitle(pageName) {
        const titles = {
            dashboard: 'Dashboard',
            tasks: 'Tasks',
            schedule: 'Schedule',
            analytics: 'Analytics',
            timer: 'Study Timer',
            achievements: 'Achievements',
            settings: 'Settings'
        };
        return titles[pageName] || 'Smart Study Scheduler';
    }

    async initializePage(pageName) {
        try {
            switch (pageName) {
                case 'dashboard':
                    if (window.dashboard) {
                        await window.dashboard.init();
                    }
                    break;
                case 'tasks':
                    if (window.tasks) {
                        await window.tasks.init();
                    }
                    break;
                case 'schedule':
                    if (window.schedule) {
                        await window.schedule.init();
                    }
                    break;
                case 'analytics':
                    if (window.analytics) {
                        await window.analytics.init();
                    }
                    break;
                case 'timer':
                    if (window.timer) {
                        await window.timer.init();
                    }
                    break;
                case 'achievements':
                    if (window.achievements) {
                        await window.achievements.init();
                    }
                    break;
                case 'settings':
                    if (window.settings) {
                        await window.settings.init();
                    }
                    break;
            }
        } catch (error) {
            console.error(`Error initializing ${pageName} page:`, error);
        }
    }

    showProfileModal() {
        const user = window.auth.getCurrentUser();
        if (!user) return;

        const modalContent = `
            <form id="profileForm">
                <div class="form-group">
                    <label for="profileName">Full Name</label>
                    <input type="text" id="profileName" name="name" value="${user.name}" required>
                </div>
                <div class="form-group">
                    <label for="profileEmail">Email</label>
                    <input type="email" id="profileEmail" value="${user.email}" disabled>
                    <small>Email cannot be changed</small>
                </div>
                <div class="form-row">
                    <div class="form-col">
                        <label for="profileTheme">Theme</label>
                        <select id="profileTheme" name="theme">
                            <option value="light" ${user.theme === 'light' ? 'selected' : ''}>Light</option>
                            <option value="dark" ${user.theme === 'dark' ? 'selected' : ''}>Dark</option>
                            <option value="pastel" ${user.theme === 'pastel' ? 'selected' : ''}>Pastel</option>
                            <option value="minimal" ${user.theme === 'minimal' ? 'selected' : ''}>Minimal</option>
                        </select>
                    </div>
                    <div class="form-col">
                        <label for="profileColorScheme">Color Scheme</label>
                        <select id="profileColorScheme" name="color_scheme">
                            <option value="blue" ${user.color_scheme === 'blue' ? 'selected' : ''}>Blue</option>
                            <option value="purple" ${user.color_scheme === 'purple' ? 'selected' : ''}>Purple</option>
                            <option value="green" ${user.color_scheme === 'green' ? 'selected' : ''}>Green</option>
                            <option value="orange" ${user.color_scheme === 'orange' ? 'selected' : ''}>Orange</option>
                            <option value="pink" ${user.color_scheme === 'pink' ? 'selected' : ''}>Pink</option>
                            <option value="red" ${user.color_scheme === 'red' ? 'selected' : ''}>Red</option>
                        </select>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        `;

        utils.showModal(modalContent, 'Edit Profile');

        // Handle form submission
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateProfile(e.target);
            });
        }
    }

    async updateProfile(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const submitBtn = form.querySelector('button[type="submit"]');
        utils.setLoading(submitBtn, true);

        try {
            const response = await api.updateProfile(data);
            
            if (response.success) {
                // Update local user data
                const user = window.auth.getCurrentUser();
                Object.assign(user, data);
                utils.storage.set('currentUser', user);
                
                // Apply new theme
                utils.applyTheme(data.theme, data.color_scheme);
                
                // Update display
                window.auth.updateUserDisplay();
                
                utils.showToast('Profile updated successfully!', 'success');
                utils.hideModal();
            }
        } catch (error) {
            utils.handleError(error, 'Profile update');
        } finally {
            utils.setLoading(submitBtn, false);
        }
    }

    showHelpModal() {
        const modalContent = `
            <div style="max-width: 500px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <i class="fas fa-question-circle" style="font-size: 48px; color: var(--primary-color); margin-bottom: 15px;"></i>
                    <h3>Help & Support</h3>
                </div>
                
                <div class="help-section" style="margin-bottom: 20px;">
                    <h4><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h4>
                    <div style="background: var(--bg-secondary); padding: 15px; border-radius: var(--border-radius); margin-top: 10px;">
                        <div><kbd>Ctrl + N</kbd> - Add new task</div>
                        <div><kbd>Ctrl + T</kbd> - Start timer</div>
                        <div><kbd>Ctrl + D</kbd> - Go to dashboard</div>
                        <div><kbd>Esc</kbd> - Close modal</div>
                    </div>
                </div>
                
                <div class="help-section" style="margin-bottom: 20px;">
                    <h4><i class="fas fa-lightbulb"></i> Tips</h4>
                    <ul style="margin-left: 20px; margin-top: 10px;">
                        <li>Use the AI scheduler to optimize your study time</li>
                        <li>Set realistic daily goals for better consistency</li>
                        <li>Take regular breaks using the Pomodoro technique</li>
                        <li>Track your mood to identify optimal study times</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <button class="btn btn-primary" onclick="hideModal()">Got it!</button>
                </div>
            </div>
        `;

        utils.showModal(modalContent, 'Help & Support');
    }

    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (e.key === 'Escape') {
                utils.hideModal();
            }
            return;
        }

        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    if (window.tasks) {
                        window.tasks.showAddTaskModal();
                    }
                    break;
                case 't':
                    e.preventDefault();
                    this.showPage('timer');
                    break;
                case 'd':
                    e.preventDefault();
                    this.showPage('dashboard');
                    break;
            }
        } else if (e.key === 'Escape') {
            utils.hideModal();
        }
    }

    getCurrentPage() {
        return this.currentPage;
    }
}

// Initialize app when DOM is ready
window.app = new App();
