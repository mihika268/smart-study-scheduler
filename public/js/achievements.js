// Achievements Manager
class AchievementsManager {
    constructor() {
        this.achievements = [];
        this.stats = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        await this.loadAchievementsPage();
        await this.loadAchievements();
        this.isInitialized = true;
    }

    async loadAchievementsPage() {
        const achievementsPage = document.getElementById('achievementsPage');
        if (!achievementsPage) return;

        achievementsPage.innerHTML = `
            <div class="achievements-header" style="text-align: center; margin-bottom: 40px;">
                <h2><i class="fas fa-trophy"></i> Achievements & Badges</h2>
                <p style="color: var(--text-secondary); margin-top: 10px;">Track your progress and celebrate your milestones!</p>
                
                <div class="achievements-stats" style="display: flex; justify-content: center; gap: 30px; margin-top: 30px; flex-wrap: wrap;">
                    <div class="stat-item" style="text-align: center;">
                        <span class="stat-value" id="totalAchievements" style="font-size: 24px; font-weight: 600; color: var(--primary-color); display: block;">0</span>
                        <span class="stat-label" style="font-size: 14px; color: var(--text-secondary);">Total Achievements</span>
                    </div>
                    <div class="stat-item" style="text-align: center;">
                        <span class="stat-value" id="uniqueBadges" style="font-size: 24px; font-weight: 600; color: var(--primary-color); display: block;">0</span>
                        <span class="stat-label" style="font-size: 14px; color: var(--text-secondary);">Unique Badges</span>
                    </div>
                    <div class="stat-item" style="text-align: center;">
                        <span class="stat-value" id="achievementRank" style="font-size: 24px; font-weight: 600; color: var(--primary-color); display: block;">Beginner</span>
                        <span class="stat-label" style="font-size: 14px; color: var(--text-secondary);">Current Rank</span>
                    </div>
                </div>
            </div>

            <div class="achievements-categories" style="margin-bottom: 30px;">
                <div class="category-tabs" style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                    <button class="category-tab active" data-category="all">All Achievements</button>
                    <button class="category-tab" data-category="study">Study Milestones</button>
                    <button class="category-tab" data-category="consistency">Consistency</button>
                    <button class="category-tab" data-category="focus">Focus & Quality</button>
                    <button class="category-tab" data-category="special">Special Events</button>
                </div>
            </div>

            <div class="achievements-grid" id="achievementsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                <!-- Achievements will be loaded here -->
            </div>

            <div class="progress-section" style="margin-top: 40px;">
                <h3 style="text-align: center; margin-bottom: 30px;">Progress Towards Next Achievements</h3>
                <div id="progressAchievements" class="progress-achievements">
                    <!-- Progress items will be loaded here -->
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Category tabs
        const categoryTabs = document.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                categoryTabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                const category = e.target.dataset.category;
                this.filterAchievements(category);
            });
        });
    }

    async loadAchievements() {
        try {
            const response = await api.getAchievements();
            if (response.success) {
                this.achievements = response.achievements;
                this.stats = response.stats;
                this.updateStats();
                this.renderAchievements();
                this.renderProgressAchievements();
            }
        } catch (error) {
            utils.handleError(error, 'Loading achievements');
        }
    }

    updateStats() {
        if (!this.stats) return;

        const totalAchievements = document.getElementById('totalAchievements');
        const uniqueBadges = document.getElementById('uniqueBadges');
        const achievementRank = document.getElementById('achievementRank');

        if (totalAchievements) {
            totalAchievements.textContent = this.stats.total || 0;
        }

        if (uniqueBadges) {
            uniqueBadges.textContent = this.stats.uniqueBadges || 0;
        }

        if (achievementRank) {
            const rank = this.calculateRank(this.stats.total || 0);
            achievementRank.textContent = rank;
        }
    }

    calculateRank(totalAchievements) {
        if (totalAchievements >= 50) return 'Master';
        if (totalAchievements >= 25) return 'Expert';
        if (totalAchievements >= 15) return 'Advanced';
        if (totalAchievements >= 8) return 'Intermediate';
        if (totalAchievements >= 3) return 'Novice';
        return 'Beginner';
    }

    renderAchievements() {
        const grid = document.getElementById('achievementsGrid');
        if (!grid) return;

        if (this.achievements.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-trophy" style="font-size: 48px; color: var(--text-secondary); opacity: 0.5; margin-bottom: 20px;"></i>
                    <h3>No achievements yet</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">Start studying to earn your first achievement!</p>
                    <button class="btn btn-primary" onclick="window.app.showPage('timer')">
                        <i class="fas fa-play"></i> Start Studying
                    </button>
                </div>
            `;
            return;
        }

