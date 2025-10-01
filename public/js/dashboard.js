// Dashboard Manager
class DashboardManager {
    constructor() {
        this.analytics = null;
        this.todaySchedule = [];
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            await this.loadDashboardData();
            await this.loadDailyQuote();
            this.setupEventListeners();
            this.isInitialized = true;
        } catch (error) {
            utils.handleError(error, 'Dashboard initialization');
        }
    }

    setupEventListeners() {
        // Quick action buttons
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // View full schedule button
        const viewScheduleBtn = document.getElementById('viewFullSchedule');
        if (viewScheduleBtn) {
            viewScheduleBtn.addEventListener('click', () => {
                window.app.showPage('schedule');
            });
        }
    }

    async loadDashboardData() {
        try {
            // Load analytics data
            const analyticsResponse = await api.getDashboardAnalytics(7);
            if (analyticsResponse.success) {
                this.analytics = analyticsResponse.analytics;
                this.updateOverviewStats();
                this.updateProgressBars();
                this.updateRecentAchievements();
            }

            // Load today's schedule
            const scheduleResponse = await api.getTodaySchedule();
            if (scheduleResponse.success) {
                this.todaySchedule = scheduleResponse.schedule;
                this.updateTodaySchedule();
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateOverviewStats() {
        if (!this.analytics) return;

        const { overview, streaks } = this.analytics;

        // Update stat values
        const totalTasks = document.getElementById('totalTasks');
        const completedTasks = document.getElementById('completedTasks');
        const studyStreak = document.getElementById('studyStreak');
        const studyHours = document.getElementById('studyHours');

        if (totalTasks) totalTasks.textContent = overview.totalTasks || 0;
        if (completedTasks) completedTasks.textContent = overview.completedTasks || 0;
        if (studyStreak) studyStreak.textContent = streaks.current || 0;
        if (studyHours) studyHours.textContent = `${overview.totalStudyTime || 0}h`;
    }

    updateProgressBars() {
        if (!this.analytics) return;

        const { overview } = this.analytics;
        
        // Daily progress (based on completion rate)
        const dailyProgress = document.getElementById('dailyProgress');
        const dailyProgressText = document.getElementById('dailyProgressText');
        
        if (dailyProgress && dailyProgressText) {
            const progress = overview.completionRate || 0;
            dailyProgress.style.width = `${progress}%`;
            dailyProgressText.textContent = `${progress}%`;
        }

        // Weekly progress (based on study time vs goal)
        const weeklyProgress = document.getElementById('weeklyProgress');
        const weeklyProgressText = document.getElementById('weeklyProgressText');
        
        if (weeklyProgress && weeklyProgressText) {
            // Assuming 14 hours weekly goal (2 hours * 7 days)
            const weeklyGoal = 14;
            const weeklyStudyTime = overview.totalStudyTime || 0;
            const progress = Math.min(Math.round((weeklyStudyTime / weeklyGoal) * 100), 100);
            
            weeklyProgress.style.width = `${progress}%`;
            weeklyProgressText.textContent = `${progress}%`;
        }
    }

    updateTodaySchedule() {
        const container = document.getElementById('todaySchedule');
        if (!container) return;

        if (this.todaySchedule.length === 0) {
            container.innerHTML = '<div class="no-data">No tasks scheduled for today</div>';
            return;
        }

        const scheduleHTML = this.todaySchedule.slice(0, 3).map(task => {
            const startTime = utils.formatTime(task.scheduled_start);
            const endTime = utils.formatTime(task.scheduled_end);
            const priorityColor = utils.getPriorityColor(task.priority);
            
            return `
                <div class="schedule-item" style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                    <div class="time-slot" style="min-width: 100px; font-size: 14px; color: var(--text-secondary);">
                        ${startTime} - ${endTime}
                    </div>
                    <div class="task-info" style="flex: 1; margin-left: 15px;">
                        <div class="task-title" style="font-weight: 500; margin-bottom: 2px;">${task.title}</div>
                        <div class="task-subject" style="font-size: 12px; color: var(--text-secondary);">${task.subject}</div>
                    </div>
                    <div class="priority-indicator" style="width: 8px; height: 8px; border-radius: 50%; background: ${priorityColor};"></div>
                </div>
            `;
        }).join('');

        container.innerHTML = scheduleHTML;
    }

    updateRecentAchievements() {
        const container = document.getElementById('recentAchievements');
        if (!container || !this.analytics) return;

        const achievements = this.analytics.recentAchievements || [];

        if (achievements.length === 0) {
            container.innerHTML = '<div class="no-data">No achievements yet</div>';
            return;
        }

        const achievementsHTML = achievements.slice(0, 3).map(achievement => `
            <div class="achievement-item" style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                <div class="achievement-icon" style="width: 40px; height: 40px; background: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin-right: 15px;">
                    <i class="fas fa-trophy"></i>
                </div>
                <div class="achievement-info">
                    <div class="achievement-name" style="font-weight: 500; margin-bottom: 2px;">${achievement.badge_name}</div>
                    <div class="achievement-desc" style="font-size: 12px; color: var(--text-secondary);">${achievement.description}</div>
                </div>
                <div class="achievement-date" style="font-size: 12px; color: var(--text-secondary); margin-left: auto;">
                    ${utils.formatDate(achievement.earned_at)}
                </div>
            </div>
        `).join('');

        container.innerHTML = achievementsHTML;
    }

    async loadDailyQuote() {
        try {
            const response = await api.getDailyQuote();
            if (response.success && response.quote) {
                const quoteContainer = document.getElementById('dailyQuote');
                if (quoteContainer) {
                    const quoteText = quoteContainer.querySelector('.quote-text');
                    const quoteAuthor = quoteContainer.querySelector('.quote-author');
                    
                    if (quoteText) quoteText.textContent = `"${response.quote.text}"`;
                    if (quoteAuthor) quoteAuthor.textContent = `— ${response.quote.author}`;
                }
            }
        } catch (error) {
            console.error('Error loading daily quote:', error);
        }
    }

    handleQuickAction(action) {
        switch (action) {
            case 'add-task':
                if (window.tasks) {
                    window.tasks.showAddTaskModal();
                }
                break;
            case 'start-timer':
                if (window.timer) {
                    window.app.showPage('timer');
                    window.timer.startQuickTimer();
                }
                break;
            case 'generate-schedule':
                this.generateAISchedule();
                break;
            default:
                console.log('Unknown quick action:', action);
        }
    }

    async generateAISchedule() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await api.generateSchedule(today);
            
            if (response.success) {
                utils.showToast('AI schedule generated successfully!', 'success');
                
                // Refresh today's schedule
                const scheduleResponse = await api.getTodaySchedule();
                if (scheduleResponse.success) {
                    this.todaySchedule = scheduleResponse.schedule;
                    this.updateTodaySchedule();
                }
                
                // Show schedule recommendations
                if (response.schedule.recommendations) {
                    const recommendations = response.schedule.recommendations.join('<br>');
                    utils.showModal(`
                        <div style="text-align: center;">
                            <i class="fas fa-magic" style="font-size: 48px; color: var(--primary-color); margin-bottom: 20px;"></i>
                            <h3>AI Schedule Generated!</h3>
                            <div style="margin: 20px 0; padding: 15px; background: var(--bg-secondary); border-radius: var(--border-radius);">
                                ${recommendations}
                            </div>
                            <button class="btn btn-primary" onclick="hideModal(); window.app.showPage('schedule');">
                                View Full Schedule
                            </button>
                        </div>
                    `, 'Smart Scheduling');
                }
            }
        } catch (error) {
            utils.handleError(error, 'AI Schedule Generation');
        }
    }

    async refresh() {
        await this.loadDashboardData();
        await this.loadDailyQuote();
    }
}

// Initialize dashboard manager
window.dashboard = new DashboardManager();
