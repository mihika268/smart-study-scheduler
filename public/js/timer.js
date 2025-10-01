// Study Timer Manager
class TimerManager {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = null;
        this.timeRemaining = 0;
        this.timerInterval = null;
        this.currentTask = null;
        this.sessionType = 'study'; // 'study' or 'break'
        this.preferences = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        await this.loadTimerPage();
        await this.loadPreferences();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    async loadTimerPage() {
        const timerPage = document.getElementById('timerPage');
        if (!timerPage) return;

        timerPage.innerHTML = `
            <div class="timer-container" style="max-width: 600px; margin: 0 auto; text-align: center;">
                <div class="timer-header" style="margin-bottom: 30px;">
                    <h2>Study Timer</h2>
                    <p id="timerStatus" style="color: var(--text-secondary);">Ready to start your study session</p>
                </div>

                <div class="timer-display" style="background: var(--bg-primary); border-radius: var(--border-radius); padding: 40px; margin-bottom: 30px; box-shadow: var(--shadow);">
                    <div id="timerCircle" class="timer-circle" style="width: 200px; height: 200px; border-radius: 50%; border: 8px solid var(--border-color); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; background: var(--bg-secondary);">
                        <div id="timerTime" class="timer-time" style="font-size: 36px; font-weight: 600; color: var(--primary-color);">25:00</div>
                        <svg style="position: absolute; top: -8px; left: -8px; width: 216px; height: 216px; transform: rotate(-90deg);">
                            <circle id="timerProgress" cx="108" cy="108" r="100" stroke="var(--primary-color)" stroke-width="8" fill="none" stroke-dasharray="628" stroke-dashoffset="628" style="transition: stroke-dashoffset 1s ease;"></circle>
                        </svg>
                    </div>
                    
                    <div id="currentTaskInfo" class="current-task-info" style="margin-bottom: 20px; display: none;">
                        <h4 style="margin: 0 0 5px 0; color: var(--text-primary);">Current Task</h4>
                        <p id="currentTaskTitle" style="margin: 0; color: var(--text-secondary);"></p>
                    </div>

                    <div class="timer-controls" style="display: flex; gap: 15px; justify-content: center;">
                        <button id="startPauseBtn" class="btn btn-primary btn-lg">
                            <i class="fas fa-play"></i> Start
                        </button>
                        <button id="resetBtn" class="btn btn-secondary btn-lg">
                            <i class="fas fa-stop"></i> Reset
                        </button>
                        <button id="skipBtn" class="btn btn-outline btn-lg" style="display: none;">
                            <i class="fas fa-forward"></i> Skip
                        </button>
                    </div>
                </div>

                <div class="timer-options" style="background: var(--bg-primary); border-radius: var(--border-radius); padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow);">
                    <h3 style="margin-bottom: 20px;">Quick Start</h3>
                    <div class="quick-timers" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button class="quick-timer-btn" data-minutes="25">
                            <i class="fas fa-clock"></i>
                            <span>Pomodoro</span>
                            <small>25 min</small>
                        </button>
                        <button class="quick-timer-btn" data-minutes="15">
                            <i class="fas fa-coffee"></i>
                            <span>Short Study</span>
                            <small>15 min</small>
                        </button>
                        <button class="quick-timer-btn" data-minutes="45">
                            <i class="fas fa-book"></i>
                            <span>Deep Focus</span>
                            <small>45 min</small>
                        </button>
                        <button class="quick-timer-btn" data-minutes="5">
                            <i class="fas fa-pause"></i>
                            <span>Short Break</span>
                            <small>5 min</small>
                        </button>
                    </div>
                </div>

                <div class="session-tracking" style="background: var(--bg-primary); border-radius: var(--border-radius); padding: 20px; box-shadow: var(--shadow);">
                    <h3 style="margin-bottom: 20px;">Session Tracking</h3>
                    
                    <div class="mood-energy-section" id="moodEnergySection" style="display: none;">
                        <div class="form-row" style="display: flex; gap: 20px; margin-bottom: 15px;">
                            <div class="form-col">
                                <label>Mood Before (1-5)</label>
                                <div class="rating-buttons" data-field="mood">
                                    ${[1,2,3,4,5].map(i => `<button type="button" class="rating-btn" data-value="${i}">${i}</button>`).join('')}
                                </div>
                            </div>
                            <div class="form-col">
                                <label>Energy Level (1-5)</label>
                                <div class="rating-buttons" data-field="energy">
                                    ${[1,2,3,4,5].map(i => `<button type="button" class="rating-btn" data-value="${i}">${i}</button>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="session-end-section" id="sessionEndSection" style="display: none;">
                        <div class="form-row" style="display: flex; gap: 20px; margin-bottom: 15px;">
                            <div class="form-col">
                                <label>Mood After (1-5)</label>
                                <div class="rating-buttons" data-field="moodAfter">
                                    ${[1,2,3,4,5].map(i => `<button type="button" class="rating-btn" data-value="${i}">${i}</button>`).join('')}
                                </div>
                            </div>
                            <div class="form-col">
                                <label>Focus Rating (1-5)</label>
                                <div class="rating-buttons" data-field="focus">
                                    ${[1,2,3,4,5].map(i => `<button type="button" class="rating-btn" data-value="${i}">${i}</button>`).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="sessionNotes">Session Notes (optional)</label>
                            <textarea id="sessionNotes" rows="3" placeholder="How did this session go? Any insights?"></textarea>
                        </div>
                        <button id="completeSessionBtn" class="btn btn-primary">Complete Session</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Timer controls
        const startPauseBtn = document.getElementById('startPauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const skipBtn = document.getElementById('skipBtn');

        if (startPauseBtn) {
            startPauseBtn.addEventListener('click', () => this.toggleTimer());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetTimer());
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipSession());
        }

        // Quick timer buttons
        const quickTimerBtns = document.querySelectorAll('.quick-timer-btn');
        quickTimerBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const minutes = parseInt(e.currentTarget.dataset.minutes);
                this.setTimer(minutes);
            });
        });

        // Rating buttons
        const ratingButtons = document.querySelectorAll('.rating-btn');
        ratingButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const container = e.target.closest('.rating-buttons');
                const field = container.dataset.field;
                const value = parseInt(e.target.dataset.value);
                
                // Update button states
                container.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Store value
                if (!this.sessionData) this.sessionData = {};
                this.sessionData[field] = value;
            });
        });

        // Complete session button
        const completeSessionBtn = document.getElementById('completeSessionBtn');
        if (completeSessionBtn) {
            completeSessionBtn.addEventListener('click', () => this.completeSession());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (window.app.getCurrentPage() === 'timer') {
                if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                    e.preventDefault();
                    this.toggleTimer();
                } else if (e.code === 'Escape') {
                    this.resetTimer();
                }
            }
        });
    }

    async loadPreferences() {
        try {
            const response = await api.getPreferences();
            if (response.success) {
                this.preferences = response.preferences;
                this.setTimer(this.preferences.pomodoro_duration || 25);
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
            this.setTimer(25); // Default to 25 minutes
        }
    }

    setTimer(minutes, type = 'study') {
        if (this.isRunning) {
            this.resetTimer();
        }

        this.timeRemaining = minutes * 60;
        this.sessionType = type;
        this.updateDisplay();
        this.updateStatus(`${type === 'study' ? 'Study' : 'Break'} session ready: ${minutes} minutes`);
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    async startTimer() {
        if (!this.currentSession && this.sessionType === 'study') {
            // Start new study session
            await this.startStudySession();
        }

        this.isRunning = true;
        this.isPaused = false;
        
        // Show mood/energy section for new sessions
        if (!this.sessionData) {
            this.showMoodEnergySection();
        }

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();

            if (this.timeRemaining <= 0) {
                this.completeTimer();
            }
        }, 1000);

        this.updateControls();
        this.updateStatus(`${this.sessionType === 'study' ? 'Studying' : 'Break time'}...`);
    }

    pauseTimer() {
        this.isRunning = false;
        this.isPaused = true;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.updateControls();
        this.updateStatus('Timer paused');
    }

    resetTimer() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        const defaultMinutes = this.preferences?.pomodoro_duration || 25;
        this.setTimer(defaultMinutes);
        this.updateControls();
        this.hideMoodEnergySection();
        this.hideSessionEndSection();
        this.sessionData = null;
    }

    async completeTimer() {
        this.isRunning = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Play notification sound (if enabled)
        this.playNotificationSound();

        if (this.sessionType === 'study') {
            this.updateStatus('Study session completed! 🎉');
            this.showSessionEndSection();
        } else {
            this.updateStatus('Break time over! Ready for the next session?');
            this.suggestNextSession();
        }

        this.updateControls();
    }

    skipSession() {
        if (this.sessionType === 'study') {
            this.completeTimer();
        } else {
            this.resetTimer();
        }
    }

    async startStudySession() {
        try {
            const sessionData = {
                taskId: this.currentTask?.id || null,
                moodBefore: this.sessionData?.mood || null,
                energyLevel: this.sessionData?.energy || null
            };

            const response = await api.startStudySession(sessionData);
            
            if (response.success) {
                this.currentSession = { id: response.sessionId, startTime: new Date() };
            }
        } catch (error) {
            console.error('Error starting study session:', error);
        }
    }

    async completeSession() {
        if (!this.currentSession) return;

        const sessionNotes = document.getElementById('sessionNotes')?.value || '';
        
        const sessionData = {
            moodAfter: this.sessionData?.moodAfter || null,
            focusRating: this.sessionData?.focus || null,
            notes: sessionNotes,
            breakCount: 0 // Could be tracked if needed
        };

        const completeBtn = document.getElementById('completeSessionBtn');
        utils.setLoading(completeBtn, true);

        try {
            const response = await api.endStudySession(this.currentSession.id, sessionData);
            
            if (response.success) {
                utils.showToast(`Session completed! Duration: ${utils.formatDuration(response.duration)}`, 'success');
                this.currentSession = null;
                this.sessionData = null;
                this.hideSessionEndSection();
                this.suggestNextSession();
            }
        } catch (error) {
            utils.handleError(error, 'Completing session');
        } finally {
            utils.setLoading(completeBtn, false);
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerTime = document.getElementById('timerTime');
        if (timerTime) {
            timerTime.textContent = timeString;
        }

        // Update progress circle
        const timerProgress = document.getElementById('timerProgress');
        if (timerProgress) {
            const totalTime = this.sessionType === 'study' 
                ? (this.preferences?.pomodoro_duration || 25) * 60
                : (this.preferences?.short_break_duration || 5) * 60;
            const progress = (totalTime - this.timeRemaining) / totalTime;
            const circumference = 2 * Math.PI * 100; // radius = 100
            const offset = circumference - (progress * circumference);
            timerProgress.style.strokeDashoffset = offset;
        }

        // Update document title
        if (this.isRunning) {
            document.title = `${timeString} - Smart Study Scheduler`;
        } else {
            document.title = 'Smart Study Scheduler';
        }
    }

    updateControls() {
        const startPauseBtn = document.getElementById('startPauseBtn');
        const skipBtn = document.getElementById('skipBtn');
        
        if (startPauseBtn) {
            if (this.isRunning) {
                startPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                startPauseBtn.className = 'btn btn-warning btn-lg';
            } else {
                startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Start';
                startPauseBtn.className = 'btn btn-primary btn-lg';
            }
        }

        if (skipBtn) {
            skipBtn.style.display = this.isRunning ? 'inline-flex' : 'none';
        }
    }

    updateStatus(message) {
        const timerStatus = document.getElementById('timerStatus');
        if (timerStatus) {
            timerStatus.textContent = message;
        }
    }

    showMoodEnergySection() {
        const section = document.getElementById('moodEnergySection');
        if (section) {
            section.style.display = 'block';
        }
    }

    hideMoodEnergySection() {
        const section = document.getElementById('moodEnergySection');
        if (section) {
            section.style.display = 'none';
        }
    }

    showSessionEndSection() {
        const section = document.getElementById('sessionEndSection');
        if (section) {
            section.style.display = 'block';
        }
    }

    hideSessionEndSection() {
        const section = document.getElementById('sessionEndSection');
        if (section) {
            section.style.display = 'none';
        }
    }

    suggestNextSession() {
        const breakDuration = this.preferences?.short_break_duration || 5;
        
        setTimeout(() => {
            if (confirm(`Great work! Take a ${breakDuration}-minute break?`)) {
                this.setTimer(breakDuration, 'break');
                this.startTimer();
            } else {
                this.resetTimer();
            }
        }, 2000);
    }

    playNotificationSound() {
        // Create a simple beep sound
        if (this.preferences?.sound_enabled !== false) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    }

    startQuickTimer() {
        const defaultMinutes = this.preferences?.pomodoro_duration || 25;
        this.setTimer(defaultMinutes);
        this.startTimer();
    }

    startTaskTimer(taskId) {
        // Load task info and start timer
        api.getTask(taskId).then(response => {
            if (response.success) {
                this.currentTask = response.task;
                this.showCurrentTaskInfo();
                
                const duration = Math.min(response.task.estimated_duration, this.preferences?.pomodoro_duration || 25);
                this.setTimer(duration);
            }
        }).catch(console.error);
    }

    showCurrentTaskInfo() {
        if (!this.currentTask) return;

        const taskInfo = document.getElementById('currentTaskInfo');
        const taskTitle = document.getElementById('currentTaskTitle');
        
        if (taskInfo && taskTitle) {
            taskTitle.textContent = `${this.currentTask.subject}: ${this.currentTask.title}`;
            taskInfo.style.display = 'block';
        }
    }
}

// Add CSS for rating buttons and quick timer buttons
const timerStyles = document.createElement('style');
timerStyles.textContent = `
    .quick-timer-btn {
        background: var(--bg-secondary);
        border: 2px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: 15px;
        cursor: pointer;
        transition: var(--transition);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        min-width: 100px;
    }
    
    .quick-timer-btn:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
    }
    
    .quick-timer-btn i {
        font-size: 20px;
        margin-bottom: 5px;
    }
    
    .quick-timer-btn span {
        font-weight: 500;
        font-size: 14px;
    }
    
    .quick-timer-btn small {
        font-size: 12px;
        opacity: 0.8;
    }
    
    .rating-buttons {
        display: flex;
        gap: 5px;
        margin-top: 5px;
    }
    
    .rating-btn {
        width: 35px;
        height: 35px;
        border: 2px solid var(--border-color);
        background: var(--bg-secondary);
        border-radius: 50%;
        cursor: pointer;
        transition: var(--transition);
        font-weight: 500;
    }
    
    .rating-btn:hover,
    .rating-btn.active {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
    }
`;
document.head.appendChild(timerStyles);

// Initialize timer manager
window.timer = new TimerManager();