        // Group achievements by type for better organization
        const groupedAchievements = this.groupAchievementsByType();
        
        let achievementsHTML = '';
        
        // Add earned achievements
        if (this.achievements.length > 0) {
            achievementsHTML += this.achievements.map(achievement => 
                this.renderAchievementCard(achievement, true)
            ).join('');
        }

        // Add some example unearned achievements for motivation
        const unearnedAchievements = this.getUnearnedAchievements();
        achievementsHTML += unearnedAchievements.map(achievement => 
            this.renderAchievementCard(achievement, false)
        ).join('');

        grid.innerHTML = achievementsHTML;
    }

    groupAchievementsByType() {
        const groups = {};
        this.achievements.forEach(achievement => {
            const type = achievement.badge_type;
            if (!groups[type]) groups[type] = [];
            groups[type].push(achievement);
        });
        return groups;
    }

    getUnearnedAchievements() {
        const earnedTypes = new Set(this.achievements.map(a => a.badge_type));
        
        const allAchievements = [
            { badge_type: 'first_session', badge_name: 'Getting Started', description: 'Complete your first study session', category: 'study' },
            { badge_type: 'streak_3', badge_name: '3-Day Warrior', description: 'Study for 3 consecutive days', category: 'consistency' },
            { badge_type: 'streak_7', badge_name: 'Week Champion', description: 'Study for 7 consecutive days', category: 'consistency' },
            { badge_type: 'streak_30', badge_name: 'Month Master', description: 'Study for 30 consecutive days', category: 'consistency' },
            { badge_type: 'focus_master', badge_name: 'Focus Master', description: 'Maintain high focus for 10 sessions', category: 'focus' },
            { badge_type: 'marathon', badge_name: 'Marathon Studier', description: 'Complete a 2+ hour study session', category: 'study' },
            { badge_type: 'early_bird', badge_name: 'Early Bird', description: 'Study before 7 AM for 5 days', category: 'special' },
            { badge_type: 'night_owl', badge_name: 'Night Owl', description: 'Study after 10 PM for 5 days', category: 'special' },
            { badge_type: 'task_master', badge_name: 'Task Master', description: 'Complete 50 tasks', category: 'study' },
            { badge_type: 'subject_expert', badge_name: 'Subject Expert', description: 'Study one subject for 20 hours', category: 'study' },
            { badge_type: 'perfectionist', badge_name: 'Perfectionist', description: 'Complete 10 tasks with 100% accuracy', category: 'focus' },
            { badge_type: 'speed_demon', badge_name: 'Speed Demon', description: 'Complete 5 tasks faster than estimated', category: 'focus' }
        ];

        return allAchievements.filter(a => !earnedTypes.has(a.badge_type)).slice(0, 8);
    }

    renderAchievementCard(achievement, isEarned) {
        const earnedDate = isEarned && achievement.earned_at ? 
            utils.formatDate(achievement.earned_at) : null;

        const cardClass = isEarned ? 'achievement-card earned' : 'achievement-card unearned';
        const iconColor = isEarned ? 'var(--primary-color)' : 'var(--text-secondary)';
        const opacity = isEarned ? '1' : '0.6';

        return `
            <div class="${cardClass}" style="background: var(--bg-primary); border-radius: var(--border-radius); padding: 20px; box-shadow: var(--shadow); text-align: center; opacity: ${opacity}; position: relative; overflow: hidden;">
                ${isEarned ? '<div class="achievement-glow" style="position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; background: linear-gradient(45deg, var(--primary-color), var(--success-color)); border-radius: var(--border-radius); z-index: -1;"></div>' : ''}
                
                <div class="achievement-icon" style="width: 60px; height: 60px; background: ${iconColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: white; font-size: 24px;">
                    <i class="${this.getAchievementIcon(achievement.badge_type)}"></i>
                </div>
                
                <h3 style="margin: 0 0 10px 0; color: var(--text-primary);">${achievement.badge_name}</h3>
                <p style="margin: 0 0 15px 0; color: var(--text-secondary); font-size: 14px; line-height: 1.4;">${achievement.description}</p>
                
                ${isEarned ? `
                    <div class="achievement-date" style="font-size: 12px; color: var(--success-color); font-weight: 500;">
                        <i class="fas fa-check-circle"></i> Earned ${earnedDate}
                    </div>
                ` : `
                    <div class="achievement-progress" style="font-size: 12px; color: var(--text-secondary);">
                        <i class="fas fa-lock"></i> Not yet earned
                    </div>
                `}
                
                ${isEarned ? '<div class="achievement-sparkle" style="position: absolute; top: 10px; right: 10px; color: var(--warning-color); font-size: 16px;"><i class="fas fa-star"></i></div>' : ''}
            </div>
        `;
    }

    getAchievementIcon(badgeType) {
        const icons = {
            first_session: 'fas fa-play',
            streak_3: 'fas fa-fire',
            streak_7: 'fas fa-fire',
            streak_30: 'fas fa-fire',
            focus_master: 'fas fa-eye',
            marathon: 'fas fa-running',
            early_bird: 'fas fa-sun',
            night_owl: 'fas fa-moon',
            task_master: 'fas fa-tasks',
            subject_expert: 'fas fa-graduation-cap',
            perfectionist: 'fas fa-star',
            speed_demon: 'fas fa-bolt'
        };
        return icons[badgeType] || 'fas fa-trophy';
    }

    renderProgressAchievements() {
        const container = document.getElementById('progressAchievements');
        if (!container) return;

        // Mock progress data - in a real app, this would come from the API
        const progressItems = [
            {
                name: 'Week Champion',
                description: 'Study for 7 consecutive days',
                current: 3,
                target: 7,
                icon: 'fas fa-fire'
            },
            {
                name: 'Focus Master',
                description: 'Maintain high focus for 10 sessions',
                current: 6,
                target: 10,
                icon: 'fas fa-eye'
            },
            {
                name: 'Task Master',
                description: 'Complete 50 tasks',
                current: 23,
                target: 50,
                icon: 'fas fa-tasks'
            }
        ];

        if (progressItems.length === 0) {
            container.innerHTML = `
                <div class="no-progress" style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    All available achievements unlocked! Keep studying for more rewards.
                </div>
            `;
            return;
        }

        const progressHTML = progressItems.map(item => {
            const percentage = Math.round((item.current / item.target) * 100);
            
            return `
                <div class="progress-item" style="background: var(--bg-primary); border-radius: var(--border-radius); padding: 20px; margin-bottom: 15px; box-shadow: var(--shadow);">
                    <div class="progress-header" style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <div class="progress-icon" style="width: 40px; height: 40px; background: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                            <i class="${item.icon}"></i>
                        </div>
                        <div class="progress-info" style="flex: 1;">
                            <h4 style="margin: 0 0 5px 0; color: var(--text-primary);">${item.name}</h4>
                            <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">${item.description}</p>
                        </div>
                        <div class="progress-stats" style="text-align: right;">
                            <div style="font-weight: 600; color: var(--primary-color);">${item.current}/${item.target}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${percentage}%</div>
                        </div>
                    </div>
                    <div class="progress-bar" style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
                        <div class="progress-fill" style="height: 100%; background: var(--primary-color); width: ${percentage}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = progressHTML;
    }

    filterAchievements(category) {
        const cards = document.querySelectorAll('.achievement-card');
        
        cards.forEach(card => {
            if (category === 'all') {
                card.style.display = 'block';
            } else {
                // In a real implementation, you'd filter based on achievement categories
                // For now, show all cards
                card.style.display = 'block';
            }
        });
    }

    async refresh() {
        await this.loadAchievements();
    }
}

// Add CSS for achievements
const achievementsStyles = document.createElement('style');
achievementsStyles.textContent = `
    .category-tab {
        background: var(--bg-secondary);
        border: 2px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: 8px 16px;
        cursor: pointer;
        transition: var(--transition);
        font-size: 14px;
    }
    
    .category-tab:hover,
    .category-tab.active {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
    }
    
    .achievement-card.earned {
        transform: scale(1.02);
        border: 2px solid var(--primary-color);
    }
    
    .achievement-card.unearned {
        border: 2px solid var(--border-color);
    }
    
    .achievement-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }
    
    @keyframes sparkle {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.2); }
    }
    
    .achievement-sparkle {
        animation: sparkle 2s infinite;
    }
`;
document.head.appendChild(achievementsStyles);

// Initialize achievements manager
window.achievements = new AchievementsManager();
