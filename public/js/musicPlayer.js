// Music Player and Ambiance Manager
class MusicPlayer {
    constructor() {
        this.currentTrack = null;
        this.isPlaying = false;
        this.volume = 0.7;
        this.currentPlaylist = 'focus';
        this.audioContext = null;
        this.gainNode = null;
        this.isInitialized = false;
        
        // Ambient sound sources (using royalty-free URLs)
        this.ambientSounds = {
            rain: {
                name: 'Rain Sounds',
                url: 'https://www.soundjay.com/misc/sounds/rain-01.wav',
                icon: 'fas fa-cloud-rain',
                fallback: this.generateWhiteNoise.bind(this, 'rain')
            },
            forest: {
                name: 'Forest Ambiance',
                url: 'https://www.soundjay.com/nature/sounds/forest-01.wav',
                icon: 'fas fa-tree',
                fallback: this.generateWhiteNoise.bind(this, 'forest')
            },
            cafe: {
                name: 'Coffee Shop',
                url: 'https://www.soundjay.com/misc/sounds/cafe-01.wav',
                icon: 'fas fa-coffee',
                fallback: this.generateWhiteNoise.bind(this, 'cafe')
            },
            ocean: {
                name: 'Ocean Waves',
                url: 'https://www.soundjay.com/nature/sounds/ocean-01.wav',
                icon: 'fas fa-water',
                fallback: this.generateWhiteNoise.bind(this, 'ocean')
            },
            white: {
                name: 'White Noise',
                url: null,
                icon: 'fas fa-volume-up',
                fallback: this.generateWhiteNoise.bind(this, 'white')
            },
            pink: {
                name: 'Pink Noise',
                url: null,
                icon: 'fas fa-volume-down',
                fallback: this.generateWhiteNoise.bind(this, 'pink')
            }
        };

        // Focus music playlists
        this.musicPlaylists = {
            focus: {
                name: 'Deep Focus',
                tracks: [
                    { name: 'Concentration Flow', duration: 300, type: 'generated' },
                    { name: 'Study Rhythm', duration: 420, type: 'generated' },
                    { name: 'Mental Clarity', duration: 360, type: 'generated' }
                ]
            },
            classical: {
                name: 'Classical Study',
                tracks: [
                    { name: 'Peaceful Piano', duration: 480, type: 'generated' },
                    { name: 'Gentle Strings', duration: 390, type: 'generated' },
                    { name: 'Calm Composition', duration: 450, type: 'generated' }
                ]
            },
            lofi: {
                name: 'Lo-Fi Beats',
                tracks: [
                    { name: 'Chill Study Beats', duration: 240, type: 'generated' },
                    { name: 'Relaxed Vibes', duration: 320, type: 'generated' },
                    { name: 'Smooth Flow', duration: 280, type: 'generated' }
                ]
            },
            nature: {
                name: 'Nature Sounds',
                tracks: [
                    { name: 'Forest Meditation', duration: 600, type: 'generated' },
                    { name: 'River Flow', duration: 540, type: 'generated' },
                    { name: 'Mountain Breeze', duration: 480, type: 'generated' }
                ]
            }
        };

        this.currentAmbient = null;
        this.currentMusic = null;
        this.mixerSettings = {
            musicVolume: 0.7,
            ambientVolume: 0.5,
            masterVolume: 0.8
        };
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            
            this.isInitialized = true;
            console.log('🎵 Music Player initialized');
        } catch (error) {
            console.warn('Audio API not available, using fallback');
            this.isInitialized = false;
        }
    }

    // Generate procedural ambient sounds using Web Audio API
    generateWhiteNoise(type) {
        if (!this.audioContext) return null;

        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        switch (type) {
            case 'white':
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                break;
            case 'pink':
                let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    data[i] *= 0.11;
                    b6 = white * 0.115926;
                }
                break;
            case 'rain':
                // Simulate rain with filtered noise
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.sin(i * 0.01) * 0.3;
                }
                break;
            case 'ocean':
                // Simulate ocean waves with low-frequency oscillation
                for (let i = 0; i < bufferSize; i++) {
                    const wave = Math.sin(i * 0.001) * 0.5;
                    const noise = (Math.random() * 2 - 1) * 0.2;
                    data[i] = wave + noise;
                }
                break;
            default:
                // Default to white noise
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.mixerSettings.ambientVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return { source, gainNode };
    }

    // Generate procedural music using Web Audio API
    generateMusic(playlist, trackIndex) {
        if (!this.audioContext) return null;

        const track = this.musicPlaylists[playlist].tracks[trackIndex];
        const duration = track.duration;
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

        // Generate different types of music based on playlist
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            switch (playlist) {
                case 'focus':
                    this.generateFocusMusic(data, bufferSize);
                    break;
                case 'classical':
                    this.generateClassicalMusic(data, bufferSize);
                    break;
                case 'lofi':
                    this.generateLoFiMusic(data, bufferSize);
                    break;
                case 'nature':
                    this.generateNatureMusic(data, bufferSize);
                    break;
                default:
                    this.generateFocusMusic(data, bufferSize);
            }
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.mixerSettings.musicVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return { source, gainNode, duration };
    }

    generateFocusMusic(data, bufferSize) {
        // Generate calming sine waves with gentle harmonics
        const sampleRate = this.audioContext.sampleRate;
        const baseFreq = 220; // A3
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / sampleRate;
            let sample = 0;
            
            // Base tone
            sample += Math.sin(2 * Math.PI * baseFreq * t) * 0.3;
            // Fifth harmonic
            sample += Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * 0.2;
            // Octave
            sample += Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.1;
            
            // Add gentle modulation
            sample *= (1 + Math.sin(2 * Math.PI * 0.1 * t) * 0.1);
            
            // Fade in/out
            const fadeTime = sampleRate * 2; // 2 seconds
            if (i < fadeTime) {
                sample *= i / fadeTime;
            } else if (i > bufferSize - fadeTime) {
                sample *= (bufferSize - i) / fadeTime;
            }
            
            data[i] = sample * 0.3;
        }
    }

    generateClassicalMusic(data, bufferSize) {
        // Generate piano-like tones
        const sampleRate = this.audioContext.sampleRate;
        const notes = [261.63, 293.66, 329.63, 349.23, 392.00]; // C, D, E, F, G
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / sampleRate;
            let sample = 0;
            
            // Play different notes at different times
            const noteIndex = Math.floor(t * 0.5) % notes.length;
            const freq = notes[noteIndex];
            
            // Piano-like envelope
            const noteTime = (t * 0.5) % 2;
            const envelope = Math.exp(-noteTime * 2);
            
            sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
            
            data[i] = sample;
        }
    }

    generateLoFiMusic(data, bufferSize) {
        // Generate lo-fi beats with vinyl crackle
        const sampleRate = this.audioContext.sampleRate;
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / sampleRate;
            let sample = 0;
            
            // Bass line
            const bassFreq = 55; // A1
            sample += Math.sin(2 * Math.PI * bassFreq * t) * 0.4;
            
            // Add some higher harmonics
            sample += Math.sin(2 * Math.PI * bassFreq * 3 * t) * 0.2;
            
            // Add vinyl crackle (random noise)
            sample += (Math.random() * 2 - 1) * 0.05;
            
            // Low-pass filter effect
            if (i > 0) {
                sample = sample * 0.7 + data[i-1] * 0.3;
            }
            
            data[i] = sample * 0.3;
        }
    }

    generateNatureMusic(data, bufferSize) {
        // Generate nature-inspired tones
        const sampleRate = this.audioContext.sampleRate;
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / sampleRate;
            let sample = 0;
            
            // Wind-like sound
            sample += Math.sin(2 * Math.PI * 100 * t + Math.sin(2 * Math.PI * 0.5 * t)) * 0.2;
            
            // Bird-like chirps (occasional)
            if (Math.random() < 0.001) {
                const chirpFreq = 800 + Math.random() * 400;
                sample += Math.sin(2 * Math.PI * chirpFreq * t) * 0.3 * Math.exp(-t * 10);
            }
            
            // Water-like bubbling
            sample += Math.sin(2 * Math.PI * 200 * t) * Math.random() * 0.1;
            
            data[i] = sample * 0.4;
        }
    }

    async playAmbientSound(soundKey) {
        await this.init();
        
        if (this.currentAmbient) {
            this.stopAmbientSound();
        }

        const sound = this.ambientSounds[soundKey];
        if (!sound) return;

        try {
            // Try to use the fallback generator (always available)
            this.currentAmbient = sound.fallback();
            if (this.currentAmbient && this.currentAmbient.source) {
                this.currentAmbient.source.start();
                console.log(`🎵 Playing ambient sound: ${sound.name}`);
            }
        } catch (error) {
            console.warn('Failed to play ambient sound:', error);
        }
    }

    stopAmbientSound() {
        if (this.currentAmbient && this.currentAmbient.source) {
            try {
                this.currentAmbient.source.stop();
            } catch (error) {
                // Source might already be stopped
            }
            this.currentAmbient = null;
        }
    }

    async playMusic(playlist = 'focus', trackIndex = 0) {
        await this.init();
        
        if (this.currentMusic) {
            this.stopMusic();
        }

        try {
            this.currentMusic = this.generateMusic(playlist, trackIndex);
            if (this.currentMusic && this.currentMusic.source) {
                this.currentMusic.source.start();
                this.isPlaying = true;
                this.currentPlaylist = playlist;
                
                // Auto-play next track when current ends
                this.currentMusic.source.onended = () => {
                    const nextTrack = (trackIndex + 1) % this.musicPlaylists[playlist].tracks.length;
                    setTimeout(() => this.playMusic(playlist, nextTrack), 1000);
                };
                
                console.log(`🎵 Playing music: ${this.musicPlaylists[playlist].name} - Track ${trackIndex + 1}`);
            }
        } catch (error) {
            console.warn('Failed to play music:', error);
        }
    }

    stopMusic() {
        if (this.currentMusic && this.currentMusic.source) {
            try {
                this.currentMusic.source.stop();
            } catch (error) {
                // Source might already be stopped
            }
            this.currentMusic = null;
            this.isPlaying = false;
        }
    }

    setVolume(type, volume) {
        volume = Math.max(0, Math.min(1, volume));
        
        switch (type) {
            case 'music':
                this.mixerSettings.musicVolume = volume;
                if (this.currentMusic && this.currentMusic.gainNode) {
                    this.currentMusic.gainNode.gain.value = volume;
                }
                break;
            case 'ambient':
                this.mixerSettings.ambientVolume = volume;
                if (this.currentAmbient && this.currentAmbient.gainNode) {
                    this.currentAmbient.gainNode.gain.value = volume;
                }
                break;
            case 'master':
                this.mixerSettings.masterVolume = volume;
                if (this.gainNode) {
                    this.gainNode.gain.value = volume;
                }
                break;
        }
        
        // Save to localStorage
        utils.storage.set('musicSettings', this.mixerSettings);
    }

    loadSettings() {
        const saved = utils.storage.get('musicSettings');
        if (saved) {
            this.mixerSettings = { ...this.mixerSettings, ...saved };
        }
    }

    getPlaylists() {
        return this.musicPlaylists;
    }

    getAmbientSounds() {
        return this.ambientSounds;
    }

    getCurrentStatus() {
        return {
            isPlaying: this.isPlaying,
            currentPlaylist: this.currentPlaylist,
            currentAmbient: this.currentAmbient ? Object.keys(this.ambientSounds).find(key => 
                this.ambientSounds[key].fallback === this.currentAmbient.source
            ) : null,
            volumes: this.mixerSettings
        };
    }
}

// Initialize global music player
window.musicPlayer = new MusicPlayer();
