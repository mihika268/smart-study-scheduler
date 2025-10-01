// Music Player UI Manager
class MusicUI {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.currentTab = 'music';
        this.currentPlaylist = null;
        this.currentAmbient = null;
        this.updateInterval = null;
    }

    init() {
        this.createMusicPlayerUI();
        this.setupEventListeners();
        this.loadSettings();
        console.log('🎵 Music UI initialized');
    }

    createMusicPlayerUI() {
        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'music-player-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-music"></i>';
        toggleBtn.id = 'musicPlayerToggle';
        document.body.appendChild(toggleBtn);

        // Create main music player
        const musicPlayer = document.createElement('div');
        musicPlayer.className = 'music-player';
        musicPlayer.id = 'musicPlayer';
        musicPlayer.innerHTML = this.getMusicPlayerHTML();
        document.body.appendChild(musicPlayer);

        // Create minimized player
        const minimizedPlayer = document.createElement('div');
        minimizedPlayer.className = 'music-player-minimized';
        minimizedPlayer.id = 'musicPlayerMinimized';
        minimizedPlayer.style.display = 'none';
        minimizedPlayer.innerHTML = this.getMinimizedPlayerHTML();
        document.body.appendChild(minimizedPlayer);
    }

    getMusicPlayerHTML() {
        return `
            <div class="music-player-header">
                <h3 class="music-player-title">
                    <i class="fas fa-music"></i> Study Sounds
                </h3>
                <button class="music-player-close" id="closeMusicPlayer">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="music-player-content">
                <div class="music-tabs">
                    <button class="music-tab active" data-tab="music">
                        <i class="fas fa-play"></i> Music
                    </button>
                    <button class="music-tab" data-tab="ambient">
                        <i class="fas fa-leaf"></i> Ambient
                    </button>
                    <button class="music-tab" data-tab="mixer">
                        <i class="fas fa-sliders-h"></i> Mixer
                    </button>
                </div>

                <!-- Music Section -->
                <div class="music-section active" id="musicSection">
                    <div class="now-playing" id="nowPlaying" style="display: none;">
                        <div class="now-playing-title" id="currentTrack">No track selected</div>
                        <div class="now-playing-artist" id="currentPlaylist">Select a playlist</div>
                        <div class="music-visualizer">
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                        </div>
                        <div class="music-controls">
                            <button class="music-control-btn" id="prevTrack">
                                <i class="fas fa-step-backward"></i>
                            </button>
                            <button class="music-control-btn play-pause" id="playPauseMusic">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="music-control-btn" id="nextTrack">
                                <i class="fas fa-step-forward"></i>
                            </button>
                            <button class="music-control-btn" id="stopMusic">
                                <i class="fas fa-stop"></i>
                            </button>
                        </div>
                    </div>

                    <div class="playlist-grid" id="playlistGrid">
                        ${this.getPlaylistsHTML()}
                    </div>
                </div>

                <!-- Ambient Section -->
                <div class="music-section" id="ambientSection">
                    <div class="ambient-grid" id="ambientGrid">
                        ${this.getAmbientSoundsHTML()}
                    </div>
                </div>

                <!-- Mixer Section -->
                <div class="music-section" id="mixerSection">
                    <div class="volume-controls">
                        <div class="volume-control">
                            <span class="volume-label">Music</span>
                            <input type="range" class="volume-slider" id="musicVolume" min="0" max="100" value="70">
                            <span class="volume-value" id="musicVolumeValue">70%</span>
                        </div>
                        <div class="volume-control">
                            <span class="volume-label">Ambient</span>
                            <input type="range" class="volume-slider" id="ambientVolume" min="0" max="100" value="50">
                            <span class="volume-value" id="ambientVolumeValue">50%</span>
                        </div>
                        <div class="volume-control">
                            <span class="volume-label">Master</span>
                            <input type="range" class="volume-slider" id="masterVolume" min="0" max="100" value="80">
                            <span class="volume-value" id="masterVolumeValue">80%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getMinimizedPlayerHTML() {
        return `
            <div class="minimized-info">
                <div class="minimized-title" id="minimizedTitle">Music Player</div>
                <div class="minimized-status" id="minimizedStatus">Ready</div>
            </div>
            <div class="minimized-controls">
                <button class="minimized-btn" id="minimizedPlay">
                    <i class="fas fa-play"></i>
                </button>
                <button class="minimized-btn" id="minimizedExpand">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        `;
    }

    getPlaylistsHTML() {
        const playlists = window.musicPlayer.getPlaylists();
        return Object.entries(playlists).map(([key, playlist]) => `
            <div class="playlist-item" data-playlist="${key}">
                <div class="playlist-icon">
                    <i class="fas ${this.getPlaylistIcon(key)}"></i>
                </div>
                <div class="playlist-name">${playlist.name}</div>
            </div>
        `).join('');
    }

    getAmbientSoundsHTML() {
        const sounds = window.musicPlayer.getAmbientSounds();
        return Object.entries(sounds).map(([key, sound]) => `
            <div class="ambient-item" data-ambient="${key}">
                <div class="ambient-icon">
                    <i class="${sound.icon}"></i>
                </div>
                <div class="ambient-name">${sound.name}</div>
            </div>
        `).join('');
    }

    getPlaylistIcon(playlist) {
        const icons = {
            focus: 'fa-brain',
            classical: 'fa-music',
            lofi: 'fa-headphones',
            nature: 'fa-leaf'
        };
        return icons[playlist] || 'fa-play';
    }

    setupEventListeners() {
        // Toggle button
        document.getElementById('musicPlayerToggle').addEventListener('click', () => {
            this.togglePlayer();
        });

        // Close button
        document.getElementById('closeMusicPlayer').addEventListener('click', () => {
            this.closePlayer();
        });

        // Tab switching
        document.querySelectorAll('.music-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Playlist selection
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const playlist = e.currentTarget.dataset.playlist;
                this.selectPlaylist(playlist);
            });
        });

        // Ambient sound selection
        document.querySelectorAll('.ambient-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const ambient = e.currentTarget.dataset.ambient;
                this.selectAmbientSound(ambient);
            });
        });

        // Music controls
        document.getElementById('playPauseMusic').addEventListener('click', () => {
            this.toggleMusic();
        });

        document.getElementById('stopMusic').addEventListener('click', () => {
            this.stopMusic();
        });

        document.getElementById('nextTrack').addEventListener('click', () => {
            this.nextTrack();
        });

        document.getElementById('prevTrack').addEventListener('click', () => {
            this.prevTrack();
        });

        // Volume controls
        ['music', 'ambient', 'master'].forEach(type => {
            const slider = document.getElementById(`${type}Volume`);
            const valueDisplay = document.getElementById(`${type}VolumeValue`);
            
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                window.musicPlayer.setVolume(type, value / 100);
                valueDisplay.textContent = `${value}%`;
            });
        });

        // Minimized player controls
        document.getElementById('minimizedPlay').addEventListener('click', () => {
            this.toggleMusic();
        });

        document.getElementById('minimizedExpand').addEventListener('click', () => {
            this.openPlayer();
        });

        document.getElementById('musicPlayerMinimized').addEventListener('click', () => {
            this.openPlayer();
        });
    }

    togglePlayer() {
        if (this.isOpen) {
            this.closePlayer();
        } else {
            this.openPlayer();
        }
    }

    openPlayer() {
        const player = document.getElementById('musicPlayer');
        const toggle = document.getElementById('musicPlayerToggle');
        const minimized = document.getElementById('musicPlayerMinimized');
        
        player.classList.add('open');
        toggle.style.display = 'none';
        minimized.style.display = 'none';
        this.isOpen = true;
        this.isMinimized = false;
    }

    closePlayer() {
        const player = document.getElementById('musicPlayer');
        const toggle = document.getElementById('musicPlayerToggle');
        const minimized = document.getElementById('musicPlayerMinimized');
        
        player.classList.remove('open');
        
        // Show minimized player if music is playing
        const status = window.musicPlayer.getCurrentStatus();
        if (status.isPlaying || status.currentAmbient) {
            minimized.style.display = 'flex';
            toggle.style.display = 'none';
            this.isMinimized = true;
            this.updateMinimizedPlayer();
        } else {
            toggle.style.display = 'block';
            minimized.style.display = 'none';
            this.isMinimized = false;
        }
        
        this.isOpen = false;
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.music-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.music-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${tabName}Section`).classList.add('active');

        this.currentTab = tabName;
    }

    selectPlaylist(playlist) {
        // Update UI
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-playlist="${playlist}"]`).classList.add('active');

        // Show now playing section
        document.getElementById('nowPlaying').style.display = 'block';
        
        // Update current playlist
        this.currentPlaylist = playlist;
        const playlists = window.musicPlayer.getPlaylists();
        document.getElementById('currentPlaylist').textContent = playlists[playlist].name;
        document.getElementById('currentTrack').textContent = playlists[playlist].tracks[0].name;

        // Start playing
        window.musicPlayer.playMusic(playlist, 0);
        this.updatePlayButton(true);
        this.updateToggleButton(true);
        
        // Start visualizer animation
        document.getElementById('musicPlayer').classList.add('playing');
    }

    selectAmbientSound(ambient) {
        // Update UI
        document.querySelectorAll('.ambient-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const clickedItem = document.querySelector(`[data-ambient="${ambient}"]`);
        
        if (this.currentAmbient === ambient) {
            // Stop current ambient sound
            window.musicPlayer.stopAmbientSound();
            this.currentAmbient = null;
        } else {
            // Start new ambient sound
            window.musicPlayer.playAmbientSound(ambient);
            clickedItem.classList.add('active');
            this.currentAmbient = ambient;
        }
        
        this.updateMinimizedPlayer();
    }

    toggleMusic() {
        const status = window.musicPlayer.getCurrentStatus();
        
        if (status.isPlaying) {
            window.musicPlayer.stopMusic();
            this.updatePlayButton(false);
            this.updateToggleButton(false);
            document.getElementById('musicPlayer').classList.remove('playing');
        } else if (this.currentPlaylist) {
            window.musicPlayer.playMusic(this.currentPlaylist, 0);
            this.updatePlayButton(true);
            this.updateToggleButton(true);
            document.getElementById('musicPlayer').classList.add('playing');
        }
    }

    stopMusic() {
        window.musicPlayer.stopMusic();
        this.updatePlayButton(false);
        this.updateToggleButton(false);
        document.getElementById('musicPlayer').classList.remove('playing');
        
        // Hide now playing if no ambient sound
        if (!this.currentAmbient) {
            document.getElementById('nowPlaying').style.display = 'none';
        }
    }

    nextTrack() {
        if (this.currentPlaylist) {
            const playlists = window.musicPlayer.getPlaylists();
            const tracks = playlists[this.currentPlaylist].tracks;
            const currentIndex = 0; // Simplified for demo
            const nextIndex = (currentIndex + 1) % tracks.length;
            
            window.musicPlayer.playMusic(this.currentPlaylist, nextIndex);
            document.getElementById('currentTrack').textContent = tracks[nextIndex].name;
        }
    }

    prevTrack() {
        if (this.currentPlaylist) {
            const playlists = window.musicPlayer.getPlaylists();
            const tracks = playlists[this.currentPlaylist].tracks;
            const currentIndex = 0; // Simplified for demo
            const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
            
            window.musicPlayer.playMusic(this.currentPlaylist, prevIndex);
            document.getElementById('currentTrack').textContent = tracks[prevIndex].name;
        }
    }

    updatePlayButton(isPlaying) {
        const playBtn = document.getElementById('playPauseMusic');
        const minimizedBtn = document.getElementById('minimizedPlay');
        
        if (isPlaying) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            minimizedBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            minimizedBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    updateToggleButton(isActive) {
        const toggle = document.getElementById('musicPlayerToggle');
        
        if (isActive) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }
    }

    updateMinimizedPlayer() {
        const status = window.musicPlayer.getCurrentStatus();
        const titleEl = document.getElementById('minimizedTitle');
        const statusEl = document.getElementById('minimizedStatus');
        
        if (status.isPlaying && this.currentPlaylist) {
            const playlists = window.musicPlayer.getPlaylists();
            titleEl.textContent = playlists[this.currentPlaylist].name;
            statusEl.textContent = 'Playing music';
        } else if (this.currentAmbient) {
            const sounds = window.musicPlayer.getAmbientSounds();
            titleEl.textContent = sounds[this.currentAmbient].name;
            statusEl.textContent = 'Playing ambient';
        } else {
            titleEl.textContent = 'Music Player';
            statusEl.textContent = 'Ready';
        }
    }

    loadSettings() {
        window.musicPlayer.loadSettings();
        const settings = window.musicPlayer.getCurrentStatus().volumes;
        
        // Update volume sliders
        document.getElementById('musicVolume').value = settings.musicVolume * 100;
        document.getElementById('ambientVolume').value = settings.ambientVolume * 100;
        document.getElementById('masterVolume').value = settings.masterVolume * 100;
        
        // Update value displays
        document.getElementById('musicVolumeValue').textContent = `${Math.round(settings.musicVolume * 100)}%`;
        document.getElementById('ambientVolumeValue').textContent = `${Math.round(settings.ambientVolume * 100)}%`;
        document.getElementById('masterVolumeValue').textContent = `${Math.round(settings.masterVolume * 100)}%`;
    }

    // Integration with study timer
    onStudySessionStart() {
        // Auto-start focus music if no music is playing
        const status = window.musicPlayer.getCurrentStatus();
        if (!status.isPlaying && !status.currentAmbient) {
            this.selectPlaylist('focus');
        }
    }

    onStudySessionEnd() {
        // Optionally stop music or switch to break music
        // This can be customized based on user preferences
    }

    onBreakStart() {
        // Switch to more relaxing music during breaks
        if (this.currentPlaylist === 'focus') {
            this.selectPlaylist('nature');
        }
    }
}

// Initialize music UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.musicUI = new MusicUI();
    window.musicUI.init();
});

// Integration with existing timer
if (window.timer) {
    const originalStartTimer = window.timer.startTimer;
    const originalPauseTimer = window.timer.pauseTimer;
    const originalResetTimer = window.timer.resetTimer;
    
    window.timer.startTimer = function() {
        originalStartTimer.call(this);
        if (window.musicUI) {
            window.musicUI.onStudySessionStart();
        }
    };
    
    window.timer.pauseTimer = function() {
        originalPauseTimer.call(this);
        if (window.musicUI) {
            window.musicUI.onStudySessionEnd();
        }
    };
    
    window.timer.resetTimer = function() {
        originalResetTimer.call(this);
        if (window.musicUI) {
            window.musicUI.onStudySessionEnd();
        }
    };
}
