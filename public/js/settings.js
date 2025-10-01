// Settings Manager
class SettingsManager {
    constructor() {
        this.preferences = null;
        this.user = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        await this.loadSettingsPage();
        await this.loadUserData();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    async loadSettingsPage() {
        const settingsPage = document.getElementById('settingsPage');
        if (!settingsPage) return;

        settingsPage.innerHTML = `
            <div class="settings-container" style="max-width: 800px; margin: 0 auto;">
                <div class="settings-header" style="margin-bottom: 30px;">
                    <h2>Settings</h2>
                    <p style="color: var(--text-secondary);">Customize your study experience</p>
                </div>

                <div class="settings-sections">
                    <!-- Profile Settings -->
                    <div class="settings-section" style="background: var(--bg-primary); border-radius: var(--border-radius); padding: 25px; margin-bottom: 20px; box-shadow: var(--shadow);">
                        <h3 style="margin-bottom: 20px;"><i class="fas fa-user"></i> Profile Settings</h3>
                        
                        <form id="profileSettingsForm">
                            <div class="form-row">
                                <div class="form-col">
                                    <label for="settingsName">Full Name</label>
                                    <input type="text" id="settingsName" name="name" required>
                                </div>
                                <div class="form-col">
                                    <label for="settingsEmail">Email</label>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <input type="email" id="settingsEmail" disabled style="background: var(--bg-secondary); color: var(--text-secondary);">
                                        <button type="button" id="changeEmailBtn" class="btn btn-secondary btn-sm">
                                            <i class="fas fa-edit"></i> Change
                                        </button>
                                    </div>
                                    <small style="color: var(--text-secondary); font-size: 12px;">Click 'Change' to update your email address</small>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="settingsStudyHours">Preferred Daily Study Hours</label>
                                <select id="settingsStudyHours" name="preferred_study_hours">
                                    <option value="1">1 hour</option>
                                    <option value="2">2 hours</option>
                                    <option value="3">3 hours</option>
                                    <option value="4">4 hours</option>
                                    <option value="5">5 hours</option>
                                    <option value="6">6+ hours</option>
                                </select>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Save Profile
                            </button>
                        </form>
                    </div>

                    <!-- Study Preferences -->
                    <div class="settings-section" style="background: var(--bg-primary); border-radius: var(--border-radius); padding: 25px; margin-bottom: 20px; box-shadow: var(--shadow);">
                        <h3 style="margin-bottom: 20px;"><i class="fas fa-clock"></i> Study Preferences</h3>
                        
                        <form id="studyPreferencesForm">
                            <div class="form-row">
                                <div class="form-col">
                                    <label for="pomodoroLength">Pomodoro Length (minutes)</label>
                                    <input type="number" id="pomodoroLength" name="pomodoro_duration" min="15" max="60" value="25">
                                </div>
                                <div class="form-col">
                                    <label for="shortBreak">Short Break (minutes)</label>
                                    <input type="number" id="shortBreak" name="short_break_duration" min="3" max="15" value="5">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-col">
                                    <label for="longBreak">Long Break (minutes)</label>
                                    <input type="number" id="longBreak" name="long_break_duration" min="10" max="30" value="15">
                                </div>
                                <div class="form-col">
                                    <label for="dailyGoal">Daily Goal (hours)</label>
                                    <input type="number" id="dailyGoal" name="daily_goal_hours" min="1" max="12" value="2">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-col">
                                    <label for="preferredDifficulty">Preferred Task Difficulty</label>
                                    <select id="preferredDifficulty" name="preferred_difficulty">
                                        <option value="1">1 - Very Easy</option>
                                        <option value="2">2 - Easy</option>
                                        <option value="3">3 - Medium</option>
                                        <option value="4">4 - Hard</option>
                                        <option value="5">5 - Very Hard</option>
                                    </select>
                                </div>
                                <div class="form-col">
                                    <div class="form-group inline">
                                        <input type="checkbox" id="autoReschedule" name="auto_reschedule">
                                        <label for="autoReschedule">Auto-reschedule missed tasks</label>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Save Preferences
                            </button>
                        </form>
                    </div>

                    <!-- Appearance Settings -->
                    <div class="settings-section" style="background: var(--bg-primary); border-radius: var(--border-radius); padding: 25px; margin-bottom: 20px; box-shadow: var(--shadow);">
                        <h3 style="margin-bottom: 20px;"><i class="fas fa-palette"></i> Appearance</h3>
                        
                        <form id="appearanceForm">
                            <div class="form-row">
                                <div class="form-col">
                                    <label for="themeSelect">Theme</label>
                                    <select id="themeSelect" name="theme">
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                        <option value="pastel">Pastel</option>
                                        <option value="minimal">Minimal</option>
                                        <option value="high-contrast">High Contrast</option>
                                    </select>
                                </div>
                                <div class="form-col">
                                    <label for="colorScheme">Color Scheme</label>
                                    <select id="colorScheme" name="color_scheme">
                                        <option value="blue">Blue</option>
                                        <option value="purple">Purple</option>
                                        <option value="green">Green</option>
                                        <option value="orange">Orange</option>
                                        <option value="pink">Pink</option>
                                        <option value="red">Red</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="theme-preview" style="margin: 20px 0; padding: 20px; border-radius: var(--border-radius); border: 2px solid var(--border-color);">
                                <h4 style="margin-bottom: 10px;">Preview</h4>
                                <div class="preview-elements" style="display: flex; gap: 10px; align-items: center;">
                                    <div class="preview-card" style="background: var(--bg-secondary); padding: 10px; border-radius: 4px; flex: 1;">
                                        <div style="width: 100%; height: 4px; background: var(--primary-color); border-radius: 2px; margin-bottom: 8px;"></div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">Sample content</div>
                                    </div>
                                    <button class="btn btn-primary btn-sm" style="pointer-events: none;">Button</button>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Apply Theme
                            </button>
                        </form>
                    </div>

                    <!-- Notification Settings -->
                    <div class="settings-section" style="background: var(--bg-primary); border-radius: var(--border-radius); padding: 25px; margin-bottom: 20px; box-shadow: var(--shadow);">
                        <h3 style="margin-bottom: 20px;"><i class="fas fa-bell"></i> Notifications</h3>
                        
                        <form id="notificationForm">
                            <div class="notification-options">
                                <div class="form-group inline" style="margin-bottom: 15px;">
                                    <input type="checkbox" id="enableNotifications" name="notifications_enabled">
                                    <label for="enableNotifications">Enable notifications</label>
                                </div>
                                
                                <div class="form-group inline" style="margin-bottom: 15px;">
                                    <input type="checkbox" id="enableSounds" name="sound_enabled">
                                    <label for="enableSounds">Enable notification sounds</label>
                                </div>
                                
                                <div class="notification-types" style="margin-left: 20px;">
                                    <div class="form-group inline" style="margin-bottom: 10px;">
                                        <input type="checkbox" id="taskReminders" checked>
                                        <label for="taskReminders">Task reminders</label>
                                    </div>
                                    <div class="form-group inline" style="margin-bottom: 10px;">
                                        <input type="checkbox" id="breakReminders" checked>
                                        <label for="breakReminders">Break reminders</label>
                                    </div>
                                    <div class="form-group inline" style="margin-bottom: 10px;">
                                        <input type="checkbox" id="achievementNotifications" checked>
                                        <label for="achievementNotifications">Achievement notifications</label>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Save Notifications
                            </button>
                        </form>
                    </div>

                    <!-- Data & Privacy -->
                    <div class="settings-section" style="background: var(--bg-primary); border-radius: var(--border-radius); padding: 25px; margin-bottom: 20px; box-shadow: var(--shadow);">
                        <h3 style="margin-bottom: 20px;"><i class="fas fa-shield-alt"></i> Data & Privacy</h3>
                        
                        <div class="data-actions" style="display: flex; gap: 15px; flex-wrap: wrap;">
                            <button id="exportDataBtn" class="btn btn-secondary">
                                <i class="fas fa-download"></i> Export My Data
                            </button>
                            <button id="changePasswordBtn" class="btn btn-secondary">
                                <i class="fas fa-key"></i> Change Password
                            </button>
                            <button id="deleteAccountBtn" class="btn btn-danger">
                                <i class="fas fa-trash"></i> Delete Account
                            </button>
                        </div>
                        
                        <div class="privacy-info" style="margin-top: 20px; padding: 15px; background: var(--bg-secondary); border-radius: var(--border-radius);">
                            <h4 style="margin-bottom: 10px;">Privacy Information</h4>
                            <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary); font-size: 14px;">
                                <li>Your data is stored locally and securely</li>
                                <li>We don't share your personal information</li>
                                <li>You can export or delete your data anytime</li>
                                <li>Study sessions are anonymized for analytics</li>
                            </ul>
                        </div>
                    </div>

                    <!-- About -->
                    <div class="settings-section" style="background: var(--bg-primary); border-radius: var(--border-radius); padding: 25px; box-shadow: var(--shadow);">
                        <h3 style="margin-bottom: 20px;"><i class="fas fa-info-circle"></i> About</h3>
                        
                        <div class="about-info">
                            <div class="app-info" style="text-align: center; margin-bottom: 20px;">
                                <div class="app-icon" style="width: 60px; height: 60px; background: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: white; font-size: 24px;">
                                    <i class="fas fa-graduation-cap"></i>
                                </div>
                                <h4>Smart Study Scheduler</h4>
                                <p style="color: var(--text-secondary); margin: 5px 0;">Version 1.0.0</p>
                                <p style="color: var(--text-secondary); font-size: 14px;">Your AI-powered study companion</p>
                            </div>
                            
                            <div class="credits" style="text-align: center; color: var(--text-secondary); font-size: 14px;">
                                <p>Built with ❤️ for students who want to optimize their learning</p>
                                <p style="margin-top: 10px;">
                                    <a href="#" style="color: var(--primary-color); text-decoration: none;">Documentation</a> • 
                                    <a href="#" style="color: var(--primary-color); text-decoration: none;">Support</a> • 
                                    <a href="#" style="color: var(--primary-color); text-decoration: none;">GitHub</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Profile settings form
        const profileForm = document.getElementById('profileSettingsForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        // Study preferences form
        const preferencesForm = document.getElementById('studyPreferencesForm');
        if (preferencesForm) {
            preferencesForm.addEventListener('submit', (e) => this.handlePreferencesUpdate(e));
        }

        // Appearance form
        const appearanceForm = document.getElementById('appearanceForm');
        if (appearanceForm) {
            appearanceForm.addEventListener('submit', (e) => this.handleAppearanceUpdate(e));
            
            // Live preview
            const themeSelect = document.getElementById('themeSelect');
            const colorScheme = document.getElementById('colorScheme');
            
            if (themeSelect) {
                themeSelect.addEventListener('change', () => this.previewTheme());
            }
            if (colorScheme) {
                colorScheme.addEventListener('change', () => this.previewTheme());
            }
        }

        // Notification form
        const notificationForm = document.getElementById('notificationForm');
        if (notificationForm) {
            notificationForm.addEventListener('submit', (e) => this.handleNotificationUpdate(e));
        }

        // Data action buttons
        const exportBtn = document.getElementById('exportDataBtn');
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        const changeEmailBtn = document.getElementById('changeEmailBtn');
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.showChangePasswordModal());
        }
        if (changeEmailBtn) {
            changeEmailBtn.addEventListener('click', () => this.showChangeEmailModal());
        }
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => this.showDeleteAccountModal());
        }
    }

    async loadUserData() {
        try {
            // Load user profile
            const profileResponse = await api.getProfile();
            if (profileResponse.success) {
                this.user = profileResponse.user;
                this.populateProfileForm();
            }

            // Load preferences
            const preferencesResponse = await api.getPreferences();
            if (preferencesResponse.success) {
                this.preferences = preferencesResponse.preferences;
                this.populatePreferencesForm();
                this.populateNotificationForm();
            }

        } catch (error) {
            utils.handleError(error, 'Loading user data');
        }
    }

    populateProfileForm() {
        if (!this.user) return;

        const nameInput = document.getElementById('settingsName');
        const emailInput = document.getElementById('settingsEmail');
        const studyHoursSelect = document.getElementById('settingsStudyHours');
        const themeSelect = document.getElementById('themeSelect');
        const colorSchemeSelect = document.getElementById('colorScheme');

        if (nameInput) nameInput.value = this.user.name || '';
        if (emailInput) emailInput.value = this.user.email || '';
        if (studyHoursSelect) studyHoursSelect.value = this.user.preferred_study_hours || 2;
        if (themeSelect) themeSelect.value = this.user.theme || 'light';
        if (colorSchemeSelect) colorSchemeSelect.value = this.user.color_scheme || 'blue';
    }

    populatePreferencesForm() {
        if (!this.preferences) return;

        const fields = {
            pomodoroLength: this.preferences.pomodoro_duration || 25,
            shortBreak: this.preferences.short_break_duration || 5,
            longBreak: this.preferences.long_break_duration || 15,
            dailyGoal: this.preferences.daily_goal_hours || 2,
            preferredDifficulty: this.preferences.preferred_difficulty || 3,
            autoReschedule: this.preferences.auto_reschedule || false
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
    }

    populateNotificationForm() {
        if (!this.preferences) return;

        const enableNotifications = document.getElementById('enableNotifications');
        const enableSounds = document.getElementById('enableSounds');

        if (enableNotifications) {
            enableNotifications.checked = this.preferences.notifications_enabled !== false;
        }
        if (enableSounds) {
            enableSounds.checked = this.preferences.sound_enabled !== false;
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Remove email from data since it's handled separately
        delete data.email;
        
        data.preferred_study_hours = parseInt(data.preferred_study_hours);

        const submitBtn = form.querySelector('button[type="submit"]');
        utils.setLoading(submitBtn, true);

        try {
            const response = await api.updateProfile(data);
            
            if (response.success) {
                utils.showToast('Profile updated successfully!', 'success');
                
                // Update local user data
                Object.assign(this.user, data);
                window.auth.currentUser = this.user;
                utils.storage.set('currentUser', this.user);
                window.auth.updateUserDisplay();
            }
        } catch (error) {
            utils.handleError(error, 'Updating profile');
        } finally {
            utils.setLoading(submitBtn, false);
        }
    }

    async handlePreferencesUpdate(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Convert numeric fields
        ['pomodoro_duration', 'short_break_duration', 'long_break_duration', 'daily_goal_hours', 'preferred_difficulty'].forEach(field => {
            if (data[field]) data[field] = parseInt(data[field]);
        });
        
        // Convert boolean fields
        data.auto_reschedule = !!data.auto_reschedule;

        const submitBtn = form.querySelector('button[type="submit"]');
        utils.setLoading(submitBtn, true);

        try {
            const response = await api.updatePreferences(data);
            
            if (response.success) {
                utils.showToast('Study preferences updated!', 'success');
                Object.assign(this.preferences, data);
            }
        } catch (error) {
            utils.handleError(error, 'Updating preferences');
        } finally {
            utils.setLoading(submitBtn, false);
        }
    }

    async handleAppearanceUpdate(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const submitBtn = form.querySelector('button[type="submit"]');
        utils.setLoading(submitBtn, true);

        try {
            const response = await api.updateProfile(data);
            
            if (response.success) {
                utils.showToast('Theme applied successfully!', 'success');
                
                // Apply theme immediately
                utils.applyTheme(data.theme, data.color_scheme);
                
                // Update local user data
                Object.assign(this.user, data);
                window.auth.currentUser = this.user;
                utils.storage.set('currentUser', this.user);
            }
        } catch (error) {
            utils.handleError(error, 'Updating theme');
        } finally {
            utils.setLoading(submitBtn, false);
        }
    }

    async handleNotificationUpdate(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Convert boolean fields
        data.notifications_enabled = !!data.notifications_enabled;
        data.sound_enabled = !!data.sound_enabled;

        const submitBtn = form.querySelector('button[type="submit"]');
        utils.setLoading(submitBtn, true);

        try {
            const response = await api.updatePreferences(data);
            
            if (response.success) {
                utils.showToast('Notification settings updated!', 'success');
                Object.assign(this.preferences, data);
            }
        } catch (error) {
            utils.handleError(error, 'Updating notifications');
        } finally {
            utils.setLoading(submitBtn, false);
        }
    }

    previewTheme() {
        const themeSelect = document.getElementById('themeSelect');
        const colorSchemeSelect = document.getElementById('colorScheme');
        
        if (themeSelect && colorSchemeSelect) {
            utils.applyTheme(themeSelect.value, colorSchemeSelect.value);
        }
    }

    async exportData() {
        const exportBtn = document.getElementById('exportDataBtn');
        utils.setLoading(exportBtn, true);

        try {
            const response = await api.exportData();
            
            if (response.success) {
                // Create and download JSON file
                const dataStr = JSON.stringify(response.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `study-scheduler-data-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                utils.showToast('Data exported successfully!', 'success');
            }
        } catch (error) {
            utils.handleError(error, 'Exporting data');
        } finally {
            utils.setLoading(exportBtn, false);
        }
    }

    showChangePasswordModal() {
        const modalContent = `
            <form id="changePasswordForm">
                <div class="form-group">
                    <label for="currentPassword">Current Password</label>
                    <input type="password" id="currentPassword" name="currentPassword" required>
                </div>
                
                <div class="form-group">
                    <label for="newPassword">New Password</label>
                    <input type="password" id="newPassword" name="newPassword" required minlength="6">
                </div>
                
                <div class="form-group">
                    <label for="confirmPassword">Confirm New Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6">
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Change Password</button>
                </div>
            </form>
        `;

        utils.showModal(modalContent, 'Change Password');

        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => this.handleChangePassword(e));
        }
    }

    showChangeEmailModal() {
        const modalContent = `
            <form id="changeEmailForm">
                <div class="form-group">
                    <label for="currentEmailDisplay">Current Email</label>
                    <input type="email" id="currentEmailDisplay" value="${this.user?.email || ''}" disabled style="background: var(--bg-secondary); color: var(--text-secondary);">
                </div>
                
                <div class="form-group">
                    <label for="newEmail">New Email</label>
                    <input type="email" id="newEmail" name="newEmail" required>
                </div>
                
                <div class="form-group">
                    <label for="confirmEmailPassword">Enter Password to Confirm</label>
                    <input type="password" id="confirmEmailPassword" name="password" required>
                    <small style="color: var(--text-secondary); font-size: 12px;">We need your password to verify this change</small>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Change Email</button>
                </div>
            </form>
        `;

        utils.showModal(modalContent, 'Change Email');

        const changeEmailForm = document.getElementById('changeEmailForm');
        if (changeEmailForm) {
            changeEmailForm.addEventListener('submit', (e) => this.handleChangeEmail(e));
        }
    }

    async handleChangePassword(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (newPassword !== confirmPassword) {
            utils.showToast('New passwords do not match', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        utils.setLoading(submitBtn, true);

        try {
            const response = await api.changePassword(currentPassword, newPassword);
            
            if (response.success) {
                utils.showToast('Password changed successfully!', 'success');
                utils.hideModal();
            }
        } catch (error) {
            utils.handleError(error, 'Changing password');
        } finally {
            utils.setLoading(submitBtn, false);
        }
    }

    async handleChangeEmail(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const newEmail = formData.get('newEmail');
        const password = formData.get('password');

        // Validate email format
        if (!utils.isValidEmail(newEmail)) {
            utils.showToast('Please enter a valid email address', 'error');
            return;
        }

        // Check if email is different from current
        if (newEmail === this.user?.email) {
            utils.showToast('New email must be different from current email', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        utils.setLoading(submitBtn, true);

        try {
            const response = await api.changeEmail(newEmail, password);
            
            if (response.success) {
                utils.showToast('Email changed successfully!', 'success');
                utils.hideModal();
                
                // Update local user data and token
                if (response.token) {
                    api.setToken(response.token);
                }
                if (response.user) {
                    Object.assign(this.user, response.user);
                    window.auth.currentUser = this.user;
                    utils.storage.set('currentUser', this.user);
                    window.auth.updateUserDisplay();
                }
                
                // Refresh the settings page to show new email
                this.populateProfileForm();
            }
        } catch (error) {
            utils.handleError(error, 'Changing email');
        } finally {
            utils.setLoading(submitBtn, false);
        }
    }

    showDeleteAccountModal() {
        const modalContent = `
            <div style="text-align: center;">
                <div style="color: var(--danger-color); font-size: 48px; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 style="color: var(--danger-color); margin-bottom: 15px;">Delete Account</h3>
                <p style="margin-bottom: 20px; color: var(--text-secondary);">
                    This action cannot be undone. All your data, including tasks, study sessions, and achievements will be permanently deleted.
                </p>
                
                <form id="deleteAccountForm">
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label for="deletePassword">Enter your password to confirm</label>
                        <input type="password" id="deletePassword" name="password" required>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
                        <button type="submit" class="btn btn-danger">Delete My Account</button>
                    </div>
                </form>
            </div>
        `;

        utils.showModal(modalContent, 'Delete Account');

        const deleteAccountForm = document.getElementById('deleteAccountForm');
        if (deleteAccountForm) {
            deleteAccountForm.addEventListener('submit', (e) => this.handleDeleteAccount(e));
        }
    }

    async handleDeleteAccount(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const password = formData.get('password');

        const submitBtn = form.querySelector('button[type="submit"]');
        utils.setLoading(submitBtn, true);

        try {
            const response = await api.deleteAccount(password);
            
            if (response.success) {
                utils.showToast('Account deleted successfully', 'info');
                utils.hideModal();
                
                // Logout user
                setTimeout(() => {
                    window.auth.logout();
                }, 2000);
            }
        } catch (error) {
            utils.handleError(error, 'Deleting account');
        } finally {
            utils.setLoading(submitBtn, false);
        }
    }

    async refresh() {
        await this.loadUserData();
    }
}

// Initialize settings manager
window.settings = new SettingsManager();
