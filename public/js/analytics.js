// Analytics Manager
class AnalyticsManager {
    constructor() {
        this.charts = {};
        this.analyticsData = null;
        this.patterns = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        await this.loadAnalyticsPage();
        await this.loadAnalyticsData();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    async loadAnalyticsPage() {
        const analyticsPage = document.getElementById('analyticsPage');
        if (!analyticsPage) return;

        analyticsPage.innerHTML = `
            <div class="analytics-header" style="margin-bottom: 30px;">
                <h2>Study Analytics</h2>
                <div class="period-selector" style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="period-btn active" data-period="7">7 Days</button>
                    <button class="period-btn" data-period="30">30 Days</button>
                    <button class="period-btn" data-period="90">90 Days</button>
                </div>
            </div>

            <div class="analytics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div class="analytics-card">
                    <div class="card-header">
                        <h3><i class="fas fa-chart-pie"></i> Overview</h3>
                    </div>
                    <div class="card-content">
                        <div class="overview-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                            <div class="stat-item">
                                <span class="stat-value" id="totalStudyTime">0h</span>
                                <span class="stat-label">Total Study Time</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="completionRate">0%</span>
                                <span class="stat-label">Completion Rate</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="avgSessionLength">0m</span>
                                <span class="stat-label">Avg Session</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="productivityScore">0</span>
                                <span class="stat-label">Productivity Score</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="analytics-card">
                    <div class="card-header">
                        <h3><i class="fas fa-fire"></i> Streaks & Goals</h3>
                    </div>
                    <div class="card-content">
                        <div class="streaks-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                            <div class="stat-item">
                                <span class="stat-value" id="currentStreak">0</span>
                                <span class="stat-label">Current Streak</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="longestStreak">0</span>
                                <span class="stat-label">Longest Streak</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="totalStudyDays">0</span>
                                <span class="stat-label">Total Study Days</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="weeklyGoalProgress">0%</span>
                                <span class="stat-label">Weekly Goal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="charts-section">
                <div class="charts-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
                    <div class="chart-card">
                        <div class="card-header">
                            <h3><i class="fas fa-chart-line"></i> Daily Study Time</h3>
                        </div>
                        <div class="card-content">
                            <div class="chart-container">
                                <canvas id="dailyStudyChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="chart-card">
                        <div class="card-header">
                            <h3><i class="fas fa-chart-bar"></i> Subject Performance</h3>
                        </div>
                        <div class="card-content">
                            <div class="chart-container">
                                <canvas id="subjectChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="chart-card">
                        <div class="card-header">
                            <h3><i class="fas fa-clock"></i> Hourly Productivity</h3>
                        </div>
                        <div class="card-content">
                            <div class="chart-container">
                                <canvas id="hourlyChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="chart-card">
                        <div class="card-header">
                            <h3><i class="fas fa-calendar-week"></i> Weekly Patterns</h3>
                        </div>
                        <div class="card-content">
                            <div class="chart-container">
                                <canvas id="weeklyChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="insights-section" style="margin-top: 30px;">
                <div class="insights-card" style="background: var(--bg-primary); border-radius: var(--border-radius); padding: 20px; box-shadow: var(--shadow);">
                    <div class="card-header">
                        <h3><i class="fas fa-lightbulb"></i> AI Insights & Recommendations</h3>
                    </div>
                    <div class="card-content">
                        <div id="aiInsights" class="insights-list">
                            <div class="loading-insights">Analyzing your study patterns...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Period selector buttons
        const periodBtns = document.querySelectorAll('.period-btn');
        periodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active button
                periodBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Reload data with new period
                const period = e.target.dataset.period;
                this.loadAnalyticsData(period);
            });
        });
    }

    async loadAnalyticsData(period = '7') {
        try {
            // Load dashboard analytics
            const analyticsResponse = await api.getDashboardAnalytics(period);
            if (analyticsResponse.success) {
                this.analyticsData = analyticsResponse.analytics;
                this.updateOverviewStats();
                this.updateStreaksStats();
                this.createCharts();
            }

            // Load study patterns
            const patternsResponse = await api.getStudyPatterns(period);
            if (patternsResponse.success) {
                this.patterns = patternsResponse.patterns;
                this.updateInsights();
            }

        } catch (error) {
            utils.handleError(error, 'Loading analytics data');
        }
    }

    updateOverviewStats() {
        if (!this.analyticsData) return;

        const { overview } = this.analyticsData;

        const elements = {
            totalStudyTime: document.getElementById('totalStudyTime'),
            completionRate: document.getElementById('completionRate'),
            avgSessionLength: document.getElementById('avgSessionLength'),
            productivityScore: document.getElementById('productivityScore')
        };

        if (elements.totalStudyTime) {
            elements.totalStudyTime.textContent = `${overview.totalStudyTime || 0}h`;
        }
        if (elements.completionRate) {
            elements.completionRate.textContent = `${overview.completionRate || 0}%`;
        }
        if (elements.avgSessionLength) {
            elements.avgSessionLength.textContent = `${overview.avgSessionLength || 0}m`;
        }
        if (elements.productivityScore) {
            elements.productivityScore.textContent = overview.productivityScore || 0;
        }
    }

    updateStreaksStats() {
        if (!this.analyticsData) return;

        const { streaks } = this.analyticsData;

        const elements = {
            currentStreak: document.getElementById('currentStreak'),
            longestStreak: document.getElementById('longestStreak'),
            totalStudyDays: document.getElementById('totalStudyDays'),
            weeklyGoalProgress: document.getElementById('weeklyGoalProgress')
        };

        if (elements.currentStreak) {
            elements.currentStreak.textContent = streaks.current || 0;
        }
        if (elements.longestStreak) {
            elements.longestStreak.textContent = streaks.longest || 0;
        }
        if (elements.totalStudyDays) {
            elements.totalStudyDays.textContent = streaks.totalDays || 0;
        }
        if (elements.weeklyGoalProgress) {
            // Calculate weekly progress (assuming 14 hours weekly goal)
            const weeklyGoal = 14;
            const totalTime = this.analyticsData.overview.totalStudyTime || 0;
            const progress = Math.min(Math.round((totalTime / weeklyGoal) * 100), 100);
            elements.weeklyGoalProgress.textContent = `${progress}%`;
        }
    }

    createCharts() {
        this.createDailyStudyChart();
        this.createSubjectChart();
        this.createHourlyChart();
        this.createWeeklyChart();
    }

    createDailyStudyChart() {
        const ctx = document.getElementById('dailyStudyChart');
        if (!ctx || !this.analyticsData) return;

        // Destroy existing chart
        if (this.charts.daily) {
            this.charts.daily.destroy();
        }

        const dailyData = this.analyticsData.dailyProgress || [];
        const labels = dailyData.map(d => utils.formatDate(d.date, { month: 'short', day: 'numeric' }));
        const studyTimes = dailyData.map(d => d.studyTime || 0);

        this.charts.daily = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Study Hours',
                    data: studyTimes,
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    }
                }
            }
        });
    }

    createSubjectChart() {
        const ctx = document.getElementById('subjectChart');
        if (!ctx || !this.analyticsData) return;

        if (this.charts.subject) {
            this.charts.subject.destroy();
        }

        const subjectData = this.analyticsData.subjectPerformance || [];
        const labels = subjectData.map(s => s.subject);
        const completionRates = subjectData.map(s => s.completionRate || 0);

        this.charts.subject = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: completionRates,
                    backgroundColor: [
                        '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', 
                        '#ec4899', '#ef4444', '#6b7280'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createHourlyChart() {
        const ctx = document.getElementById('hourlyChart');
        if (!ctx || !this.patterns) return;

        if (this.charts.hourly) {
            this.charts.hourly.destroy();
        }

        const hourlyData = this.patterns.hourlyProductivity || [];
        const labels = hourlyData.map(h => `${h.hour}:00`);
        const focusRatings = hourlyData.map(h => h.avgFocus || 0);

        this.charts.hourly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Focus',
                    data: focusRatings,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'var(--primary-color)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        title: {
                            display: true,
                            text: 'Focus Rating (1-5)'
                        }
                    }
                }
            }
        });
    }

    createWeeklyChart() {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx || !this.patterns) return;

        if (this.charts.weekly) {
            this.charts.weekly.destroy();
        }

        const weeklyData = this.patterns.weeklyPatterns || [];
        const labels = weeklyData.map(w => w.dayOfWeek);
        const studyTimes = weeklyData.map(w => w.totalDuration || 0);

        this.charts.weekly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Study Hours',
                    data: studyTimes,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'var(--success-color)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    }
                }
            }
        });
    }

    updateInsights() {
        const insightsContainer = document.getElementById('aiInsights');
        if (!insightsContainer || !this.patterns) return;

        const insights = this.generateInsights();
        
        if (insights.length === 0) {
            insightsContainer.innerHTML = `
                <div class="no-insights">
                    <p>Keep studying to unlock personalized insights!</p>
                </div>
            `;
            return;
        }

        const insightsHTML = insights.map(insight => `
            <div class="insight-item" style="display: flex; align-items: flex-start; gap: 15px; padding: 15px; background: var(--bg-secondary); border-radius: var(--border-radius); margin-bottom: 15px;">
                <div class="insight-icon" style="width: 40px; height: 40px; background: ${insight.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
                    <i class="${insight.icon}"></i>
                </div>
                <div class="insight-content">
                    <h4 style="margin: 0 0 5px 0; color: var(--text-primary);">${insight.title}</h4>
                    <p style="margin: 0; color: var(--text-secondary); line-height: 1.5;">${insight.description}</p>
                    ${insight.action ? `<button class="btn btn-sm btn-primary" style="margin-top: 10px;" onclick="${insight.action}">${insight.actionText}</button>` : ''}
                </div>
            </div>
        `).join('');

        insightsContainer.innerHTML = insightsHTML;
    }

    generateInsights() {
        const insights = [];
        
        if (!this.patterns || !this.analyticsData) return insights;

        // Most productive time insight
        if (this.patterns.mostProductiveHours && this.patterns.mostProductiveHours.length > 0) {
            const topHour = this.patterns.mostProductiveHours[0];
            const timeString = topHour < 12 ? `${topHour}:00 AM` : `${topHour - 12 || 12}:00 PM`;
            
            insights.push({
                title: 'Peak Performance Time',
                description: `Your most productive time is around ${timeString}. Consider scheduling your most challenging tasks during this window.`,
                icon: 'fas fa-clock',
                color: '#3b82f6',
                action: 'window.app.showPage("schedule")',
                actionText: 'Optimize Schedule'
            });
        }

        // Study streak insight
        const currentStreak = this.analyticsData.streaks?.current || 0;
        if (currentStreak >= 7) {
            insights.push({
                title: 'Consistency Champion',
                description: `Amazing! You've maintained a ${currentStreak}-day study streak. Consistency is key to long-term success.`,
                icon: 'fas fa-fire',
                color: '#f59e0b'
            });
        } else if (currentStreak === 0) {
            insights.push({
                title: 'Fresh Start Opportunity',
                description: 'Start a new study streak today! Even 15 minutes of focused study can make a difference.',
                icon: 'fas fa-play',
                color: '#10b981',
                action: 'window.app.showPage("timer")',
                actionText: 'Start Timer'
            });
        }

        // Session length insight
        const avgSessionLength = this.patterns.averageSessionLength || 0;
        if (avgSessionLength < 20) {
            insights.push({
                title: 'Extend Your Sessions',
                description: 'Your average session is quite short. Try the Pomodoro technique (25-minute sessions) for better focus and retention.',
                icon: 'fas fa-stopwatch',
                color: '#8b5cf6',
                action: 'window.app.showPage("timer")',
                actionText: 'Try Pomodoro'
            });
        } else if (avgSessionLength > 60) {
            insights.push({
                title: 'Break It Down',
                description: 'Long sessions can lead to fatigue. Consider breaking them into smaller chunks with regular breaks.',
                icon: 'fas fa-pause',
                color: '#ec4899'
            });
        }

        // Completion rate insight
        const completionRate = this.analyticsData.overview?.completionRate || 0;
        if (completionRate < 60) {
            insights.push({
                title: 'Task Completion Focus',
                description: 'Your task completion rate could be improved. Try setting smaller, more achievable goals to build momentum.',
                icon: 'fas fa-target',
                color: '#ef4444',
                action: 'window.app.showPage("tasks")',
                actionText: 'Review Tasks'
            });
        } else if (completionRate >= 80) {
            insights.push({
                title: 'Excellent Progress',
                description: `Outstanding! You're completing ${completionRate}% of your tasks. Keep up the great work!`,
                icon: 'fas fa-star',
                color: '#10b981'
            });
        }

        // Weekly pattern insight
        if (this.patterns.weeklyPatterns) {
            const weeklyData = this.patterns.weeklyPatterns;
            const mostProductiveDay = weeklyData.reduce((max, day) => 
                day.totalDuration > (max?.totalDuration || 0) ? day : max, null);
            
            if (mostProductiveDay) {
                insights.push({
                    title: 'Weekly Pattern',
                    description: `${mostProductiveDay.dayOfWeek} is your most productive day. Consider scheduling important tasks then.`,
                    icon: 'fas fa-calendar-check',
                    color: '#6b7280'
                });
            }
        }

        return insights.slice(0, 5); // Limit to 5 insights
    }

    async refresh() {
        const activePeriod = document.querySelector('.period-btn.active')?.dataset.period || '7';
        await this.loadAnalyticsData(activePeriod);
    }
}

// Add CSS for analytics components
const analyticsStyles = document.createElement('style');
analyticsStyles.textContent = `
    .period-btn {
        background: var(--bg-secondary);
        border: 2px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: 8px 16px;
        cursor: pointer;
        transition: var(--transition);
        font-size: 14px;
    }
    
    .period-btn:hover,
    .period-btn.active {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
    }
    
    .analytics-card,
    .chart-card {
        background: var(--bg-primary);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        overflow: hidden;
    }
    
    .chart-container {
        position: relative;
        height: 300px;
        padding: 10px;
    }
    
    .loading-insights {
        text-align: center;
        color: var(--text-secondary);
        padding: 20px;
        font-style: italic;
    }
`;
document.head.appendChild(analyticsStyles);

// Initialize analytics manager
window.analytics = new AnalyticsManager();
